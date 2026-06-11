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
import { cn } from "@/utils/utils";
import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";



export default function FormDatePicker({ name, title, placeholder = "Choisir une date", form, description, required, type = "text", autoComplete = "off" }: any) {

    const [open, setOpen] = useState(false)


    return (

        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>{title}{required && <span className='text-red-500'> *</span>}</FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
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
                                        dayjs(field.value).format("DD/MM/YYYY")
                                    ) : (
                                        <span>{placeholder}</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                    field.onChange(date);
                                    setOpen(false);
                                }}
                                // disabled={(date) =>
                                //     date > new Date() || date < new Date("1900-01-01")
                                // }
                                captionLayout="dropdown"
                            />
                        </PopoverContent>
                    </Popover>
                    {description ?
                        <FormDescription>
                            {description}
                        </FormDescription>
                        : null
                    }
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

