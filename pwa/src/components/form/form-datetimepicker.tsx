"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/utils/utils";
import dayjs from "dayjs";

const DEFAULT_HOUR = 8;

const getDefaultDateTime = () => {
    const date = new Date();
    date.setHours(DEFAULT_HOUR, 0, 0, 0);

    return date;
};

export default function FormDateTimePicker({ name, title, placeholder, form, description, required }: any) {


    function handleDateSelect(date: Date | undefined) {
        if (date) {
            const currentDate = form.getValues(name);
            const selectedDate = new Date(date);

            selectedDate.setHours(
                currentDate ? dayjs(currentDate).hour() : DEFAULT_HOUR,
                currentDate ? dayjs(currentDate).minute() : 0,
                0,
                0,
            );

            form.setValue(name, selectedDate, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });
        }
    }

    function handleTimeChange(type: "hour" | "minute", value: string) {
        const currentDate = form.getValues(name) || getDefaultDateTime();
        let newDate = new Date(currentDate);

        if (type === "hour") {
            const hour = parseInt(value, 10);
            newDate.setHours(hour);
        } else if (type === "minute") {
            newDate.setMinutes(parseInt(value, 10));
        }

        newDate.setSeconds(0, 0);
        form.setValue(name, newDate, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    }

    return (

        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>{title}</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                    )}
                                >
                                    {field.value ? (
                                        format(field.value, "dd/MM/yyyy HH:mm")
                                    ) : (
                                        <span>JJ/MM/AAAA HH:mm</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <div className="sm:flex">
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={handleDateSelect}
                                />
                                <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                                    <ScrollArea className="w-64 sm:w-auto">
                                        <div className="flex sm:grid sm:grid-cols-2 p-2">
                                            {Array.from({ length: 24 }, (_, i) => i)
                                                .map((hour) => (
                                                    <Button
                                                        type="button"
                                                        key={hour}
                                                        size="icon"
                                                        variant={
                                                            field.value &&
                                                                dayjs(field.value).hour() === hour
                                                                ? "default"
                                                                : "ghost"
                                                        }
                                                        className="sm:w-full shrink-0 aspect-square"
                                                        onClick={() =>
                                                            handleTimeChange("hour", hour.toString())
                                                        }
                                                    >
                                                        {hour} h
                                                    </Button>
                                                ))}
                                        </div>
                                        <ScrollBar orientation="horizontal" className="sm:hidden" />
                                    </ScrollArea>
                                    <ScrollArea className="w-64 sm:w-auto">
                                        <div className="flex sm:flex-col p-2">
                                            {Array.from({ length: 4 }, (_, i) => i * 15).map(
                                                (minute) => (
                                                    <Button
                                                        type="button"
                                                        key={minute}
                                                        size="icon"
                                                        variant={
                                                            field.value &&
                                                                dayjs(field.value).minute() === minute
                                                                ? "default"
                                                                : "ghost"
                                                        }
                                                        className="sm:w-full shrink-0 aspect-square"
                                                        onClick={() =>
                                                            handleTimeChange("minute", minute.toString())
                                                        }
                                                    >
                                                        {minute.toString().padStart(2, '0')} m
                                                    </Button>
                                                )
                                            )}
                                        </div>
                                        <ScrollBar orientation="horizontal" className="sm:hidden" />
                                    </ScrollArea>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                    {description &&
                        <FormDescription>{description}</FormDescription>}
                    <FormMessage />
                </FormItem>
            )}
        />

    );
}

