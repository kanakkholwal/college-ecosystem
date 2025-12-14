import { ThemeSwitcher } from "@/components/common/theme-switcher";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/utils/link";
import { ArrowRight, Code2, Flame, Terminal, Trophy, Users, Zap } from "lucide-react";
import PerkCard from "./components/PerkCard";
import TimelineItem from "./components/TimelineItem";

const timeline = [
    { day: "01-02", title: "Ideation & Teaming", description: "Lock in your squad. Brainstorm constraints. Finalize the problem statement." },
    { day: "03-07", title: "The Build Sprint", description: "Heads down coding. MVP focus. Daily standups and mentor unblocking sessions." },
    { day: "08-09", title: "Polish & Pitch", description: "UI/UX cleanup. Bug bashing. Preparing the pitch deck and demo flow." },
    { day: "10", title: "Demo Day", description: "Live presentations to investors and judges. Networking mixer." }
];
const programConfig = {
    name: "Builder Club",
    description: "Join the Builder Club at NITH to build real projects with peers.",
    heroVideo: "https://vin9ofcd7b.ufs.sh/f/cp3W6Ixy53KeGfTmPhVk2lCKH03abZPYxMTh6QURgN7DAXm8",
} as const;

export default function BuilderClubPage() {

    return (
        <div className="min-h-screen">

            {/* --- HERO SECTION --- */}
            <section className="relative w-full min-h-[90vh] flex flex-col justify-center items-center overflow-hidden border-b border-border">
                {/* Abstract Background Grid - Uses border opacity for adaptation */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:24px_24px] -z-10"></div>
                {/* Radial Gradient overlay for depth */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-30%,hsl(var(--foreground)/0.1),transparent)] -z-10"></div>

                <div className="relative z-10 container mx-auto px-6 text-center">
                    <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm bg-muted/50 text-muted-foreground backdrop-blur-sm rounded-full border-border">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                        Applications Open for Batch &apos;26
                    </Badge>

                    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6">
                        Build Fast. <br />
                        <span className="text-primary">Break Things.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                        <span className="text-foreground font-semibold">Build House</span> is a 10-day intensive engineering sprint.
                        No fluff. No theory. Just 15 selected builders shipping real products.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <ButtonLink size="lg" className="h-12 px-8 text-base rounded-full font-semibold"
                            href="builder-club/apply-now">
                            Apply for Batch
                            <ArrowRight />
                        </ButtonLink>
                        <ButtonLink variant="outline" size="lg" className="h-12 px-8 text-base rounded-full bg-transparent hover:bg-muted" href="#manifesto">
                            Read Manifesto
                        </ButtonLink>
                    </div>

                    {/* Floating UI Elements / Decor */}
                    <div className="mt-20 flex justify-center gap-8 text-muted-foreground/60">
                        <div className="flex items-center gap-2 hover:text-foreground transition-colors"><Terminal size={20} /> <span>Shipping Code</span></div>
                        <div className="flex items-center gap-2 hover:text-foreground transition-colors"><Users size={20} /> <span>15 Builders</span></div>
                        <div className="flex items-center gap-2 hover:text-foreground transition-colors"><Trophy size={20} /> <span>₹5k Prizes</span></div>
                    </div>
                </div>
            </section>

            {/* --- ABOUT / MANIFESTO SECTION --- */}
            <section id="manifesto" className="py-24 border-b border-border">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-primary to-accent rounded-2xl opacity-20 blur-xl group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden border border-border shadow-2xl bg-muted">
                                {/* Replace with actual image */}
                                <video
                                    className="absolute inset-0 w-full h-full object-cover z-0 animate-zoom-in-slow hover:scale-105 transition-transform duration-700"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    src={programConfig.heroVideo}
                                />
                            </div>
                        </div>
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                                Not a classroom. <br />
                                <span className="text-primary">An Arena.</span>
                            </h2>
                            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                                <p>
                                    Most colleges teach you how to write code. We teach you how to <span className="text-foreground font-semibold">ship products</span>.
                                </p>
                                <p>
                                    Build House provides the high-agency environment missing from traditional education. You get 24/7 access to the house, unlimited coffee, premium AI tools, and mentorship from founders who have actually exited.
                                </p>
                                <ul className="grid grid-cols-2 gap-4 pt-4">
                                    <li className="flex items-center gap-2 text-sm font-medium text-foreground"><CheckIcon /> 10 Days On-site</li>
                                    <li className="flex items-center gap-2 text-sm font-medium text-foreground"><CheckIcon /> Zero Equity Taken</li>
                                    <li className="flex items-center gap-2 text-sm font-medium text-foreground"><CheckIcon /> Full Scholarship</li>
                                    <li className="flex items-center gap-2 text-sm font-medium text-foreground"><CheckIcon /> Merch & Swag</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- BENTO GRID PERKS --- */}
            <section className="py-24">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">The Builder&apos;s Stack</h2>
                        <p className="text-muted-foreground text-lg">We remove every friction point so you can focus on one thing: Building.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
                        {/* Large Card - Uses Primary Color as BG for emphasis */}
                        <PerkCard
                            className="md:col-span-2 bg-primary text-primary-foreground border-primary"
                            icon={<Zap className="text-yellow-400" size={32} />}
                            title="The Tech Stack"
                            description="Access to ChatGPT Plus, Midjourney, Vercel Pro, and Supabase credits. We pay for the infrastructure."
                            featured
                        />

                        {/* Standard Cards - Use Card/Background colors */}
                        <PerkCard
                            icon={<Users className="text-blue-500" size={32} />}
                            title="Network"
                            description="Join a mafia of 50+ alumni builders who are founding companies and interning at unicorns."
                        />

                        <PerkCard
                            icon={<Code2 className="text-purple-500" size={32} />}
                            title="Code Reviews"
                            description="Daily code reviews from senior engineers. Learn industry patterns, not just syntax."
                        />

                        {/* Large Card */}
                        <PerkCard
                            className="md:col-span-2"
                            icon={<Flame className="text-orange-500" size={32} />}
                            title="Demo Day Exposure"
                            description="Pitch directly to VCs and Angels. Last batch raised pre-seed funding within 3 weeks of demo day."
                        />
                    </div>
                </div>
            </section>

            {/* --- TIMELINE SECTION --- */}
            <section className="py-24 border-t border-border">
                <div className="container mx-auto px-6 max-w-4xl">
                    <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">The 10-Day Sprint</h2>
                    <div className="relative border-l border-dashed border-border ml-4 md:ml-0 md:pl-0 space-y-12">
                        {timeline.map((item, i) => (
                            <TimelineItem key={i} {...item} />
                        ))}
                    </div>
                </div>
            </section>

            {/* --- CTA SECTION --- */}
            <section className="py-24 px-4 sm:px-6">
                <div className="relative max-w-5xl mx-auto group">

                    {/* Glowing Backdrop (animated on hover) */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

                    <div className="relative rounded-[2rem] border border-border bg-card/50 backdrop-blur-xl overflow-hidden p-8 md:p-16 text-center">

                        {/* Background Decor: Grid & Beam */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.05)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

                        <div className="relative z-10 flex flex-col items-center gap-6">

                            {/* Status Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-mono font-medium uppercase tracking-wider mb-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                Batch &apos;26 Status: Filling Fast
                            </div>

                            {/* Main Typography */}
                            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-foreground max-w-3xl">
                                Ready to ship your <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                                    Magnum Opus?
                                </span>
                            </h2>

                            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                                Don&apos;t let your ideas rot in a Notion doc. Join the high-agency environment where builders become founders.
                            </p>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
                                <ButtonLink size="lg" className="h-14 px-8 rounded-full text-base font-bold shadow-lg shadow-primary/20"
                                    href="builder-club/apply-now">
                                    <Terminal className="w-4 h-4 mr-2" />
                                    Initialize Application
                                </ButtonLink>

                                <ButtonLink variant="outline" size="lg" disabled className="h-14 px-8 rounded-full text-base bg-background/50 hover:bg-background border-primary/20 hover:border-primary/50 transition-all" href="/waitlist">
                                    Join Waitlist <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </ButtonLink>
                            </div>

                            {/* Footer Micro-copy */}
                            <p className="text-xs text-muted-foreground/60 font-mono mt-4">
                                15 SLOTS AVAILABLE • 10 DAY SPRINT • SHIPPED OR NOTHING
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <div className="fixed bottom-4 left-4 z-100 right-auto">
                <ThemeSwitcher />
            </div>
        </div>
    );
}

function CheckIcon() {
    return (
        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
    )
}