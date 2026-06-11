"use client"

import { Calendar } from "@/components/ui/calendar";
import dayjs from "dayjs";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from "react";


export function DatePicker() {

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [date, setDate] = useState<Date>()


  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  useEffect(() => {
    const dateParam = searchParams.get('date') ? new Date(searchParams.get('date')) : new Date()
    setDate(dateParam)
  }, [])


  const handleSetDate = (date: Date | undefined) => {
    router.push(pathname + '?' + createQueryString('date', dayjs(date).format("YYYY-MM-DD")))
    setDate(date)
  }

  if (!date) return null

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={handleSetDate}
      className="rounded-md border shadow-sm p-1"
    />
  )
}
