'use client';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { RadioGroup } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import type { ComponentProps, HTMLAttributes } from 'react';



export type ChoiceboxProps = ComponentProps<typeof RadioGroup>;
export const Choicebox = ({ className, ...props }: ChoiceboxProps) => (
  <RadioGroup className={cn('w-full', className)} {...props} />
);
export type ChoiceboxItemProps = RadioGroupPrimitive.RadioGroupItemProps;
export const ChoiceboxItem = ({
  className,
  children,
  ...props
}: ChoiceboxItemProps) => (
  <RadioGroupPrimitive.Item
    asChild
    className={cn(
      'text-left',
      '[&[data-state="checked"]]:border-primary',
      '[&[data-state="checked"]]:bg-primary-foreground'
    )}
    {...props}
  >
    <Card
      className={cn(
        'flex cursor-pointer flex-row items-start justify-between rounded-md p-4 shadow-none transition-all',
        className
      )}
    >
      {children}
    </Card>
  </RadioGroupPrimitive.Item>
);
export type ChoiceboxItemHeaderProps = ComponentProps<typeof CardHeader>;
export const ChoiceboxItemHeader = ({
  className,
  ...props
}: ComponentProps<typeof CardHeader>) => (
  <CardHeader className={cn('flex-1 p-0', className)} {...props} />
);
export type ChoiceboxItemTitleProps = ComponentProps<typeof CardTitle>;
export const ChoiceboxItemTitle = ({
  className,
  ...props
}: ChoiceboxItemTitleProps) => (
  <CardTitle
    className={cn('flex items-center gap-2 text-sm', className)}
    {...props}
  />
);
export type ChoiceboxItemSubtitleProps = HTMLAttributes<HTMLSpanElement>;
export const ChoiceboxItemSubtitle = ({
  className,
  ...props
}: ChoiceboxItemSubtitleProps) => (
  <span
    className={cn('font-normal text-muted-foreground text-xs', className)}
    {...props}
  />
);
export type ChoiceboxItemDescriptionProps = ComponentProps<
  typeof CardDescription
>;