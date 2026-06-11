"use client"

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import dayjs from "@/utils/dayjs.config";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from "react";
import { Button } from "./ui/button";
import { ButtonGroup } from "./ui/button-group";


export function WeekSwitcher() {

  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const dateParam = searchParams.get("date")
  const parsedDate = dateParam ? dayjs(dateParam, "YYYY-MM-DD", true) : dayjs()
  const date = parsedDate.isValid() ? parsedDate : dayjs()
  const startOfWeek = date.startOf("isoWeek")
  const endOfWeek = date.endOf("isoWeek")

  const handleSetDate = (nextDate: dayjs.Dayjs) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("date", nextDate.format("YYYY-MM-DD"))
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleSelectDate = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      return
    }

    handleSetDate(dayjs(selectedDate))
    setIsCalendarOpen(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ButtonGroup>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Semaine précédente"
          onClick={() => handleSetDate(startOfWeek.subtract(1, "week"))}
        >
          <ChevronLeft />
        </Button>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="min-w-52 justify-between capitalize"
              aria-label="Choisir une date"
            >
              <CalendarDays />
              {startOfWeek.format("D MMM")} - {endOfWeek.format("D MMM YYYY")}
              <ChevronDown className="text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              key={date.format("YYYY-MM-DD")}
              mode="single"
              selected={date.toDate()}
              defaultMonth={date.toDate()}
              onSelect={handleSelectDate}
            />
          </PopoverContent>
        </Popover>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Semaine suivante"
          onClick={() => handleSetDate(startOfWeek.add(1, "week"))}
        >
          <ChevronRight />
        </Button>
      </ButtonGroup>
      <Button
        type="button"
        variant="outline"
        onClick={() => handleSetDate(dayjs())}
      >
        Aujourd'hui
      </Button>
    </div>
  )
}
