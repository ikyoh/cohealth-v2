'use client';
import FormInput from "@/components/form/form-input";
import PageContent from "@/components/page-content";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useGetIRI, usePatchQuery, usePostQuery } from "@/hooks/useQuery";
import { fileFormSchema } from "@/utils/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";


export default function PageProfileEdit() {

    const { data: currentUser, isLoading: isLoadingCurrentUser, isError: isErrorCurrentUser } = useGetIRI("/current_user");

    const { data: user, isLoading: isLoadingUser, isError: isErrorUser } = useGetIRI(currentUser ? currentUser.iri : null);

    const { data: avatar, mutate: post, isSuccess: isPostSuccess, isPending: isPostPending } = usePostQuery('media_avatars');

    const { mutate: patch, isSuccess: isPatchSuccess, isPending: isPatchPending } = usePatchQuery();

    type FormSchema = z.infer<typeof fileFormSchema>;

    const form = useForm<FormSchema>({
        resolver: zodResolver(fileFormSchema),
        defaultValues: {
            file: undefined,
        },
    });

    const onSubmit: SubmitHandler<FormSchema> = (values: any) => {
        const formData = new FormData();
        formData.append("file", values.file);
        post(formData)
    };

    useEffect(() => {
        if (avatar && isPostSuccess) {
            patch({ iri: user["@id"], avatar: avatar["@id"] })
        }
    }, [avatar, isPostSuccess])



    return (
        <PageContent title="Mon avatar" >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-md">
                    <FormInput
                        form={form}
                        name="file"
                        title="Avatar"
                        type='file'
                        placeholder="Choisir un fichier"
                        required
                    />
                    <Button type="submit" className="ml-3">
                        {"Enregistrer"}
                    </Button>

                </form>
            </Form >
        </PageContent >
    );
}