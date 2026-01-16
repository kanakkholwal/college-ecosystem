"use client"
import { cn } from "@/lib/utils";
import { HTMLMotionProps, motion, spring } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
        },
    },
};

type StaggerChildrenContainerProps = React.ButtonHTMLAttributes<HTMLDivElement> &
    HTMLMotionProps<"div"> & {
        children: React.ReactNode;
        className?: string;
    };

export function StaggerChildrenContainer({
    children,
    className = "",
    ...props
}: StaggerChildrenContainerProps) {
    return (
        <motion.div
            className={cn(className)}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }} // animate once
            {...props}
        >
            {children}
        </motion.div>
    );
}

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: spring, stiffness: 100 },
    },
};

type StaggerChildrenItemProps = React.HTMLAttributes<HTMLDivElement> &
    HTMLMotionProps<"div"> & {
        children: React.ReactNode;
        className?: string;
    };

export function StaggerChildrenItem({
    children,
    className = "",
    ...props
}: StaggerChildrenItemProps) {
    return (
        <motion.div
            className={cn(className)}
            variants={itemVariants}
            {...props}
        >
            {children}
        </motion.div>
    );
}
