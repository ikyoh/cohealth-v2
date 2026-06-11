import { Skeleton } from "../ui/skeleton";

export default function FormLoader({ length = 6 }: { length?: number }) {
    return (
        <div className="space-y-8">
            {Array.from({ length: length }).map((_, index) => (
                <Skeleton key={index} className="h-[58px] w-full" />
            ))}
            <Skeleton className="h-[36px] w-full" />
        </div>
    );
}   