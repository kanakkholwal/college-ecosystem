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
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import React, { useMemo, useState } from "react";

export type ResponsiveDialogProps = {
  children: React.ReactNode;
  title: string | React.ReactNode;
  description: string | React.ReactNode;
  btnProps: React.ComponentProps<typeof Button>;
  defaultOpen?: boolean;
  onOpenChange?(open: boolean): void;
  className?: string;
  showCloseButton?: boolean;
  hideHeader?: boolean;
};

const ResponsiveDialog = React.memo(
  ({
    title,
    description,
    children,
    btnProps,
    className,
    defaultOpen,
    onOpenChange,
    showCloseButton = true,
    hideHeader = false,
  }: ResponsiveDialogProps) => {
    const [open, setOpen] = useState(defaultOpen || false);
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const handleOpenChange = (value: boolean) => {
      setOpen(value);
      onOpenChange?.(value);
    }

    const dialog = useMemo(() => {
      if (isDesktop) {
        return (
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button {...btnProps} />
            </DialogTrigger>
            <DialogContent
              className={cn("sm:max-w-[425px] @container/dialog", className)}
            >
              <DialogHeader className={cn(hideHeader ? "hidden" : "text-left")}>
                <DialogTitle className="text-pretty">{title}</DialogTitle>
                <DialogDescription className="text-pretty">
                  {description}
                </DialogDescription>
              </DialogHeader>
              {children}
            </DialogContent>
          </Dialog>
        );
      }

      return (
        <Drawer open={open} onOpenChange={handleOpenChange}>
          <DrawerTrigger asChild>
            <Button {...btnProps} />
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className={cn(hideHeader ? "hidden" : "text-left")}>
              <DrawerTitle className="text-pretty">{title}</DrawerTitle>
              <DrawerDescription className="text-pretty">
                {description}
              </DrawerDescription>
            </DrawerHeader>
            <div className={cn("px-4 w-full @container/dialog space-y-3", className, showCloseButton ? " " : "pb-4")}>
              {children}
            </div>
            {showCloseButton && (
              <DrawerFooter className="pt-2 justify-end">
                <DrawerClose asChild>
                  <Button size="sm" variant="outline">
                    Cancel
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            )}
          </DrawerContent>
        </Drawer>
      );
    }, [
      isDesktop,
      open,
      onOpenChange,
      btnProps,
      className,
      title,
      description,
      children,
    ]);

    return dialog;
  },
  (prevProps, nextProps) =>
    prevProps.title === nextProps.title &&
    prevProps.description === nextProps.description &&
    prevProps.btnProps === nextProps.btnProps &&
    prevProps.className === nextProps.className &&
    prevProps.defaultOpen === nextProps.defaultOpen &&
    prevProps.onOpenChange === nextProps.onOpenChange &&
    prevProps.children === nextProps.children
);

export { ResponsiveDialog };

export interface ControlledResponsiveDialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  hideClose?: boolean;
}

export function ControlledResponsiveDialog({
  children,
  open,
  onOpenChange,
  title,
  description,
  className,
  hideClose = false,
}: ControlledResponsiveDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn("sm:max-w-[425px]", className)}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          {description && (
            <DrawerDescription>{description}</DrawerDescription>
          )}
        </DrawerHeader>
        <div className={cn("px-4", className)}>
          {children}
        </div>
        {!hideClose && (
          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}