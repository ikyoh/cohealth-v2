"use client"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import useInfiniteScroll from "@/hooks/useInfiniteScroll"
import { cn } from "@/utils/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import { useMemo, useState } from "react"
import { Skeleton } from "../ui/skeleton"

import { useDebounce } from "@/hooks/use-debounce"
import { useGetIRI } from "@/hooks/useQuery"

type FormSelectProps = {
  form: any;
  entity: string;
  name: string;
  title: string;
  defaultIRI?: string;
  placeholder: string;
  searchPlaceholder: string;
  labels: string[]
  description?: string;
  required?: boolean;
  className?: string;
};

type SearchItemSource = Record<string, any> & {
  "@id": string;
};

type SearchItem = {
  label: string;
  value: string;
};

export default function SearchSelect({ defaultIRI = "", form, name, entity, labels, title, placeholder, searchPlaceholder, required, description, className }: FormSelectProps) {

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const debouncedValue = useDebounce(search, 600);

  const { datas = [], totalItems, lastElementRef, isLoading, isFetching } = useInfiniteScroll({ entity: entity, search: debouncedValue });

  const { data, isLoading: isGetIRILoading } = useGetIRI(defaultIRI ? defaultIRI : "")

  const stockedItems = useMemo(() => {
    const items: SearchItem[] = datas?.map((data: SearchItemSource) => ({
      label: labels.map(field => data[field]).filter(Boolean).join(' '),
      value: data["@id"]
    })) || []

    if (defaultIRI && data) {
      const defaultItem = {
        label: labels.map(field => data[field]).filter(Boolean).join(' '),
        value: data["@id"]
      }
      const isDefaultInItems = items.some((item: SearchItem) => item.value === defaultItem.value);
      if (!isDefaultInItems) {
        items.unshift(defaultItem);
      }
    }

    return items
  }, [data, datas, defaultIRI, labels]);

  console.log("stockedItems", stockedItems)


  return (

    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("", className)}>
          <FormLabel>
            {title}
            {required && <span className='text-red-500'> *</span>}
          </FormLabel>
          {isLoading && isGetIRILoading ? <Skeleton className="w-full h-[36px] rounded-md" />
            : <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger className="w-full" asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? stockedItems.find(
                        (item) => item.value === field.value
                      )?.label
                      : placeholder}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent
                className="w-full p-0"
                onWheel={(e) => e.stopPropagation()}
              >
                <Command>
                  <CommandInput
                    placeholder={searchPlaceholder}
                    className="h-6 ring-0 border-muted"
                    onValueChange={(value: string) => setSearch(value)}
                    value={search}
                  />
                  <CommandList>
                    <CommandEmpty>Aucun résultat.</CommandEmpty>
                    <CommandGroup>
                      {stockedItems.map((item) => (
                        <CommandItem
                          ref={lastElementRef}
                          value={item.label}
                          key={item.value}
                          onSelect={() => {
                            form.setValue(name, item.value)
                            setOpen(false)
                          }}
                        >
                          {item.label}
                          <Check
                            className={cn(
                              "ml-auto",
                              item.value === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          }
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
