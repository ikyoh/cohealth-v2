"use client"

import { useState } from "react"
import type { DateValue } from "react-aria-components"

import { Calendar } from "@/components/ui/calendar-rac"

export default function DatePicker() {
    const [date, setDate] = useState<DateValue | null>()

    return (
        <div>
            <Calendar
                className="rounded-md border p-2"
                value={date}
                onChange={setDate}
            />
            <p
                className="text-muted-foreground mt-4 text-center text-xs"
                role="region"
                aria-live="polite"
            >
                Calendar -{" "}
                <a
                    className="hover:text-foreground underline"
                    href="https://react-spectrum.adobe.com/react-aria/DateRangePicker.html"
                    target="_blank"
                    rel="noopener nofollow"
                >
                    React Aria
                </a>
            </p>
        </div>
    )
}