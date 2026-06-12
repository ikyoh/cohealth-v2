"use client";
import { Clock, GripVertical } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
// import "./styles.css";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetCollection, useGetIRI } from "@/hooks/useQuery";
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
    // RRule returns the intended wall-clock time but labels it as UTC.
    return dayjs.tz(value.date, CALENDAR_TIMEZONE)
  }

  return dayjs(value).tz(CALENDAR_TIMEZONE)
}
const rangesOverlap = (first, second) => first.y < second.y + second.h && second.y < first.y + first.h
const getIri = (value) => typeof value === "string" ? value : value?.["@id"] || value?.iri

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

  const [mounted, setmounted] = useState(false);
  const [layout, setlayout] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
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
    const totalDuration = event.services?.reduce((acc, service) => acc + (service.duration || 0), 0) || 0

    if (totalDuration > 0) {
      return Math.max(1, Math.ceil(totalDuration / MINUTES_PER_BLOCK))
    }

    const beginDate = getCalendarDate(event.beginDate)
    const endDate = getCalendarDate(event.endDate)
    const eventDuration = endDate.diff(beginDate, "minute")

    if (eventDuration > 0) {
      return Math.max(1, Math.ceil(eventDuration / MINUTES_PER_BLOCK))
    }

    return 1
  }

  const calcEventsHeight = (events, fallbackHeight = 1) => {
    const totalDuration = events.reduce((acc, event) => {
      return acc + (event.services?.reduce((sum, service) => sum + (service.duration || 0), 0) || 0)
    }, 0)

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

        return {
          event,
          occurrenceDate,
          missionKey: getMissionKey(event),
          i: event.uuid + "_" + index,
          x: calcX(occurrenceDate),
          y: calcY(occurrenceDate),
          h: calcHeight(event),
        }
      })
  }

  const groupOverlappingOccurrences = (occurrences) => {
    return occurrences
      .sort((first, second) => first.x - second.x || first.y - second.y)
      .reduce((groups, occurrence) => {
        let group = groups.find(item =>
          item.missionKey === occurrence.missionKey &&
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

  const onDragStop = (layout, oldItem, newItem, placeholder, e, element) => {
    console.log("DRAG STOP");
    console.log("Item déplacé:", newItem);
  };

  const onDrop = (layout, layoutItem, _event) => {
    console.log("DROP", layoutItem, _event)
  }

  return (
    <>
      <div className="absolute top-[71px] left-0 z-20 w-full">
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
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Aucun service renseigné.</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
