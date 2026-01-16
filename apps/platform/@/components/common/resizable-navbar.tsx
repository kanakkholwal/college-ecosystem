"use client";
import { cn } from "@/lib/utils";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { Menu as IconMenu, X as IconX } from "lucide-react";
import { usePathname } from "next/navigation";

import React, { useRef, useState } from "react";

type MegaMenuLinks = {
  title: string;
  href: string;
  image?: string;
  Icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  description: string;
};

export type MegaMenuNavLinksType = {
  title: string;
  type: "mega_menu";
  href?: string;
  items: MegaMenuLinks[];
};
export type DropdownNavLinksType = {
  title: string;
  type: "dropdown";
  href?: string;
  items: {
    title: string;
    href: string;
  }[];
};
export type LinkNavLinksType = {
  title: string;
  type: "link";
  href: string;
};
export type NavLinksType =
  | MegaMenuNavLinksType
  | DropdownNavLinksType
  | LinkNavLinksType;

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: NavLinksType[];
  className?: string;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div
      ref={ref}
      // IMPORTANT: Change this to class of `fixed` if you want the navbar to be fixed
      className={cn("fixed inset-x-0 top-5 z-40 w-full rounded-2xl", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible }
            )
          : child
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "40%" : "100%",
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full bg-transparent px-4 py-2 sm:flex",
        "min-w-[calc(100%_-_theme(spacing.4))] md:min-w-[800px]",
        visible && "bg-card",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const pathname = usePathname();

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      style={{
        paddingBottom: hovered !== null ? "300px" : "0px",
        marginBottom: hovered !== null ? "-300px" : "0px",
      }}
      className={cn(
        "relative inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-muted-foreground transition duration-200 hover:text-foreground lg:flex lg:space-x-2 px-3",
        className
      )}
    >
      {items.map((item, idx) => {
        if (item.type === "link") {
          return (
            <DefaultLink
              key={item.title}
              active={idx === hovered || pathname.includes(item.href)}
              onMouseEnter={() => setHovered(idx)}
              href={item.href}
            >
              {item.title}
            </DefaultLink>
          );
        }
        return (
          <MenuItem
            key={item.title}
            onMouseEnter={() => setHovered(idx)}
            active={hovered === idx ? item.title : null}
            item={item.title}
          >
            <div
              className={
                item.type === "mega_menu"
                  ? "text-sm grid grid-cols-2 gap-10 p-4"
                  : "flex flex-col gap-0 text-sm p-2"
              }
            >
              {item.type === "dropdown" &&
                item.items.map((subItem) => (
                  <DropDownLink key={subItem.title} href={subItem.href}>
                    {subItem.title}
                  </DropDownLink>
                ))}
              {item.type === "mega_menu" &&
                item.items.map((subItem) => {
                  return (
                    <MegaMenuLink
                      key={subItem.title}
                      title={subItem.title}
                      description={subItem.description}
                      href={subItem.href}
                      image={subItem.image}
                    />
                  );
                })}
            </div>
          </MenuItem>
        );
      })}
    </motion.div>
  );
};
const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
  spring: {
    type: "spring",
    damping: 20,
    stiffness: 300,
  },
};
export const MenuItem = ({
  onMouseEnter,
  active,
  item,
  children,
}: {
  onMouseEnter: () => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
}) => {
  return (
    <div onMouseEnter={() => onMouseEnter()} className="relative">
      <motion.div
        transition={{ duration: 0.3 }}
        className="cursor-pointer relative px-4 py-2 text-muted-foreground hover:text-foreground"
      >
        {active && (
          <motion.div
            layoutId="hovered"
            className="absolute inset-0 h-full w-full rounded-full bg-accent/40 backdrop-blur dark:border"
          />
        )}
        <span className="relative z-20 whitespace-nowrap">{item}</span>
      </motion.div>
      {active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* {active === item && ( */}
          <div className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
            <motion.div
              transition={{ duration: 0.3 }}
              layoutId="active" // layoutId ensures smooth animation
              className="bg-popover/90 backdrop-blur-2xl rounded-lg overflow-hidden border shadow-xl"
            >
              <motion.div
                layout // layout ensures smooth animation
                className="w-max h-full"
              >
                {children}
              </motion.div>
            </motion.div>
          </div>
          {/* )} */}
        </motion.div>
      )}
    </div>
  );
};

export const MegaMenuLink = ({
  title,
  description,
  href,
  image,
  Icon,
}: {
  title: string;
  description: string;
  href: string;
  image?: string;
  Icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}) => {
  return (
    <a
      href={href}
      className="flex space-x-2 group hover:bg-background p-4 rounded-lg"
    >
      {image && (
        <img
          src={image}
          width={140}
          height={70}
          alt={title}
          className="shrink-0 rounded-md shadow-2xl object-cover w-36 h-20"
        />
      )}
      {Icon && (
        <Icon className="size-6 shrink-0 text-neutral-700 dark:text-neutral-300" />
      )}
      <div>
        <h4 className="text-lg font-semibold mb-1 text-black dark:text-white">
          {title}
        </h4>
        <p className="text-neutral-700 text-sm max-w-[10rem] dark:text-neutral-300 font-light">
          {description}
        </p>
      </div>
    </a>
  );
};

export const DropDownLink = ({ children, ...rest }: any) => {
  return (
    <a
      {...rest}
      className="text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors duration-200"
    >
      {children}
    </a>
  );
};
export const DefaultLink = ({
  children,
  href,
  className,
  active,
  onMouseEnter,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
  active?: boolean;
  onMouseEnter?: () => void;
}) => {
  return (
    <motion.div
      transition={{ duration: 0.3 }}
      onMouseEnter={onMouseEnter}
      className="cursor-pointer relative px-4 py-2 text-muted-foreground hover:text-foreground"
    >
      {active && (
        <motion.div
          layoutId="hovered"
          className="absolute inset-0 h-full w-full rounded-full bg-accent/40 backdrop-blur dark:border"
        />
      )}
      <a
        href={href}
        className={cn("relative z-20 whitespace-nowrap", className)}
      >
        {children}
      </a>
    </motion.div>
  );
};
export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "90%" : "100%",
        paddingRight: visible ? "12px" : "0px",
        paddingLeft: visible ? "12px" : "0px",
        borderRadius: visible ? "4px" : "2rem",
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-0 py-2 sm:hidden rounded-2xl",
        visible && "bg-popover",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between",
        className
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
  onClose,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-lg bg-white px-4 py-8 shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] dark:bg-neutral-950",
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return isOpen ? (
    <IconX className="text-black dark:text-white" onClick={onClick} />
  ) : (
    <IconMenu className="text-black dark:text-white" onClick={onClick} />
  );
};
