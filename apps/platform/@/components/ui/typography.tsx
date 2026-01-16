"use client";

import type * as React from "react";

import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

// headings
const headingVariants = cva("font-semibold tracking-tight", {
  variants: {
    level: {
      1: "text-4xl font-extrabold lg:text-5xl",
      2: "text-3xl",
      3: "text-2xl",
      4: "text-xl",
      5: "text-lg",
      6: "text-base",
    },
  },
  defaultVariants: {
    level: 1,
  },
});
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const Heading: React.FC<HeadingProps> = ({
  level = 1,
  className,
  ...props
}) => {
  const Tag: React.ElementType = `h${level}`;
  return (
    <Tag className={cn(headingVariants({ level }), className)} {...props} />
  );
};

// paragraphs
const paragraphVariants = cva(
  "leading-7 [&:not(:first-child)]:mt-6 text-base text-muted-foreground",
  {
    variants: {},
    defaultVariants: {},
  }
);
interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const Paragraph: React.FC<ParagraphProps> = ({
  className,
  ...props
}) => {
  return <p className={cn(paragraphVariants({}), className)} {...props} />;
};

// blockquote
const blockquoteVariants = cva("mt-6 border-l-2 pl-6 italic", {
  variants: {},
  defaultVariants: {},
});
interface BlockquoteProps extends React.HTMLAttributes<HTMLQuoteElement> {}

export const Blockquote: React.FC<BlockquoteProps> = ({ ...props }) => {
  return (
    <blockquote
      className={cn(blockquoteVariants({}), props.className)}
      {...props}
    />
  );
};

// Table

export const Table: React.FC<React.HTMLAttributes<HTMLTableElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <table className={cn("w-full table-auto", className)} {...props}>
      {children}
    </table>
  );
};

export const TableHead: React.FC<
  React.HTMLAttributes<HTMLTableSectionElement>
> = ({ children, className, ...props }) => {
  return (
    <thead className={cn(className)} {...props}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<
  React.HTMLAttributes<HTMLTableSectionElement>
> = ({ children, className, ...props }) => {
  return (
    <tbody className={cn(className)} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <tr className={cn("m-0 border-t p-0 even:bg-muted", className)} {...props}>
      {children}
    </tr>
  );
};

export const TableCell: React.FC<
  React.HTMLAttributes<HTMLTableCellElement>
> = ({ children, className, ...props }) => {
  return (
    <td
      className={cn(
        "border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
};

export const TableHeadCell: React.FC<
  React.HTMLAttributes<HTMLTableHeaderCellElement>
> = ({ children, className, ...props }) => {
  return (
    <th
      className={cn(
        "border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
};
