'use client'
import { BorderBeam } from '@/components/magicui/border-beam'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { AppWindowMac, BookCheck, Headset } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import { useState } from 'react'

export default function SoftwareSection({ id = 'software' }: { id?: string }) {
    type ImageKey = 'item-1' | 'item-2' | 'item-3' | 'item-4'
    const [activeItem, setActiveItem] = useState<ImageKey>('item-1')

    const images = {
        'item-1': {
            image: '/website/mission.webp',
            alt: 'Mission',
        },
        'item-2': {
            image: '/website/planning.webp',
            alt: 'Planning',
        },
        'item-3': {
            image: '/website/mission.webp',
            alt: 'Mission',
        },
        'item-4': {
            image: '/website/planning.webp',
            alt: 'Planning',
        },
    }

    return (
        <section id={id} className="py-12 md:py-20 lg:py-32">
            <div className="bg-linear-to-b absolute inset-0 -z-10 sm:inset-6 sm:rounded-b-3xl dark:block dark:to-[color-mix(in_oklab,var(--color-zinc-900)_75%,var(--color-background))]"></div>
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16 lg:space-y-20 dark:[--color-border:color-mix(in_oklab,var(--color-white)_10%,transparent)]">
                <div className="relative z-10 mx-auto max-w-2xl space-y-6 text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-6xl">Logiciel métier CoHealth</h2>
                    <p>Simplifiez et connectez les soins à domicile</p>
                </div>

                <div className="grid gap-12 sm:px-12 md:grid-cols-2 lg:gap-20 lg:px-0">
                    <Accordion
                        type="single"
                        value={activeItem}
                        onValueChange={(value) => setActiveItem(value as ImageKey)}
                        className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <BookCheck className="size-4" />
                                    Pourquoi choisir notre solution numérique?
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <ul>
                                    <li>Coordination intelligente centralisée</li>
                                    <li>Communication en temps réel</li>
                                    <li>Interface intuitive (ordinateur, tablette, mobile)</li>
                                    <li>Sécurité (RGPD, HDS)</li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <AppWindowMac className="size-4" />
                                    Fonctionnalités clés.
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <ul>
                                    <li>Gestion complète du parcours patient</li>
                                    <li>Alertes et documents partagés</li>
                                    <li>Tableaux de bord & rapports</li>
                                    <li>Application mobile ergonomique</li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <Headset className="size-4" />
                                    Accompagnement et support.
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <ul>
                                    <li>Formation personnalisée</li>
                                    <li>Hotline, guides et tutoriels</li>
                                    <li>Mises à jour régulières</li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <div className="bg-background relative flex overflow-hidden rounded-3xl border p-2">
                        <div className="w-15 absolute inset-0 right-0 ml-auto border-l bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_8px)]"></div>
                        <div className="aspect-76/59 bg-background relative w-[calc(3/4*100%+3rem)] rounded-2xl">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${activeItem}-id`}
                                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                                    transition={{ duration: 0.2 }}
                                    className="size-full overflow-hidden rounded-2xl border shadow-md">
                                    <Image
                                        src={images[activeItem].image}
                                        className="size-full object-cover object-left-top dark:mix-blend-lighten p-2 rounded-sm"
                                        alt={images[activeItem].alt}
                                        width={1207}
                                        height={929}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        <BorderBeam
                            duration={6}
                            size={200}
                            className="from-transparent via-primary to-transparent dark:via-white/50"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
