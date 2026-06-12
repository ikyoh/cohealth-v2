"use client";
import { Clock, GripVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
// import "./styles.css";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCombinedQueries, useGetCollection, useGetIRI } from "@/hooks/useQuery";
import { request } from "@/utils/axios.utils";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "@/utils/dayjs.config";
import { useSearchParams } from "next/navigation";

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const BLOCKS_PER_HOUR = 4;
const MINUTES_PER_BLOCK = 15;
const CALENDAR_TIMEZONE = "Europe/Paris";
const DAY_COLUMN_UNITS = 12;
const GRID_COLUMNS = 7 * DAY_COLUMN_UNITS;
const WEEK_COLS = {
  lg: GRID_COLUMNS,
  md: GRID_COLUMNS,
  sm: GRID_COLUMNS,
  xs: GRID_COLUMNS,
  xxs: GRID_COLUMNS,
};

const getCalendarDate = (value) => {
  if (dayjs.isDayjs(value)) {
    return value.tz(CALENDAR_TIMEZONE)
  }

  if (value && typeof value === "object" && typeof value.date === "string") {
    if (value.isException) {
      return dayjs(value.date).tz(CALENDAR_TIMEZONE)
    }

    // RRule returns the intended wall-clock time but labels it as UTC.
    return dayjs.tz(value.date, CALENDAR_TIMEZONE)
  }

  return dayjs(value).tz(CALENDAR_TIMEZONE)
}
const formatOccurrenceDate = (value) =>
  getCalendarDate(value).format("YYYY-MM-DDTHH:mm:ss")
const rangesOverlap = (first, second) => first.y < second.y + second.h && second.y < first.y + first.h
const getIri = (value) => typeof value === "string" ? value : value?.["@id"] || value?.iri
const getServiceKey = (service) =>
  service?.["@id"] || service?.uuid || String(service?.id || `${service?.family}-${service?.name}`)

const assignOverlapLanes = (items) => {
  const positionedItems = [];

  for (let day = 0; day < 7; day += 1) {
    const dayItems = items
      .filter(item => item.x === day)
      .sort((first, second) => first.y - second.y || first.h - second.h);
    let cluster = [];
    let clusterEnd = -1;

    const positionCluster = () => {
      if (cluster.length === 0) return;

      const laneEnds = [];
      const assignedItems = cluster.map(item => {
        let lane = laneEnds.findIndex(end => end <= item.y);

        if (lane === -1) {
          lane = laneEnds.length;
          laneEnds.push(item.y + item.h);
        } else {
          laneEnds[lane] = item.y + item.h;
        }

        return { item, lane };
      });
      const laneCount = Math.max(laneEnds.length, 1);

      assignedItems.forEach(({ item, lane }) => {
        const laneStart = Math.floor((lane * DAY_COLUMN_UNITS) / laneCount);
        const laneEnd = Math.floor(((lane + 1) * DAY_COLUMN_UNITS) / laneCount);

        positionedItems.push({
          ...item,
          day,
          x: day * DAY_COLUMN_UNITS + laneStart,
          w: Math.max(1, laneEnd - laneStart),
          overlapCount: cluster.length,
        });
      });
    };

    dayItems.forEach(item => {
      if (cluster.length > 0 && item.y >= clusterEnd) {
        positionCluster();
        cluster = [];
        clusterEnd = -1;
      }

      cluster.push(item);
      clusterEnd = Math.max(clusterEnd, item.y + item.h);
    });

    positionCluster();
  }

  return positionedItems;
};

export default function GridWeek({ mission }) {

  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const date = searchParams.get('date') || dayjs().format('YYYY-MM-DD')
  const selectedPatient = searchParams.get('patient') || ""
  const selectedCooperatorKey = searchParams.getAll('cooperator').sort().join(',')
  const selectedCooperators = useMemo(
    () => selectedCooperatorKey ? selectedCooperatorKey.split(',') : [],
    [selectedCooperatorKey],
  )
  const startOfWeek = useMemo(() => dayjs(date).startOf('isoWeek'), [date]); // Lundi de la semaine actuelle
  const endOfWeek = useMemo(() => dayjs(date).endOf('isoWeek'), [date]); // Dimanche de la semaine actuelle
  const compactType = "vertical";

  // const { data, isLoading, errors, isSuccess, isError } = useGetCollection({ entity: "events", searchParams: `beginDate[after]=${startOfWeek.subtract(1, 'day').format('YYYY-MM-DD')}&endDate[before]=${endOfWeek.add(1, 'day').format('YYYY-MM-DD')}` });
  const eventSearchParams = new URLSearchParams({ week: date })
  if (mission) {
    eventSearchParams.set("mission", mission)
  }
  const { data, isLoading, isSuccess } = useGetCollection({
    entity: "events",
    searchParams: eventSearchParams.toString(),
  });
  const { data: currentUser } = useGetIRI("/current_user");
  const { data: missionData } = useGetIRI(mission || "");
  const { data: servicesData, isLoading: isLoadingServices } = useGetCollection({
    entity: "services",
    searchParams: "pagination=false",
  });
  const missionOwnerIris = (missionData?.owners || [])
    .filter(owner => typeof owner === "string");
  const embeddedMissionCooperators = (missionData?.owners || [])
    .filter(owner => typeof owner === "object");
  const { data: fetchedMissionCooperators = [] } = useCombinedQueries(missionOwnerIris);
  const missionCooperators = [
    ...embeddedMissionCooperators,
    ...fetchedMissionCooperators.filter(Boolean),
  ];

  const [mounted, setmounted] = useState(false);
  const [layout, setlayout] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingOccurrence, setEditingOccurrence] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [createForm, setCreateForm] = useState(null);
  const [createServiceFamily, setCreateServiceFamily] = useState("all");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const layouts = useMemo(() => ({
    lg: layout,
    md: layout,
    sm: layout,
    xs: layout,
    xxs: layout,
  }), [layout]);
  const isPrimaryEvent = (event) => {
    const currentUserIri = currentUser?.iri

    if (!currentUserIri) {
      return false
    }

    return getIri(event.owner) === currentUserIri
      && (!event.cooperators || event.cooperators.length === 0)
  }

  const missionOwnerIri = getIri(missionData?.owner)
  const isMissionOwner = missionOwnerIri && missionOwnerIri === currentUser?.iri
  const availableServices = servicesData?.member || []
  const serviceFamilies = [...new Set(
    availableServices.map(service => service.family).filter(Boolean)
  )].sort((first, second) => first.localeCompare(second, "fr"))
  const filteredCreateServices = availableServices.filter(service =>
    createServiceFamily === "all" || service.family === createServiceFamily
  )
  const selectedCreateServices = availableServices.filter(service =>
    createForm?.serviceKeys?.includes(getServiceKey(service))
  )
  const createDuration = selectedCreateServices.reduce(
    (duration, service) => duration + Number(service.duration || 0),
    0,
  )

  const openCreateEvent = (event) => {
    if (!mission || !missionData) return

    const bounds = event.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(bounds.width - 1, event.clientX - bounds.left))
    const y = Math.max(0, Math.min(1439, event.clientY - bounds.top))
    const day = Math.floor((x / bounds.width) * 7)
    const block = Math.floor(y / 15)
    const beginDate = startOfWeek
      .add(day, "day")
      .startOf("day")
      .add(block * MINUTES_PER_BLOCK, "minute")

    setCreateError("")
    setCreateServiceFamily("all")
    setCreateForm({
      beginDate: beginDate.format("YYYY-MM-DDTHH:mm"),
      cooperatorIri: isMissionOwner ? "unassigned" : currentUser?.iri || "",
      serviceKeys: [],
    })
  }

  const createEvent = async () => {
    if (!createForm || selectedCreateServices.length === 0 || createDuration <= 0) return

    setIsCreating(true)
    setCreateError("")

    try {
      const beginDate = dayjs.tz(createForm.beginDate, CALENDAR_TIMEZONE)
      const cooperator = missionCooperators.find(
        item => getIri(item) === createForm.cooperatorIri
      )
      const services = selectedCreateServices.map(service => {
        const nextService = { ...service }

        if (cooperator) {
          nextService.cooperator = cooperator
        } else {
          delete nextService.cooperator
        }

        return nextService
      })
      const patientName = getPatientNameFromMission(missionData)

      await request({
        url: "/events",
        method: "post",
        data: {
          mission,
          title: patientName || "Intervention",
          description: "",
          beginDate: beginDate.toISOString(),
          endDate: beginDate.add(createDuration, "minute").toISOString(),
          duration: createDuration,
          isAllday: false,
          services,
        },
      })

      await refreshEvents()
      setCreateForm(null)
    } catch (error) {
      setCreateError(error?.response?.data?.detail || "La création de l’événement a échoué.")
    } finally {
      setIsCreating(false)
    }
  }

  const EventItem = ({ item }) => {

    const event = item.events?.[0] || data?.member?.find(ev => ev.uuid === item.i.split('_')[0])
    if (!event) return null
    const patientName = event.patientFullName || getPatientNameFromMission(event.mission)
    const groupedEventsCount = item.events?.length || 1

    return (

      <div
        className="min-w-0 h-full w-full cursor-pointer px-1 py-0 text-[9px] leading-tight"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedItem(item);
        }}
      >
        <div className="truncate font-medium text-xs">{patientName || event.title}</div>
        {/* {groupedEventsCount > 1 && (
          <div className="truncate opacity-90">
            {groupedEventsCount} événements regroupés
          </div>
        )} */}
      </div>

    )
  }


  const getPatientNameFromMission = (mission) => {
    if (!mission || typeof mission === "string" || !mission.patient || typeof mission.patient === "string") {
      return null
    }

    return [mission.patient.lastname, mission.patient.firstname].filter(Boolean).join(" ")
  }

  const getMissionKey = (event) => {
    if (!event.mission) {
      return event.uuid
    }

    if (typeof event.mission === "string") {
      return event.mission
    }

    return event.mission["@id"] || event.mission.uuid || event.uuid
  }

  const getEventPatientUuid = (event) => {
    if (event.patientUuid) {
      return event.patientUuid
    }

    if (!event.mission || typeof event.mission === "string" || !event.mission.patient || typeof event.mission.patient === "string") {
      return null
    }

    return event.mission.patient.uuid || null
  }

  const getEventParticipantUuids = (event) => {
    const participantIris = [
      getIri(event.owner),
      ...(event.cooperators || []).map(getIri),
      ...(event.services || []).map(service => getIri(service.cooperator)),
    ].filter(Boolean)

    return new Set(participantIris.map(iri => iri.split("/").pop()))
  }

  const getEventCooperatorKey = (event) => {
    const cooperatorIris = [
      ...(event.cooperators || []).map(getIri),
      ...(event.services || []).map(service => getIri(service.cooperator)),
    ].filter(Boolean)

    const cooperatorUuids = [...new Set(
      cooperatorIris.map(iri => iri.split("/").pop()),
    )].sort()

    return cooperatorUuids.length > 0
      ? cooperatorUuids.join(",")
      : "without-cooperator"
  }

  const matchesSelectedCooperators = (event) => {
    if (selectedCooperators.length === 0) {
      return true
    }

    const participantUuids = getEventParticipantUuids(event)

    return selectedCooperators.some(uuid => participantUuids.has(uuid))
  }

  const selectedOccurrences = selectedItem?.occurrences || [];
  const selectedEvent = selectedOccurrences[0]?.event;
  const selectedPatientName = selectedEvent?.patientFullName || getPatientNameFromMission(selectedEvent?.mission);
  const selectedServicesCount = selectedOccurrences.reduce(
    (count, occurrence) => count + (occurrence.event.services?.length || 0),
    0,
  );

  const getEventDuration = (event) => {
    const explicitDuration = Number(event.duration || 0)

    if (explicitDuration > 0) {
      return explicitDuration
    }

    const servicesDuration = event.services?.reduce(
      (duration, service) => duration + Number(service.duration || 0),
      0,
    ) || 0;

    if (servicesDuration > 0) {
      return servicesDuration;
    }

    const beginDate = getCalendarDate(event.beginDate);
    const endDate = getCalendarDate(event.endDate);
    const duration = endDate.diff(beginDate, "minute");

    return duration > 0 ? duration : MINUTES_PER_BLOCK;
  }

  const formatOccurrenceSchedule = (occurrence) => {
    const beginDate = occurrence.occurrenceDate;
    const endDate = beginDate.add(getEventDuration(occurrence.event), "minute");

    return {
      date: beginDate.format("dddd D MMMM YYYY"),
      time: `${beginDate.format("HH:mm")} - ${endDate.format("HH:mm")}`,
    };
  }

  const calcY = (date) => {
    const eventDate = getCalendarDate(date)
    if (!eventDate.isValid()) return 0

    return eventDate.hour() * BLOCKS_PER_HOUR + Math.floor(eventDate.minute() / MINUTES_PER_BLOCK)
  }

  const calcX = (date) => {
    const eventDate = getCalendarDate(date)
    if (!eventDate.isValid()) return 0

    return eventDate.isoWeekday() - 1
  }

  const calcHeight = (event) => {
    return Math.max(1, Math.ceil(getEventDuration(event) / MINUTES_PER_BLOCK))
  }

  const calcEventsHeight = (events, fallbackHeight = 1) => {
    const totalDuration = events.reduce(
      (duration, event) => duration + getEventDuration(event),
      0,
    )

    if (totalDuration > 0) {
      return Math.max(1, Math.ceil(totalDuration / MINUTES_PER_BLOCK))
    }

    return Math.max(fallbackHeight, ...events.map(calcHeight), 1)
  }

  const createEventOccurrences = (event) => {
    if (!event.recurrentEvents) {
      return [{
        event,
        occurrenceDate: getCalendarDate(event.beginDate),
        missionKey: getMissionKey(event),
        cooperatorKey: getEventCooperatorKey(event),
        i: event.uuid,
        x: calcX(event.beginDate),
        y: calcY(event.beginDate),
        h: calcHeight(event),
      }]
    }

    return JSON.parse(event.recurrentEvents)
      .filter(rEvent => getCalendarDate(rEvent).isBetween(startOfWeek, endOfWeek, null, "[]"))
      .map((rEvent, index) => {
        const occurrenceDate = getCalendarDate(rEvent)
        const exceptionDuration = rEvent.isException && rEvent.endDate
          ? getCalendarDate({ ...rEvent, date: rEvent.endDate })
            .diff(occurrenceDate, "minute")
          : null
        const occurrenceEvent = rEvent.isException
          ? {
            ...event,
            title: rEvent.title ?? event.title,
            description: rEvent.description ?? event.description,
            isAllday: rEvent.isAllday ?? event.isAllday,
            services: rEvent.services ?? event.services,
            duration: exceptionDuration > 0
              ? exceptionDuration
              : event.duration,
          }
          : event

        return {
          event: occurrenceEvent,
          occurrenceDate,
          originalDate: getCalendarDate(rEvent.originalDate || rEvent.date),
          originalDateValue: rEvent.originalDate || rEvent.date,
          isException: !!rEvent.isException,
          missionKey: getMissionKey(event),
          cooperatorKey: getEventCooperatorKey(occurrenceEvent),
          i: event.uuid + "_" + index,
          x: calcX(occurrenceDate),
          y: calcY(occurrenceDate),
          h: calcHeight(occurrenceEvent),
        }
      })
  }

  const groupOverlappingOccurrences = (occurrences) => {
    return occurrences
      .sort((first, second) => first.x - second.x || first.y - second.y)
      .reduce((groups, occurrence) => {
        let group = groups.find(item =>
          item.missionKey === occurrence.missionKey &&
          item.cooperatorKey === occurrence.cooperatorKey &&
          item.x === occurrence.x &&
          rangesOverlap(item, occurrence)
        )

        if (!group) {
          groups.push({
            ...occurrence,
            occurrences: [occurrence],
            ids: [occurrence.i],
          })

          return groups
        }

        const endY = Math.max(group.y + group.h, occurrence.y + occurrence.h)
        group.y = Math.min(group.y, occurrence.y)
        group.occurrences.push(occurrence)
        group.ids.push(occurrence.i)
        group.i = group.ids.join("__")
        group.h = calcEventsHeight(group.occurrences.map(item => item.event), endY - group.y)

        let linkedGroup = groups.find(item =>
          item !== group &&
          item.missionKey === group.missionKey &&
          item.cooperatorKey === group.cooperatorKey &&
          item.x === group.x &&
          rangesOverlap(item, group)
        )

        while (linkedGroup) {
          const mergedEndY = Math.max(group.y + group.h, linkedGroup.y + linkedGroup.h)
          group.y = Math.min(group.y, linkedGroup.y)
          group.occurrences.push(...linkedGroup.occurrences)
          group.ids.push(...linkedGroup.ids)
          group.i = group.ids.join("__")
          group.h = calcEventsHeight(group.occurrences.map(item => item.event), mergedEndY - group.y)
          groups.splice(groups.indexOf(linkedGroup), 1)
          linkedGroup = groups.find(item =>
            item !== group &&
            item.missionKey === group.missionKey &&
            item.cooperatorKey === group.cooperatorKey &&
            item.x === group.x &&
            rangesOverlap(item, group)
          )
        }

        return groups
      }, [])
      .map(group => ({
        i: group.i,
        x: group.x,
        y: group.y,
        w: 1,
        h: group.h,
        isResizable: false,
        events: group.occurrences.map(occurrence => occurrence.event),
        occurrences: group.occurrences,
      }))
  }

  useEffect(() => {
    if (isSuccess && !isLoading) {
      const events = data?.member || []
      const patientEvents = selectedPatient ? events.filter(event => getEventPatientUuid(event) === selectedPatient) : events
      const filteredEvents = patientEvents.filter(matchesSelectedCooperators)
      const occurrences = filteredEvents.filter(f => !f.isAllday).flatMap(createEventOccurrences)
      const groupedOccurrences = groupOverlappingOccurrences(occurrences)
      const newLayout = assignOverlapLanes(groupedOccurrences)
      setlayout(newLayout)
      setmounted(true);
    }
  }, [data, endOfWeek, isSuccess, isLoading, selectedCooperatorKey, selectedPatient, startOfWeek]);

  useEffect(() => {
    setSelectedItem(null)
  }, [date, selectedCooperatorKey, selectedPatient]);

  const refreshEvents = () =>
    queryClient.invalidateQueries({ queryKey: ["events"] })

  const getOccurrenceEnd = (occurrence, beginDate = occurrence.occurrenceDate) =>
    beginDate.add(getEventDuration(occurrence.event), "minute")

  const shiftRecurrenceRule = (rule, deltaMinutes) => {
    if (!rule || deltaMinutes === 0) return rule

    return rule.replace(
      /(DTSTART:|UNTIL=)(\d{8}T\d{6})/g,
      (_match, prefix, value) =>
        `${prefix}${dayjs(value, "YYYYMMDDTHHmmss").add(deltaMinutes, "minute").format("YYYYMMDDTHHmmss")}`,
    )
  }

  const patchSeries = async (occurrence, changes) => {
    const event = occurrence.event
    const deltaMinutes = changes.beginDate
      ? dayjs(changes.beginDate).diff(occurrence.occurrenceDate, "minute")
      : 0
    const payload = {
      iri: event["@id"] || `/events/${event.uuid}`,
      ...(changes.title !== undefined && { title: changes.title }),
      ...(changes.description !== undefined && { description: changes.description }),
      ...(changes.isAllday !== undefined && { isAllday: changes.isAllday }),
      ...(changes.duration !== undefined && { duration: Number(changes.duration) }),
    }

    if (!event.recurrenceRule) {
      const beginDate = changes.beginDate
        ? dayjs(changes.beginDate)
        : occurrence.occurrenceDate
      const duration = Number(changes.duration || getEventDuration(event))

      if (changes.beginDate) {
        payload.beginDate = beginDate.toISOString()
      }

      payload.endDate = beginDate.add(duration, "minute").toISOString()
    } else if (deltaMinutes !== 0) {
      payload.beginDate = getCalendarDate(event.beginDate).add(deltaMinutes, "minute").toISOString()
      payload.endDate = getCalendarDate(event.endDate).add(deltaMinutes, "minute").toISOString()
      payload.recurrenceRule = shiftRecurrenceRule(event.recurrenceRule, deltaMinutes)
    }

    await request({
      url: payload.iri,
      method: "patch",
      data: Object.fromEntries(Object.entries(payload).filter(([key]) => key !== "iri")),
    })
  }

  const updateOccurrence = async (occurrence, changes) => {
    const beginDate = changes.beginDate
      ? dayjs(changes.beginDate)
      : occurrence.occurrenceDate
    const duration = Number(changes.duration || getEventDuration(occurrence.event))

    await request({
      url: `/events/${occurrence.event.uuid}/occurrence`,
      method: "post",
      data: {
        action: "update",
        originalDate: occurrence.originalDateValue
          || formatOccurrenceDate(occurrence.originalDate || occurrence.occurrenceDate),
        beginDate: formatOccurrenceDate(beginDate),
        endDate: formatOccurrenceDate(beginDate.add(duration, "minute")),
        ...(changes.title !== undefined && { title: changes.title }),
        ...(changes.description !== undefined && { description: changes.description }),
        ...(changes.isAllday !== undefined && { isAllday: changes.isAllday }),
      },
    })
  }

  const executePendingAction = async (scope) => {
    if (!pendingAction) return

    setIsSaving(true)
    setActionError("")

    try {
      for (const item of pendingAction.items) {
        const appliesToSeries = scope === "series" && !item.isException
        const itemChanges = pendingAction.deltaMinutes === undefined
          ? pendingAction.changes
          : {
            ...pendingAction.changes,
            beginDate: item.occurrenceDate
              .add(pendingAction.deltaMinutes, "minute")
              .toISOString(),
          }

        if (pendingAction.type === "delete") {
          if (appliesToSeries || !item.event.recurrenceRule) {
            await request({
              url: item.event["@id"] || `/events/${item.event.uuid}`,
              method: "delete",
              data: undefined,
            })
          } else {
            await request({
              url: `/events/${item.event.uuid}/occurrence`,
              method: "post",
              data: {
                action: "delete",
                originalDate: item.originalDateValue
                  || formatOccurrenceDate(item.originalDate || item.occurrenceDate),
              },
            })
          }
        } else if (appliesToSeries || !item.event.recurrenceRule) {
          await patchSeries(item, itemChanges)
        } else {
          await updateOccurrence(item, itemChanges)
        }
      }

      await refreshEvents()
      setPendingAction(null)
      setEditingOccurrence(null)
      setSelectedItem(null)
    } catch (error) {
      setActionError(error?.response?.data?.detail || "La modification a échoué.")
    } finally {
      setIsSaving(false)
    }
  }

  const cancelPendingAction = async () => {
    setPendingAction(null)
    setActionError("")
    await refreshEvents()
  }

  const onDragStop = async (_layout, oldItem, newItem) => {
    const movedItem = layout.find(item => item.i === newItem.i)
    const occurrences = movedItem?.occurrences || []

    if (occurrences.length === 0) return

    const day = Math.floor(newItem.x / DAY_COLUMN_UNITS)
    const beginDate = startOfWeek
      .add(day, "day")
      .startOf("day")
      .add(newItem.y * MINUTES_PER_BLOCK, "minute")
    const deltaMinutes = beginDate.diff(occurrences[0].occurrenceDate, "minute")

    if (!occurrences.some(item => !!item.event.recurrenceRule)) {
      setIsSaving(true)
      setActionError("")

      try {
        for (const occurrence of occurrences) {
          await patchSeries(occurrence, {
            beginDate: occurrence.occurrenceDate
              .add(deltaMinutes, "minute")
              .toISOString(),
          })
        }

        await refreshEvents()
      } catch (error) {
        setActionError(error?.response?.data?.detail || "Le déplacement a échoué.")
        setlayout(currentLayout => currentLayout.map(item =>
          item.i === oldItem.i
            ? { ...item, x: oldItem.x, y: oldItem.y }
            : item
        ))
      } finally {
        setIsSaving(false)
      }

      return
    }

    setPendingAction({
      type: "update",
      items: occurrences,
      changes: {},
      deltaMinutes,
      recurring: occurrences.some(item => !!item.event.recurrenceRule && !item.isException),
    })
  };

  const onDrop = (layout, layoutItem, _event) => {
    console.log("DROP", layoutItem, _event)
  }

  return (
    <>
      {mission && (
        <div
          className="absolute top-[71px] left-0 z-10 h-[1440px] w-full cursor-crosshair"
          onClick={openCreateEvent}
          aria-label="Ajouter un événement"
        />
      )}
      <div
        className="absolute top-[71px] left-0 z-20 w-full"
        onClick={openCreateEvent}
      >
        <ResponsiveReactGridLayout
          rowHeight={15}
          maxRows={96}
          cols={WEEK_COLS}
          margin={[0, 0]}
          containerPadding={[0, 0]}
          layouts={layouts}
          onLayoutChange={(nextLayout) => {
            setlayout(currentLayout => nextLayout.map(nextItem => ({
              ...currentLayout.find(currentItem => currentItem.i === nextItem.i),
              ...nextItem,
            })));
          }}
          onDragStop={onDragStop}
          // WidthProvider option
          measureBeforeMount={false}
          // I like to have it animate on mount. If you don't, delete `useCSSTransforms` (it's default `true`)
          // and set `measureBeforeMount={true}`.
          useCSSTransforms={mounted}
          preventCollision={!compactType}
          isDroppable={false}
          droppingItem={{ i: "xx", h: 12, w: 96 }}
          verticalCompact={false}
          draggableHandle=".drag-handle"
          allowOverlap={true}
          onDrop={onDrop}
        >
          {layout.map((item) => {
            const isPrimaryItem = item.events?.length > 0 && item.events.every(isPrimaryEvent)
            const hasConcurrentEvents = item.overlapCount > 1

            return (
              <div
                key={item.i}
                data-grid={item}
                title={hasConcurrentEvents ? `${item.overlapCount} événements simultanés` : undefined}
                onClick={event => event.stopPropagation()}
                className={`flex items-start justify-between overflow-hidden rounded border shadow-sm ${isPrimaryItem
                  ? "border-primary bg-primary text-seconcary-foreground"
                  : "bg-secondary/70 text-secondary-foreground"
                  }`}
              >
                <EventItem item={item} />
                <div className="drag-handle flex h-full w-5 shrink-0 items-center justify-end pr-[2px] hover:cursor-move">
                  <GripVertical size={12} />
                </div>
              </div>
            )
          })}
        </ResponsiveReactGridLayout >
      </div >
      <Dialog
        open={!!createForm}
        onOpenChange={(open) => {
          if (!open) {
            setCreateForm(null)
            setCreateError("")
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Ajouter un événement</DialogTitle>
            <DialogDescription>
              Sélectionnez les services à réaliser. La durée est calculée automatiquement.
            </DialogDescription>
          </DialogHeader>
          {createForm && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-event-begin">Début</Label>
                <Input
                  id="create-event-begin"
                  type="datetime-local"
                  value={createForm.beginDate}
                  onChange={event => setCreateForm(current => ({
                    ...current,
                    beginDate: event.target.value,
                  }))}
                />
              </div>
              {isMissionOwner && (
                <div className="space-y-2">
                  <Label>Cooperator</Label>
                  <Select
                    value={createForm.cooperatorIri}
                    onValueChange={cooperatorIri => setCreateForm(current => ({
                      ...current,
                      cooperatorIri,
                    }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Non attribué" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Non attribué</SelectItem>
                      {missionCooperators.map(cooperator => {
                        const iri = getIri(cooperator)

                        return (
                          <SelectItem key={iri} value={iri}>
                            {[cooperator.firstname, cooperator.lastname].filter(Boolean).join(" ") || iri}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Services</Label>
                <Select
                  value={createServiceFamily}
                  onValueChange={setCreateServiceFamily}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filtrer par famille" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les familles</SelectItem>
                    {serviceFamilies.map(family => (
                      <SelectItem key={family} value={family}>
                        {family}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border p-3">
                  {filteredCreateServices.map((service) => {
                    const serviceKey = getServiceKey(service)
                    const checked = createForm.serviceKeys.includes(serviceKey)

                    return (
                      <label
                        key={serviceKey}
                        className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-muted"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(nextChecked) => setCreateForm(current => ({
                            ...current,
                            serviceKeys: nextChecked
                              ? [...current.serviceKeys, serviceKey]
                              : current.serviceKeys.filter(key => key !== serviceKey),
                          }))}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">{service.name}</span>
                          <span className="text-muted-foreground block text-xs">
                            {service.duration} min
                          </span>
                        </span>
                      </label>
                    )
                  })}
                  {isLoadingServices && (
                    <p className="text-muted-foreground text-sm">
                      Chargement des services…
                    </p>
                  )}
                  {!isLoadingServices && filteredCreateServices.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                      Aucun service n’est disponible dans cette famille.
                    </p>
                  )}
                </div>
              </div>
              <div className="rounded-md bg-muted px-3 py-2 text-sm">
                Durée totale : <strong>{createDuration} minutes</strong>
              </div>
              {createError && (
                <p className="text-destructive text-sm">{createError}</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="cancel"
              disabled={isCreating}
              onClick={() => setCreateForm(null)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              loading={isCreating}
              disabled={isCreating || selectedCreateServices.length === 0 || createDuration <= 0}
              onClick={createEvent}
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-h-[calc(100vh-100px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPatientName || "Services"}</DialogTitle>
            <DialogDescription>
              {selectedServicesCount} service{selectedServicesCount > 1 ? "s" : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedOccurrences.length > 0 ? (
            <div className="space-y-4">
              {selectedOccurrences.map((occurrence, occurrenceIndex) => {
                const schedule = formatOccurrenceSchedule(occurrence);

                return (
                  <div key={`${occurrence.i}_${occurrenceIndex}`} className="space-y-2">
                    <div className="bg-muted flex items-center gap-3 rounded-md px-3 py-2">
                      <Clock className="size-4 shrink-0" />
                      <div>
                        <div className="text-sm font-medium capitalize">{schedule.date}</div>
                        <div className="text-muted-foreground text-xs">{schedule.time}</div>
                      </div>
                    </div>
                    {(occurrence.event.services || []).map((service, serviceIndex) => (
                      <div
                        key={`${occurrence.i}_${serviceIndex}_${service.name}`}
                        className="rounded-md border px-3 py-2 text-sm"
                      >
                        <div>{service.name}</div>
                        {service.cooperator && (
                          <div className="text-muted-foreground text-xs">
                            {[service.cooperator.firstname, service.cooperator.lastname].filter(Boolean).join(" ") || service.cooperator["@id"]}
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const beginDate = occurrence.occurrenceDate
                          setEditingOccurrence(occurrence)
                          setEditForm({
                            title: occurrence.event.title || "",
                            description: occurrence.event.description || "",
                            beginDate: beginDate.format("YYYY-MM-DDTHH:mm"),
                            duration: getEventDuration(occurrence.event),
                            isAllday: !!occurrence.event.isAllday,
                          })
                        }}
                      >
                        <Pencil />
                        Modifier
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setPendingAction({
                          type: "delete",
                          items: [occurrence],
                          changes: {},
                          recurring: !!occurrence.event.recurrenceRule && !occurrence.isException,
                        })}
                      >
                        <Trash2 />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Aucun service renseigné.</p>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!editingOccurrence}
        onOpenChange={(open) => {
          if (!open) {
            setEditingOccurrence(null)
            setEditForm(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l’événement</DialogTitle>
            <DialogDescription>
              Modifiez cette occurrence puis choisissez si la modification concerne la série.
            </DialogDescription>
          </DialogHeader>
          {editForm && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event-title">Titre</Label>
                <Input
                  id="event-title"
                  value={editForm.title}
                  onChange={event => setEditForm(current => ({ ...current, title: event.target.value }))}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="event-begin">Début</Label>
                  <Input
                    id="event-begin"
                    type="datetime-local"
                    value={editForm.beginDate}
                    onChange={event => setEditForm(current => ({ ...current, beginDate: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-duration">Durée (minutes)</Label>
                  <Input
                    id="event-duration"
                    type="number"
                    min={1}
                    step={5}
                    value={editForm.duration ?? ""}
                    onChange={event => setEditForm(current => ({
                      ...current,
                      duration: Number(event.target.value),
                    }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-description">Description</Label>
                <Textarea
                  id="event-description"
                  value={editForm.description}
                  onChange={event => setEditForm(current => ({ ...current, description: event.target.value }))}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editForm.isAllday}
                  onChange={event => setEditForm(current => ({ ...current, isAllday: event.target.checked }))}
                />
                Journée entière
              </label>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="cancel"
              onClick={() => {
                setEditingOccurrence(null)
                setEditForm(null)
              }}
            >
              Annuler
            </Button>
            <Button
              type="button"
              disabled={!editForm || Number(editForm.duration) <= 0}
              onClick={() => {
                setPendingAction({
                  type: "update",
                  items: [editingOccurrence],
                  changes: editForm,
                  recurring: !!editingOccurrence.event.recurrenceRule && !editingOccurrence.isException,
                })
                setEditingOccurrence(null)
                setEditForm(null)
              }}
            >
              Continuer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!pendingAction} onOpenChange={(open) => !open && cancelPendingAction()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction?.type === "delete" ? "Supprimer l’événement" : "Modifier l’événement"}
            </DialogTitle>
            <DialogDescription>
              {pendingAction?.recurring
                ? "Cet événement est récurrent. Choisissez la portée de l’action."
                : "Confirmez cette action."}
            </DialogDescription>
          </DialogHeader>
          {actionError && (
            <p className="text-destructive text-sm" role="alert">{actionError}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="cancel" onClick={cancelPendingAction} disabled={isSaving}>
              Annuler
            </Button>
            {pendingAction?.recurring && (
              <Button type="button" variant="outline" onClick={() => executePendingAction("occurrence")} loading={isSaving}>
                Cette occurrence
              </Button>
            )}
            <Button
              type="button"
              variant={pendingAction?.type === "delete" ? "destructive" : "default"}
              onClick={() => executePendingAction("series")}
              loading={isSaving}
            >
              {pendingAction?.recurring ? "Toute la série" : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
