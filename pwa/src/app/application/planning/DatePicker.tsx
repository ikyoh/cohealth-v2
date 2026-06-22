"use client"

import { useState } from "react"

import { Calendar } from "@/components/ui/calendar"

export default function DatePicker() {
    const [date, setDate] = useState<Date | undefined>()

    return (
        <div>
            <Calendar
                mode="single"
                className="rounded-md border p-2"
                selected={date}
                onSelect={setDate}
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
