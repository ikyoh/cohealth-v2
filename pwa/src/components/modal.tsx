"use client";
import { useRouter } from "next/navigation";
import React, { PropsWithChildren } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogOverlay, DialogTitle } from "./ui/dialog";


type Props = PropsWithChildren<{
  title: string;
  description?: string;
}>;


export default function Modal({ children, title, description }: Props) {
  const router = useRouter();

  const handleOpenChange = () => {
    router.back();
  };

  return (
    <Dialog defaultOpen={true} open={true} onOpenChange={handleOpenChange}>
      <DialogOverlay>
        <DialogContent className="overflow-y-auto max-h-[calc(100vh-100px)] p-0">
          <DialogHeader className="border-b sticky top-0 bg-background p-3">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          <div className="p-3">
            {React.isValidElement(children)
              ? React.cloneElement(children as React.ReactElement<any>, { handleOpenChange })
              : children}
          </div>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
}
