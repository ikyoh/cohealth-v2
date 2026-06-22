import { useEffect } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

type FormSelectItem = {
  value: string;
  label: string;
};

type FormSelectProps = {
  form: any;
  name: string;
  title: string;
  placeholder?: string;
  items: FormSelectItem[];
  description?: string;
  required?: boolean;
  className?: string;
};


export default function FormSelect({ form, name, title, placeholder, items, required, description, ...props }: FormSelectProps) {

  useEffect(() => {
    const val = form.getValues(name)
    setTimeout(() => {
      form.setValue(name, val)
    }, 0)
  }, [])

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {title}
            {required && <span className='text-red-500'> *</span>}
          </FormLabel >
          <Select
            name={name}
            onValueChange={field.onChange}
            value={field.value?.toString()}
          >
            <FormControl>
              <SelectTrigger className="w-full" {...props}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {items.map((item: FormSelectItem) =>
                <SelectItem
                  key={item.value}
                  value={item.value.toString()}
                >
                  {item.label}
                </SelectItem>
              )}
            </SelectContent>
          </Select>


          {
            description ?
              <FormDescription>
                {description}
              </FormDescription>
              : null
          }
          <FormMessage />
        </FormItem >
      )
      }
    />
  );
}
