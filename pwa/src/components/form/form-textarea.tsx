import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export default function FormTextarea
    ({ name, title, placeholder, form, description, required, className = "resize-none" }: any) {
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
                    <FormControl>
                        <Textarea
                            placeholder={placeholder}
                            className={className}
                            {...field}
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