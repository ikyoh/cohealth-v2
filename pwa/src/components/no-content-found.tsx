import { Button } from "@/components/ui/button";
import Link from "next/link";


type Props = {
  link?: string;
  title: string;
  description: string;
  buttonLabel?: string;
};


const NoContentFound = ({ link, title, description, buttonLabel }: Props) => {
  return (
    <div className="bg-white dark:bg-black flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
      <div className="flex flex-col items-center gap-1 text-center">
        <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
        {link && buttonLabel &&
          <Link href={link}>
            <Button className="mt-4">{buttonLabel}</Button>
          </Link>}
      </div>
    </div>
  );
}

export default NoContentFound;