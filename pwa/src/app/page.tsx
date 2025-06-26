import { Separator } from '@/components/ui/separator';
import ContactSection from '@/components/website/ContactSection';
import Footer from '@/components/website/Footer';
import { Header } from "@/components/website/Header";
import HeroSection from "@/components/website/HeroSection";
import IntegrationsSection from "@/components/website/IntegrationsSection";
import SoftwareSection from "@/components/website/SoftwareSection";
import { ArrowRight, Cpu, Frame, MessagesSquare, NotepadText } from 'lucide-react';
import * as motion from "motion/react-client";
import Image from 'next/image';
import Link from 'next/link';



export default function HomePage() {

    const motionProps = {
        initial: { opacity: 0, y: 100, filter: 'blur(30px)' },
        whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
        viewport: { margin: "1000px 0px -200px 0px", once: false },
    }

    const motionImageProps = {
        initial: { opacity: 0.7, scale: 0.4 },
        whileInView: { opacity: 1, scale: 1 },
        viewport: { margin: "1000px 0px -100px 0px", once: false },
    }


    return (
        <>
            <Header />
            <main className="container mx-auto">
                <HeroSection />
                <IntegrationsSection />
                <section id="patients" className="py-16 md:py-32">
                    <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                        <motion.div
                            {...motionProps}
                            transition={{
                                ease: "easeIn",
                            }}
                        >
                            <h2 className="relative z-10 max-w-xl text-xl font-bold my-3 text-primary flex items-center">
                                Patients et familles
                            </h2>
                            <h3 className="relative z-10 max-w-3xl text-4xl font-medium lg:text-5xl">Vivre chez soi, bien entouré
                            </h3>
                        </motion.div>
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:gap-12 lg:gap-24">
                            <motion.div
                                {...motionProps}
                                transition={{
                                    ease: "easeIn",
                                }}>
                                <div className="relative space-y-4">
                                    <p className="text-muted-foreground">
                                        Nous organisons les soins à domicile de manière humaine, souple et sécurisée.
                                    </p>
                                    <div className="relative space-y-4">
                                        <p className="font-bold mb-1">
                                            Nos services :
                                        </p>
                                        <ul>
                                            <li>
                                                Soins après hospitalisation
                                            </li>
                                            <li>
                                                Suivi de maladies chroniques
                                            </li>
                                            <li>
                                                Soins palliatifs à domicile
                                            </li>
                                            <li>
                                                Prévention des réhospitalisations
                                            </li>
                                            <li>
                                                Soutien aux aidants
                                            </li>

                                        </ul>
                                        <p className="font-bold mb-1">
                                            En 4 étapes :
                                        </p>
                                        <ul>
                                            <li>
                                                Premier contact (par vous ou votre médecin)
                                            </li>
                                            <li>
                                                Évaluation à domicile
                                            </li>
                                            <li>
                                                Mise en place des soins coordonnés
                                            </li>
                                            <li>
                                                Suivi via application & équipe dédiée
                                            </li>
                                        </ul>
                                        <p className="font-bold mb-1">
                                            Financement & prise en charge :
                                        </p>
                                        <p className="text-muted-foreground">
                                            Nos prestations sont couvertes par :
                                        </p>
                                        <ul>
                                            <li>
                                                Assurance de base (LAMal)
                                            </li>
                                            <li>
                                                Assurances complémentaires
                                            </li>
                                            <li>
                                                Prestations privées sur devis
                                            </li>
                                            <li>
                                                Tarifs conventionnés cantonaux
                                            </li>
                                        </ul>
                                        <p className="text-muted-foreground">Transparence garantie : évaluation claire et devis selon les besoins.</p>

                                        <Link
                                            href="#contact"
                                            className="mt-10 bg-primary hover:bg-background dark:hover:border-t-border hover:border-primary group flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950">
                                            <span className="text-foreground">Contactez-nous</span>
                                            <Separator orientation="vertical" />
                                            <div className="bg-background group-hover:bg-primary size-6 overflow-hidden rounded-full duration-500">
                                                <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                    <span className="flex size-6">
                                                        <ArrowRight className="m-auto size-3" />
                                                    </span>
                                                    <span className="flex size-6">
                                                        <ArrowRight className="m-auto size-3" />
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                            <div className="order-first sm:order-none relative mt-6 sm:mt-0 perspective-midrange scale-x-[-1] sm:scale-x-100">
                                <motion.div {...motionImageProps}
                                    transition={{
                                        ease: "easeIn",
                                    }}
                                >
                                    <div className="relative mt-6 sm:mt-0 perspective-midrange">
                                        <div className="-rotate-y-15 aspect-67/34 relative rounded-2xl border p-2">
                                            <div className="absolute grid grid-cols-3 grid-rows-3 top-0 left-0 z-10 p-6 gap-6 h-full w-full">
                                                <div className='rounded-sm row-span-2 bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_8px)]'></div>
                                                <div className='rounded-sm col-span-2 row-span-2'></div>
                                                <div className='rounded-sm bg-[repeating-linear-gradient(-45deg,var(--color-primary),var(--color-primary)_1px,transparent_1px,transparent_8px)]'></div>
                                                <div className='col-span-2 rounded-sm bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_8px)]'></div>
                                            </div>
                                            <Image src='/website/cohealth_patient.webp' className="brightness-120 rounded-sm" alt="professionnels de santé" width={1206} height={612} />
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section >
                <section id="medecins" className="py-16 md:py-32">
                    <div className="mx-auto max-w-5xl space-y-8 px-6">
                        <motion.div {...motionProps}
                            transition={{
                                ease: "easeIn",
                            }}>
                            <h2 className="relative z-10 max-w-xl text-xl font-bold my-3 text-primary flex items-center">
                                Médecins traitants & spécialistes
                            </h2>
                            <h3 className="relative z-10 max-w-3xl text-4xl font-medium lg:text-5xl">Faciliter la continuité des soins</h3>
                        </motion.div>
                        <div className="grid gap-6 sm:grid-cols-2 md:gap-12 lg:gap-24">
                            <div className="relative mt-6 sm:mt-0 perspective-midrange">
                                <motion.div {...motionImageProps}
                                    transition={{
                                        ease: "easeIn",
                                    }}>
                                    <div className="relative mt-6 sm:mt-0 perspective-midrange">
                                        <div className="rotate-y-15 aspect-67/34 relative rounded-2xl border p-2">
                                            <div className="absolute grid grid-cols-3 grid-rows-3 top-0 left-0 z-10 p-6 gap-6 h-full w-full">
                                                <div className='rounded-sm col-span-2 row-span-2'></div>
                                                <div className='rounded-sm row-span-2 bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_8px)]'></div>
                                                <div className='col-span-2 rounded-sm bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_8px)]'></div>
                                                <div className='rounded-sm bg-[repeating-linear-gradient(-45deg,var(--color-primary),var(--color-primary)_1px,transparent_1px,transparent_8px)]'></div>
                                            </div>
                                            <Image src='/website/cohealth_doctor.webp' className="brightness-120 rounded-sm -scale-x-100" alt="professionnels de santé" width={1206} height={612} />
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                            <motion.div {...motionProps}
                                transition={{
                                    ease: "easeIn",
                                }}>
                                <div className="relative space-y-4">
                                    <p className="font-bold mb-1">
                                        Nos engagements :
                                    </p>
                                    <ul>
                                        <li>
                                            Réponse rapide aux prescriptions
                                        </li>
                                        <li>
                                            Plateforme sécurisée de communication
                                        </li>
                                        <li>
                                            Retours d’information réguliers
                                        </li>
                                        <li>
                                            Équipe locale et disponible
                                        </li>

                                    </ul>
                                    <p className="font-bold mb-1">
                                        Indications principales :
                                    </p>
                                    <ul>
                                        <li>
                                            Post-hospitalisation
                                        </li>
                                        <li>
                                            Polypathologies
                                        </li>
                                        <li>
                                            Soins palliatifs
                                        </li>
                                        <li>
                                            Dépendance / précarité
                                        </li>
                                    </ul>

                                    <Link
                                        href="#contact"
                                        className="mt-10 bg-primary hover:bg-background dark:hover:border-t-border hover:border-primary group flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950">
                                        <span className="text-foreground">Référer un patient</span>
                                        <Separator orientation="vertical" />
                                        <div className="bg-background group-hover:bg-primary size-6 overflow-hidden rounded-full duration-500">
                                            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>

                                </div>
                            </motion.div>

                        </div>
                    </div>
                </section>
                <section id="hopitaux" className="py-16 md:py-32">
                    <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                        <motion.div {...motionProps}
                            transition={{
                                ease: "easeIn",
                            }}>
                            <h2 className="relative z-10 max-w-xl text-xl font-bold my-3 text-primary flex items-center">
                                Hôpitaux & cliniques
                            </h2>
                            <h3 className="relative z-10 max-w-3xl text-4xl font-medium lg:text-5xl">
                                Un partenaire fiable pour les retours à domicile.
                            </h3>
                        </motion.div>
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:gap-12 lg:gap-24">
                            <motion.div {...motionProps}
                                transition={{
                                    ease: "easeIn",
                                }}>
                                <div className="relative space-y-4">
                                    <p className="font-bold mb-1">
                                        Ce que nous apportons :
                                    </p>
                                    <ul>
                                        <li>
                                            Coordination des soins en 48h
                                        </li>
                                        <li>
                                            Préparation de la sortie avec vos équipes
                                        </li>
                                        <li>
                                            Suivi numérique & accompagnement social
                                        </li>
                                    </ul>
                                    <p className="font-bold mb-1">
                                        Programmes spécialisés :
                                    </p>
                                    <ul>
                                        <li>
                                            Réhabilitation post-opératoire
                                        </li>
                                        <li>
                                            Oncologie à domicile
                                        </li>
                                        <li>
                                            Soins intensifs et palliatifs
                                        </li>
                                        <li>
                                            Mandats psychiatriques (infirmier spécialisé)
                                        </li>
                                    </ul>

                                    <Link
                                        href="#contact"
                                        className="mt-10 bg-primary hover:bg-background dark:hover:border-t-border hover:border-primary group flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950">
                                        <span className="text-foreground">Collaborer avec CoHealth</span>
                                        <Separator orientation="vertical" />
                                        <div className="bg-background group-hover:bg-primary size-6 overflow-hidden rounded-full duration-500">
                                            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </motion.div>
                            <div className="order-first sm:order-none relative mt-6 sm:mt-0 perspective-midrange scale-x-[-1] sm:scale-x-100">
                                <motion.div {...motionImageProps}
                                    transition={{
                                        ease: "easeIn",
                                    }}>
                                    <div className="relative mt-6 sm:mt-0 perspective-midrange">
                                        <div className="-rotate-y-15 aspect-67/34 relative rounded-2xl border p-2">
                                            <div className="absolute grid grid-cols-3 grid-rows-3 top-0 left-0 z-10 p-6 gap-6 h-full w-full">
                                                <div className='rounded-sm row-span-2 bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_8px)]'></div>
                                                <div className='rounded-sm col-span-2 row-span-2'></div>
                                                <div className='rounded-sm bg-[repeating-linear-gradient(-45deg,var(--color-primary),var(--color-primary)_1px,transparent_1px,transparent_8px)]'></div>
                                                <div className='col-span-2 rounded-sm bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_8px)]'></div>
                                            </div>
                                            <Image src='/website/cohealth_hospital.webp' className="brightness-120 rounded-sm" alt="professionnels de santé" width={1206} height={612} />
                                        </div>
                                    </div>
                                </motion.div>
                            </div>


                        </div>
                    </div>
                </section>
                <section id="professionnels" className="py-16 md:py-32">
                    <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                        <motion.div {...motionProps}
                            transition={{
                                ease: "easeIn",
                            }}>
                            <h2 className="relative z-10 max-w-xl text-xl font-bold my-3 text-primary flex items-center">
                                Professionnels de santé
                            </h2>
                            <h3 className="relative z-10 max-w-3xl text-4xl font-medium lg:text-5xl">Rejoignez un réseau efficace, éthique et humain
                            </h3>
                        </motion.div>
                        <div className="grid gap-6 sm:grid-cols-2 md:gap-12 lg:gap-24">
                            <motion.div {...motionImageProps}
                                transition={{
                                    ease: "easeIn",
                                }}>
                                <div className="relative mt-6 sm:mt-0 perspective-midrange">
                                    <div className="rotate-y-15 aspect-67/34 relative rounded-2xl border p-2">
                                        <div className="absolute grid grid-cols-3 grid-rows-3 top-0 left-0 z-10 p-6 gap-6 h-full w-full">
                                            <div className='rounded-sm col-span-2 row-span-2'></div>
                                            <div className='rounded-sm bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_8px)]'></div>
                                            <div className='rounded-sm'></div>
                                            <div className='col-span-2 rounded-sm bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_8px)]'></div>
                                            <div className='rounded-sm bg-[repeating-linear-gradient(-45deg,var(--color-primary),var(--color-primary)_1px,transparent_1px,transparent_8px)]'></div>
                                        </div>
                                        <Image src='/website/cohealth_nurse.webp' className="-scale-x-100 brightness-120 rounded-sm" alt="professionnels de santé" width={1206} height={612} />
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div {...motionProps}
                                transition={{
                                    ease: "easeIn",
                                }}>
                                <div className="relative space-y-4">
                                    <p className="font-bold mb-1">
                                        Vos avantages :
                                    </p>
                                    <div className="grid grid-cols-2 gap-3 pt-6 sm:gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Frame className="size-4" />
                                                <h3 className="text-sm font-medium">Cadre</h3>
                                            </div>
                                            <p className="text-muted-foreground text-sm">Cadre clair, centré patient.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Cpu className="size-4" />
                                                <h3 className="text-sm font-medium">Outil numérique</h3>
                                            </div>
                                            <p className="text-muted-foreground text-sm">Un logiciel métier étudié pour vous</p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <MessagesSquare className="size-4" />
                                                <h3 className="text-sm font-medium">Échanges simplifiés</h3>
                                            </div>
                                            <p className="text-muted-foreground text-sm">Communication fluide avec nos coordinateurs</p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <NotepadText className="size-4" />
                                                <h3 className="text-sm font-medium">Quotidien</h3>
                                            </div>
                                            <p className="text-muted-foreground text-sm">Conditions de travail respectueuses.</p>
                                        </div>
                                    </div>

                                    <Link
                                        href="#contact"
                                        className="mt-10 bg-primary hover:bg-background dark:hover:border-t-border hover:border-primary group flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950">
                                        <span className="text-foreground">Rejoindre le réseau</span>
                                        <Separator orientation="vertical" />
                                        <div className="bg-background group-hover:bg-primary size-6 overflow-hidden rounded-full duration-500">
                                            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>

                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>
                <SoftwareSection />
                <ContactSection />
            </main>
            <Footer />
        </>
    )
}