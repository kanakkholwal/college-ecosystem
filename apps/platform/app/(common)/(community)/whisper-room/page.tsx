"use client";

import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonLink } from "@/components/utils/link";
import { motion } from "framer-motion";
import { PenLine, Podcast, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { RiSpeakLine } from "react-icons/ri";

const features = [
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: "Safe & Anonymous",
    desc: "Confess, vent, or share thoughts freely. Your identity stays protected unless you choose otherwise.",
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Real College Voices",
    desc: "Read unfiltered experiences, opinions, and stories from your campus peers.",
  },
  {
    icon: <PenLine className="h-8 w-8 text-primary" />,
    title: "Express Yourself",
    desc: "Write posts, polls, and attach media. From shower thoughts to bold critiques—everything belongs.",
  },
];
export default function WhisperLandingPage() {

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl"
      >
        <div className="flex items-center justify-center mb-4">
          <Podcast className="h-10 w-10 text-primary animate-pulse" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Whisper Room
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A safe, anonymous corner of your campus community. Share confessions,
          criticisms, praises, and unfiltered thoughts—without judgment.
        </p>

        <div className="mt-6 flex gap-4 justify-center">
          <ButtonLink size="lg"href="/whisper-room/whisper">
            <RiSpeakLine />
            Start Whispering
          </ButtonLink>
          <ButtonLink variant="outline" size="lg"  href="/whisper-room/feed">
            Explore Feed
            <Icon name="arrow-right"  />
          </ButtonLink>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ staggerChildren: 0.15 }}
        className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl"
      >
        {features.map((f, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.4 }}
          >
            <Card className="shadow-md hover:shadow-lg transition-all">
              <CardContent className="p-6 flex flex-col items-center text-center">
                {f.icon}
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Closing CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mt-20 max-w-2xl"
      >
        <h2 className="text-2xl font-bold">
          Your thoughts deserve to be heard.
        </h2>
        <p className="mt-2 text-muted-foreground">
          Whether it’s a secret, an idea, or just a random shower thought—let it
          out in the Whisper Room.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/whisper-room/page">Create a Whisper</Link>
        </Button>
      </motion.div>
    </div>
  );
}
