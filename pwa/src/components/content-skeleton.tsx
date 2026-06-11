import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ContentSkeleton() {
    return (
        <Card className="w-full h-full">
            <CardHeader className="px-7">
                <CardTitle>
                    <Skeleton className="h-12 w-60" />
                </CardTitle>
            </CardHeader>
            <CardContent>
                {Array.from({ length: 20 }).map((_, index) => (
                    <div key={index} className="mb-2 last:mb-0">
                        <Skeleton className="h-8 w-full" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}