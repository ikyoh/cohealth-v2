"use client"
import { CirclePlus } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from './ui/button';

type Props = {
    href: string;
    title: string;
    icon?: React.ReactNode;
};

const ModalLink = ({ title, href, icon }: Props) => {

    const searchParams = useSearchParams();
    const params = new URLSearchParams(searchParams!);

    return (
        <Button variant={"primary"} asChild>
            <Link href={`${href}${params.toString() ? `?${params.toString()}` : ""}`} scroll={false}>
                {icon ? icon : <CirclePlus />}
                <span className="text-sm">{title}</span>
            </Link >
        </Button>
    );
}

export default ModalLink;