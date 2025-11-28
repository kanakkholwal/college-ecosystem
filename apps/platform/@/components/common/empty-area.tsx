import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import * as React from "react";

export type EmptyAreaProps = {
  icons?: LucideIcon[] | React.FC<React.SVGProps<SVGSVGElement>>[];
  title: string;
  description: string | React.ReactNode;
  actionProps?: React.ComponentProps<typeof Button> & {
    href?: string;
  }
} & React.HTMLAttributes<HTMLDivElement>;

export default function EmptyArea({
  title,
  description,
  className,
  icons = [],
  actionProps,
  ...props
}: EmptyAreaProps) {
  return (
    <div
      className={cn(
        "bg-card border-border hover:border-primary shadow-md text-center",
        "border rounded-xl p-14 w-full max-w-[620px]",
        "group hover:bg-primary/5 transition duration-500 hover:duration-200 mx-auto",
        className
      )}
      {...props}
    >
      <div className="flex justify-center isolate">
        {icons.length === 3 ? (
          <>
            <div className="bg-background size-12 grid place-items-center rounded-xl relative left-2.5 top-1.5 -rotate-6 shadow-lg ring-1 ring-border group-hover:-translate-x-5 group-hover:-rotate-12 group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
              {React.createElement(icons[0], {
                className: "w-6 h-6 text-muted-foreground",
              })}
            </div>
            <div className="bg-background size-12 grid place-items-center rounded-xl relative z-10 shadow-lg ring-1 ring-border group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
              {React.createElement(icons[1], {
                className: "w-6 h-6 text-muted-foreground",
              })}
            </div>
            <div className="bg-background size-12 grid place-items-center rounded-xl relative right-2.5 top-1.5 rotate-6 shadow-lg ring-1 ring-border group-hover:translate-x-5 group-hover:rotate-12 group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
              {React.createElement(icons[2], {
                className: "w-6 h-6 text-muted-foreground",
              })}
            </div>
          </>
        ) : (
          <div className="bg-card size-12 grid place-items-center rounded-xl shadow-lg ring-1 ring-border group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
            {icons[0] ? (
              React.createElement(icons[0], {
                className: "w-6 h-6 text-muted-foreground",
              })
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                id="Layer_1"
                data-name="Layer 1"
                viewBox="0 0 24 24"
                width={512}
                height={512}
                className="w-6 h-6 text-muted-foreground"
              >
                <title>empty</title>
                <path
                  className="stroke-primary/90"
                  d="M23.636,10.281l-1.197-2.236c-.439-.821-1.4-1.209-2.291-.92l-8.147,2.657L3.853,7.125c-.893-.29-1.852,.099-2.291,.92L.376,10.26c-.412,.685-.49,1.508-.213,2.258,.276,.75,.871,1.325,1.629,1.578l.21,.07-.006,3.621c0,1.941,1.235,3.658,3.077,4.272l4.862,1.621c.663,.221,1.359,.331,2.056,.331s1.393-.11,2.056-.331l4.866-1.622c1.843-.614,3.082-2.329,3.083-4.267v-3.625l.212-.071c.758-.253,1.353-.828,1.629-1.578,.277-.75,.199-1.573-.201-2.236ZM1.101,12.172c-.171-.464-.123-.973,.145-1.418l1.197-2.236c.164-.307,.48-.487,.813-.487,.095,0,.191,.015,.286,.046l7.719,2.517-1.972,3.635c-.387,.645-1.156,.931-1.867,.69l-5.313-1.771c-.469-.156-.836-.512-1.008-.975Zm10.384,10.816c-.419-.038-.833-.124-1.233-.258l-4.862-1.621c-1.433-.478-2.395-1.812-2.394-3.322l.005-3.288,4.104,1.368c.274,.091,.553,.135,.827,.135,.89,0,1.735-.463,2.225-1.279l1.334-2.457-.006,10.722Zm9.511-5.197c0,1.507-.965,2.84-2.399,3.317l-4.866,1.622c-.404,.135-.823,.221-1.246,.259l.006-10.758,1.362,2.51c.48,.802,1.323,1.261,2.212,1.261,.275,0,.555-.044,.829-.135l4.102-1.367v3.291Zm1.903-5.619c-.172,.463-.539,.818-1.008,.975l-5.313,1.771c-.715,.239-1.481-.047-1.856-.672l-1.982-3.653,7.719-2.517c.428-.141,.889,.048,1.1,.441l1.209,2.258c.256,.424,.304,.933,.133,1.396ZM4.759,5.851c-.193-.196-.191-.514,.006-.707L9.547,.437c.58-.582,1.532-.583,2.118,.003l1.885,1.885c.568-.508,1.515-.493,2.063,.055l2.754,2.753c.195,.195,.195,.512,0,.707-.195,.195-.512,.195-.707,0l-2.754-2.753c-.195-.195-.512-.195-.707,0l-4.349,4.27c-.098,.096-.225,.144-.351,.144-.13,0-.259-.05-.356-.149-.193-.197-.19-.514,.006-.707l3.686-3.619-1.878-1.878c-.195-.195-.512-.195-.707,0L5.466,5.856c-.098,.096-.224,.144-.351,.144-.129,0-.259-.05-.356-.149Z"
                />
              </svg>
            )}
          </div>
        )}
      </div>
      <h2 className="text-foreground font-medium mt-6">{title}</h2>
      <div className="text-sm text-muted-foreground mt-1 whitespace-pre-line mb-5">
        {description}
      </div>
      {actionProps && (
        actionProps.href ?
          <Button asChild {...actionProps} className={cn("shadow-sm active:shadow-none", actionProps.className)}>
           <Link href={actionProps.href}>
             {actionProps.children}
           </Link>
          </Button> :
          <Button
            {...actionProps}
            className={cn("shadow-sm active:shadow-none", actionProps.className)}
          />
      )}
    </div>
  );
}
