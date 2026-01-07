"use client";

import { StaggerChildrenItem } from "@/components/animation/motion";
import { Icon, IconType } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ControlledResponsiveDialog } from "@/components/ui/responsive-dialog"; // Your abstract component
import useStorage from "@/hooks/use-storage"; // Your custom hook
import { useEffect, useState } from "react";
import { PiGithubLogoDuotone } from "react-icons/pi";
import { appConfig } from "~/project.config";

// CONFIG
const REPO_URL = appConfig.githubRepo

export default function GithubStarPopup() {
    // 1. Permanent State (LocalStorage)
    const [hasStarred, setHasStarred] = useStorage<boolean>(
        "ecosystem_github_starred",
        false,
        "localStorage"
    );

    // 2. Session State (SessionStorage)
    const [hasDismissed, setHasDismissed] = useStorage<boolean>(
        "ecosystem_popup_dismissed",
        false,
        "sessionStorage"
    );

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Only show if they haven't starred AND haven't dismissed this session
        if (!hasStarred && !hasDismissed) {
            const timer = setTimeout(() => setIsOpen(true), 2000);
            return () => clearTimeout(timer);
        }
    }, [hasStarred, hasDismissed]);

    const handleStarAction = () => {
        window.open(REPO_URL, "_blank");
        setHasStarred(true);
        setIsOpen(false);
    };

    const handleDismiss = (open: boolean) => {
        if (!open) {
            setHasDismissed(true);
            setIsOpen(false);
        }
    };

    return (
        <ControlledResponsiveDialog
            open={isOpen}
            onOpenChange={handleDismiss}
            className="p-0 sm:p-0 overflow-hidden bg-card border-none shadow-2xl rounded-xl"
            title={<span className="sr-only">Star our GitHub Repo</span>}
            hideClose={true}
        >
            <div className="relative w-full bg-card overflow-hidden rounded-2xl">


                <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-orange-50 to-white z-0 pointer-events-none">
                    {/* Abstract Orange Blobs */}
                    <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-orange-200/50 rounded-3xl rotate-12" />
                    <div className="absolute top-10 left-12 w-16 h-16 bg-orange-300/30 rounded-2xl -rotate-6" />
                    <div className="absolute top-4 right-20 w-12 h-12 bg-orange-200/40 rounded-xl rotate-45" />
                    <div className="absolute top-[-40px] right-[-20px] w-40 h-40 bg-orange-300/20 rounded-full" />
                </div>

                <div className="absolute top-16 right-[-10px] z-20 w-32 h-32 animate-bounce-slow pointer-events-none">
                    <CuteOctopus />
                </div>

                <div className="relative z-10 flex flex-col items-center pt-12 pb-8 px-8 text-center">

                    <div className="bg-card p-3 rounded-2xl shadow-xl shadow-orange-100/50 mb-6 flex items-center gap-3 border border-orange-50 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                        <PiGithubLogoDuotone className="w-8 h-8 text-foreground" fill="currentColor" />
                        <span className="font-bold text-xl text-foreground tracking-tight">GitHub</span>
                    </div>

                    {/* Headline */}
                    <h2 className="text-2xl font-black text-neutral-800 leading-tight mb-4">
                        Keep Ecosystem <br />
                        <span className="text-primary">Free & Open Source</span>
                    </h2>

                    {/* Description */}
                    <p className="text-muted-foreground mb-8 font-medium leading-relaxed">
                        Building this platform takes time and effort. A star on GitHub costs you nothing, but it helps us grow and stay motivated!
                    </p>
                    {/* Actions */}
                    <div className="w-full space-y-3">
                        {/* Star Button */}
                        <Button
                            onClick={handleStarAction}
                            size="lg"
                            shadow="default"
                            width="full"
                            transition="scale"
                            className="group"
                        >
                            <PiGithubLogoDuotone className="group-hover:rotate-12 transition-transform duration-500" />
                            Star our GitHub repo
                        </Button>
                        <Button
                            onClick={() => handleDismiss(false)}
                            size="lg"
                            shadow="default"
                            width="full"
                            variant="ghost"
                        >
                            Maybe Later
                        </Button>


                    </div>

                    

                        <StaggerChildrenItem className="mt-4 inline-flex items-center justify-center p-1.5 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
                            {(Object.entries(appConfig.socials) as [IconType, string][]).map(([key, value]) => (
                                <a
                                    key={key}
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative flex items-center justify-center size-10 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95"
                                    aria-label={`Visit our ${key}`}
                                >
                                    <Icon name={key} className="size-5 transition-transform group-hover:-translate-y-0.5 group-hover:text-primary" />

                                    {/* Tooltip */}
                                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none capitalize whitespace-nowrap backdrop-blur-xl font-mono">
                                        {key}
                                    </span>
                                </a>
                            ))}
                        </StaggerChildrenItem>
                </div>


            </div>
        </ControlledResponsiveDialog>
    );
}

// --- The Original Cute Octopus SVG ---
const CuteOctopus = () => (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="rotate(10, 100, 100)">
            {/* Tentacles */}
            <path d="M60 140 C 40 160, 40 180, 60 190" stroke="#A78BFA" strokeWidth="12" strokeLinecap="round" />
            <path d="M85 145 C 80 170, 90 190, 100 195" stroke="#A78BFA" strokeWidth="12" strokeLinecap="round" />
            <path d="M115 145 C 130 170, 120 190, 110 195" stroke="#A78BFA" strokeWidth="12" strokeLinecap="round" />
            <path d="M140 140 C 160 160, 160 180, 140 190" stroke="#A78BFA" strokeWidth="12" strokeLinecap="round" />

            {/* Body */}
            <path d="M50 100 C 50 40, 150 40, 150 100 C 150 140, 50 140, 50 100" fill="#C4B5FD" stroke="#8B5CF6" strokeWidth="4" />

            {/* Eyes */}
            <circle cx="80" cy="90" r="15" fill="white" />
            <circle cx="80" cy="90" r="5" fill="black" />
            <circle cx="120" cy="90" r="15" fill="white" />
            <circle cx="120" cy="90" r="5" fill="black" />

            {/* Mouth */}
            <path d="M90 110 Q 100 120, 110 110" stroke="black" strokeWidth="3" strokeLinecap="round" />

            {/* Blush */}
            <circle cx="65" cy="105" r="6" fill="#F472B6" opacity="0.6" />
            <circle cx="135" cy="105" r="6" fill="#F472B6" opacity="0.6" />

            {/* Holding Heart */}
            <path d="M30 110 C 10 90, 50 60, 50 100" fill="#FB7185" stroke="#E11D48" strokeWidth="2" transform="translate(10, 20) scale(0.8) rotate(-20)" />
        </g>
    </svg>
);