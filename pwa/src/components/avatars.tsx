import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { useGetIRI } from "@/hooks/useQuery";
import { Skeleton } from "./ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";

export default function Avatars({ iris }: { iris: string[] }) {
  return (
    <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
      {iris?.map(iri =>
        <UserAvatar key={iri} iri={iri} />
      )}
    </div>
  );
}


const UserAvatar = ({ iri }: { iri: string }) => {
  const { data, isLoading } = useGetIRI(iri ? iri : "");

  if (isLoading) return (
    <Skeleton className="w-8 h-8 rounded-full" />
  )

  const fullName = [data?.firstname, data?.lastname]
    .filter(Boolean)
    .join(" ");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Avatar
          className="hover:z-10 cursor-default"
          aria-label={fullName || "Collaborateur"}
        >
          <AvatarImage src={iri} alt={fullName || "Collaborateur"} />
          <AvatarFallback>
            {data?.firstname?.charAt(0)}
            {data?.lastname?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </TooltipTrigger>
      <TooltipContent sideOffset={6}>
        {fullName || "Collaborateur"}
      </TooltipContent>
    </Tooltip>
  );
}
