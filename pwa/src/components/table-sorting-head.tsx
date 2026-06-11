import { ArrowDownNarrowWide, ArrowUpNarrowWide } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ReactNode } from "react";
import { TableHead } from "./ui/table";

const TableSortingHead = ({ sortingTerm, children }: { sortingTerm: string, children: ReactNode }) => {


    const searchParams = useSearchParams()
    const pathname = usePathname();
    const { replace } = useRouter();

    const exist = searchParams?.has(`order[${sortingTerm}]`)
    const sorting = searchParams?.get(`order[${sortingTerm}]`) || null

    const handleSort = () => {

        const params = new URLSearchParams(searchParams!);
        const paramsToRemove = searchParams ? Array.from(searchParams.keys()).filter((key) => key.includes("order") && key !== `order[${sortingTerm}]`) : [];

        if (exist) {
            if (sorting === "ASC")
                params?.set(`order[${sortingTerm}]`, "DESC")

            else params?.set(`order[${sortingTerm}]`, "ASC")
        }
        else {
            paramsToRemove.forEach(
                (paramToRemove) => params.delete(paramToRemove)
            )
                ;
            params.append(`order[${sortingTerm}]`, "ASC")
        }
        replace(`${pathname}?${params.toString()}`);
    }



    return (
        <TableHead
            onClick={() => handleSort()}
        >
            <div className='cursor-pointer flex items-center gap-3'>
                {children}
                {exist && sorting === "ASC" ? <ArrowDownNarrowWide size={16} /> : null}
                {exist && sorting === "DESC" ? <ArrowUpNarrowWide size={16} /> : null}
            </div>
        </TableHead>
    );
}

export default TableSortingHead;