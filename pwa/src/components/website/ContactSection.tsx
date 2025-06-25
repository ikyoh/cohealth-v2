'use client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from "@hookform/resolvers/zod"
import Link from 'next/link'
import { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"
import { sendEmail } from "./emailAction"
import { FormDataSchema } from './emailSchema'


type Inputs = z.infer<typeof FormDataSchema>


export default function ContactSection({ id = 'contact' }) {

    const form = useForm<z.infer<typeof FormDataSchema>>({
        resolver: zodResolver(FormDataSchema),
        defaultValues: {
            name: "",
            who: "",
            email: "",
            phone: "",
            message: "",
        },
    })
    const [isSend, setIsSend] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [isError, setIsError] = useState(false)

    const onSubmit: SubmitHandler<Inputs> = async data => {
        setIsSending(true)
        const result = await sendEmail(data)
        if (result?.success) {
            setIsSend(true)
            setIsSending(false)
            return
        }

        setIsError(true)
    }


    // const choices = {
    //     'Patient / Famille': 'Un patient ou un proche aidant',
    //     'Médecin': 'Un médecin',
    //     'Hôpital / Clinique': 'Le répresentant d\'un hôpital ou d\'une clinique',
    //     'Professionnel de santé': 'Un professionnel de santé',
    //     'Autre': 'Autre'
    // }

    return (
        <section id={id} className="py-32">
            <div className="mx-auto max-w-3xl px-4 lg:px-0">
                <h1 className="mb-12 text-center text-4xl font-semibold lg:text-5xl">Contactez-nous</h1>
                <div className="grid divide-y border md:grid-cols-2 md:gap-4 md:divide-x md:divide-y-0 rounded-t-2xl">
                    <div className="flex flex-col justify-between space-y-8 p-6 sm:p-12">
                        <div>
                            <h2 className="mb-3 text-lg font-semibold">Contact</h2>
                            <Link href="mailto:info@cohealth.ch" className="text-primary hover:underline">
                                info@cohealth.ch
                            </Link>
                            <p className="mt-3 text-sm">+41 78 831 40 40</p>
                        </div>
                    </div>
                    <div className="flex flex-col justify-between space-y-8 p-6 sm:p-12">
                        <div>
                            <h3 className="mb-3 text-lg font-semibold">Adresse</h3>
                            <p className="mt-3 text-sm">Avenue des Morgines 12,</p>
                            <p className="mt-3 text-sm">1213 Petit-Lancy – Genève</p>
                        </div>
                    </div>
                </div>

                <div className="h-10 border-x bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_6px)]"></div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="border px-4 py-12 lg:px-0 lg:py-24 rounded-b-2xl">
                        <Card className="mx-auto max-w-lg p-8 sm:p-16">
                            <h3 className="text-xl font-semibold">Laissez-nous un message</h3>
                            <div className="**:[&>label]:block mt-8 space-y-6 *:space-y-0">
                                <FormField
                                    control={form.control}
                                    name="who"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Vous êtes</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Faites votre choix" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Patient / Famille">
                                                        Un patient ou un proche aidant
                                                    </SelectItem>
                                                    <SelectItem value="Médecin">
                                                        Un médecin
                                                    </SelectItem>
                                                    <SelectItem value="Hôpital / Clinique">
                                                        Le répresentant d&apos;un hôpital ou d&apos;une clinique
                                                    </SelectItem>
                                                    <SelectItem value="Professionnel de santé">
                                                        Un professionnel de santé
                                                    </SelectItem>
                                                    <SelectItem value="Autre">
                                                        Autre
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />


                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nom / Prénom</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} disabled={isSending || isSend} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Votre email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="me@mail.com" {...field} disabled={isSending || isSend} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Votre numéro de téléphone</FormLabel>
                                            <FormControl>
                                                <Input {...field} disabled={isSending || isSend} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Message</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    className='resize-none'
                                                    rows={14}
                                                    placeholder="Votre message"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={isSending || isSend} variant={isSend ? "secondary" : "primary"} className="w-full">
                                    {isSending ? "Envoi en cours..." : isError ? "Echec" : isSend ? "Message envoyé" : "Envoyer votre message"}
                                </Button>
                            </div>
                        </Card>
                    </form>
                </Form>
            </div>
        </section>
    )
}

