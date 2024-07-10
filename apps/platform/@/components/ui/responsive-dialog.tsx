"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useMediaQuery } from "usehooks-ts";

export type ResponsiveDialogProps = {
  children: React.ReactNode;
  title: string;
  description: string;
  btnProps: React.ComponentProps<typeof Button>;
  defaultOpen?: boolean;
  onOpenChange?(open: boolean): void;
  className?: string;
};

export function ResponsiveDialog({
  title,
  description,
  children,
  btnProps,
  className,
  defaultOpen,
  onOpenChange,
}: ResponsiveDialogProps) {
  const [open, setOpen] = useState(defaultOpen || false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          onOpenChange?.(value);
        }}
      >
        <DialogTrigger asChild>
          <Button {...btnProps} />
        </DialogTrigger>
        <DialogContent className={cn("sm:max-w-[425px]", className)}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        onOpenChange?.(value);
      }}
    >
      <DrawerTrigger asChild>
        <Button {...btnProps} />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className={cn("px-4 w-full", className)}>{children}</div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
