import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function FormInput({ name, title, placeholder, form, description, required, type = "text", autoComplete = "off", ...props }: any) {
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                    <FormLabel>{title}{required && <span className='text-red-500'> *</span>}</FormLabel>
                    <FormControl>
                        <Input
                            placeholder={placeholder}
                            {...field}
                            type={type}
                            autoComplete={autoComplete}
                            value={type === "file" ? undefined : value}
                            onChange={(e) => {
                                const newValue = type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : (type === "file" ? e.target.files?.[0] : e.target.value);
                                onChange(newValue);
                            }}
                            {...props}
                        />
                    </FormControl>
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