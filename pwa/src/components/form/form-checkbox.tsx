
import { Checkbox } from "@/components/ui/checkbox";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";


type FormCheckboxItem = {
    id: string;
    label: string;
};

type FormCheckboxProps = {
    form: any;
    name: string;
    title: string;
    placeholder?: string;
    items: FormCheckboxItem[];
    description?: string;
};

export default function FormCheckbox({ form, name, title, items, description }: FormCheckboxProps) {
    return (
        <FormField
            control={form.control}
            name={name}
            render={() => (
                <FormItem>
                    <div>
                        <FormLabel>
                            {title}
                        </FormLabel>
                        {description && (
                            <FormDescription>
                                {description}
                            </FormDescription>)}
                    </div>
                    {items.map((item) => (
                        <FormField
                            key={item.id}
                            control={form.control}
                            name={name}
                            render={({ field }) => {
                                return (
                                    <FormItem
                                        key={item.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(item.id)}
                                                onCheckedChange={(checked) => {
                                                    return checked
                                                        ? field.onChange([...field.value, item.id])
                                                        : field.onChange(
                                                            field.value?.filter(
                                                                (value) => value !== item.id
                                                            )
                                                        )
                                                }}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            {item.label}
                                        </FormLabel>
                                    </FormItem>
                                )
                            }}
                        />
                    ))}
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}