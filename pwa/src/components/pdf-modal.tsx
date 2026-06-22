"use client";
import { useRouter } from "next/navigation";
import { PropsWithChildren } from "react";
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from "./ui/dialog";


type Props = PropsWithChildren<{
  title: string;
}>;


export default function PdfModal({ children, title }: Props) {
  const router = useRouter();

  const handleOpenChange = () => {
    router.back();
  };

  return (
    <Dialog defaultOpen={true} open={true} onOpenChange={handleOpenChange}>
      <DialogOverlay>
        <DialogContent className="overflow-y-auto max-w-[calc(100vw-100px)] sm:max-w-[calc(100vw-200px)] max-h-[calc(100vh-100px)] p-0 gap-0">
          <DialogHeader className="border-b sticky top-0 bg-background p-3">
            <DialogTitle className="mt-2">{title}</DialogTitle>
          </DialogHeader>
          <div className="p-0">
            {children}
          </div>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
}
