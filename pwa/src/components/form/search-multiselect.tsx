"use client"

import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import {
    MultiSelect,
    MultiSelectContent,
    MultiSelectGroup,
    MultiSelectItem,
    MultiSelectTrigger,
    MultiSelectValue,
} from "@/components/ui/multi-select"
import useInfiniteScroll from "@/hooks/useInfiniteScroll"
import { useMemo } from "react"

type FormSelectProps = {
    form: any;
    entity: string;
    name: string;
    title: string;
    placeholder: string;
    searchPlaceholder: string;
    labels: string[]
    description?: string;
    required?: boolean;
};

type SearchItem = {
    "@id": string;
    email?: string;
    [key: string]: unknown;
};

export default function SearchMultiSelect({ form, name, entity, labels, title, placeholder, searchPlaceholder, required, description }: FormSelectProps) {

    const { datas = [] } = useInfiniteScroll({ entity: entity });
    const items = useMemo(() => (datas as SearchItem[]).map((data) => ({
        label: labels.map((field) => data[field]).filter(Boolean).join(' ') || data.email || data["@id"],
        value: data["@id"]
    })), [datas, labels])

    return (

        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>
                        {title}
                        {required && <span className='text-red-500'> *</span>}
                    </FormLabel>
                    <MultiSelect onValuesChange={field.onChange} values={field.value ?? []}>
                        <FormControl>
                            <MultiSelectTrigger className="w-full">
                                <MultiSelectValue placeholder={placeholder} />
                            </MultiSelectTrigger>
                        </FormControl>
                        <MultiSelectContent search={{ placeholder: searchPlaceholder, emptyMessage: "Aucun résultat." }}>
                            <MultiSelectGroup>
                                {items.map((item) =>
                                    <MultiSelectItem
                                        key={item.value}
                                        value={item.value}
                                        searchValue={item.label}
                                    >
                                        {item.label}
                                    </MultiSelectItem>
                                )}
                            </MultiSelectGroup>
                        </MultiSelectContent>
                    </MultiSelect>
                    {description &&
                        <FormDescription>
                            {description}
                        </FormDescription>
                    }
                    <FormMessage />
                </FormItem>
            )}
        />


    )
}
