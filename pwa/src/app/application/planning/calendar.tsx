"use client"

import * as React from "react"

import { Calendar as CalendarComponent } from "@/components/ui/calendar"

export function Calendar() {
    const [date, setDate] = React.useState<Date | undefined>(new Date())

    return (
        <CalendarComponent
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
        />
    )
}
