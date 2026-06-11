import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

export default function FormSwitch({ name, title, form, description }: any) {
    return (

        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <FormLabel>{title}</FormLabel>
                        {description &&
                            <FormDescription>
                                {description}
                            </FormDescription>
                        }
                    </div>
                    <FormControl>
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    </FormControl>
                </FormItem>
            )}
        />

    );
}