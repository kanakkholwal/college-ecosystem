"use client";

import { ButtonLink } from "@/components/utils/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Ghost,
  MessageSquareQuote,
  ShieldCheck,
  Sparkles,
  VenetianMask
} from "lucide-react";

const features = [
  {
    icon: <VenetianMask className="size-6 text-indigo-500" />,
    title: "True Anonymity",
    desc: "Your identity is cryptographically secure. Speak your mind without the fear of judgment.",
  },
  {
    icon: <MessageSquareQuote className="size-6 text-rose-500" />,
    title: "Unfiltered Dialogue",
    desc: "From confessions to critiques—experience the raw, authentic voice of the campus.",
  },
  {
    icon: <ShieldCheck className="size-6 text-emerald-500" />,
    title: "Community Moderated",
    desc: "A safe space maintained by the community. Toxic behavior is filtered out, truth remains.",
  },
];

export default function WhisperLandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none opacity-50 dark:opacity-20" />
      
      <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-center gap-16 py-20">
        
        {/* --- Hero Section --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-6 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-2 ring-1 ring-indigo-500/20 shadow-lg shadow-indigo-500/10">
            <Ghost className="size-8" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
            The Whisper Room
          </h1>
          
          <p className="text-xl text-muted-foreground leading-relaxed text-balance max-w-2xl mx-auto">
            A digital sanctuary for anonymous expression. 
            Share your confessions, secrets, and unfiltered thoughts with the campus community.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <ButtonLink 
                href="/whisper-room/whisper" 
                size="lg" 
                variant="default"
                className="h-12 px-8 rounded-full text-base shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105"
            >
              <Sparkles className="mr-2 size-4" /> Start Whispering
            </ButtonLink>
            <ButtonLink 
                href="/whisper-room/feed" 
                size="lg" 
                variant="outline"
                className="h-12 px-8 rounded-full text-base bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80"
            >
              Read Confessions <ArrowRight className="ml-2 size-4" />
            </ButtonLink>
          </div>
        </motion.div>

        {/* --- Features Grid --- */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="group relative p-8 rounded-3xl border border-border/50 bg-background/40 backdrop-blur-md hover:bg-background/60 transition-all hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5"
            >
              <div className="mb-4 inline-flex p-3 rounded-xl bg-background border border-border/50 shadow-sm group-hover:scale-110 transition-transform duration-300">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {f.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
          className="text-center space-y-6 pt-10"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground/60">
            Safe • Anonymous • Encrypted
          </p>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-border to-transparent mx-auto" />
        </motion.div>

      </div>
    </div>
  );
}