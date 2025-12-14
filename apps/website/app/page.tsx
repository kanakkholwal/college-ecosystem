'use client'

import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Menu,
  Search,
  Trophy,
  Users
} from 'lucide-react';
import Link from 'next/link';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// --- Components ---

const Navbar = () => (
  <nav className="fixed top-0 w-full z-50 glass-nav transition-all duration-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-20">
        {/* Logo */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--nith-blue)] rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
            N
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-gray-900 leading-none">NIT Hamirpur</h1>
            <p className="text-xs text-gray-500 font-medium tracking-wider">INSTITUTE OF NATIONAL IMPORTANCE</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {['Academics', 'Admissions', 'Research', 'Campus Life', 'Placements'].map((item) => (
            <Link key={item} href="#" className="text-sm font-medium text-gray-600 hover:text-[var(--nith-sky)] transition-colors">
              {item}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5 text-gray-500" />
          </Button>
          <Button className="bg-[var(--nith-accent)] hover:bg-orange-600 text-white shadow-md rounded-full px-6">
            Apply Now
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon"><Menu /></Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-8">
                {['Academics', 'Admissions', 'Research', 'Campus Life'].map((item) => (
                  <Link key={item} href="#" className="text-lg font-medium">{item}</Link>
                ))}
                <Button className="w-full bg-[var(--nith-accent)]">Apply Now</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  </nav>
);

const HeroSection = () => (
  <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
    {/* Abstract Background Elements */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
      <div className="absolute top-20 left-10 w-96 h-96 bg-blue-200 rounded-full blur-3xl mix-blend-multiply filter animate-blob" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-purple-200 rounded-full blur-3xl mix-blend-multiply filter animate-blob animation-delay-2000" />
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Badge variant="outline" className="mb-6 px-4 py-1 border-[var(--nith-sky)] text-[var(--nith-blue)] bg-blue-50">
          Ranked 10th in NIRF Innovation 2025
        </Badge>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6">
          Architecting the <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--nith-blue)] to-[var(--nith-sky)]">
            Future of Technology
          </span>
        </h1>
        
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 mb-10 leading-relaxed">
          National Institute of Technology Hamirpur nurtures global leaders through world-class curriculum, cutting-edge research, and a vibrant Himalayan campus experience.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-[var(--nith-blue)] hover:bg-blue-900 shadow-xl transition-all hover:scale-105">
            Explore Programs
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-gray-300 hover:bg-gray-50 text-gray-700">
            Virtual Tour
          </Button>
        </div>
      </motion.div>

      {/* Floating Stats - Glass Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
      >
        {[
          { label: "Placement Rate", value: "98%", icon: Trophy },
          { label: "Research Papers", value: "2.5k+", icon: BookOpen },
          { label: "Faculty", value: "150+", icon: Users },
          { label: "Alumni Network", value: "10k+", icon: GraduationCap },
        ].map((stat, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 shadow-sm hover:shadow-md transition-all">
            <stat.icon className="w-6 h-6 text-[var(--nith-sky)] mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

const BentoGridSection = () => (
  <section className="py-24 bg-gray-50/50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Why NITH?</h2>
          <p className="text-gray-500 mt-2">Discover what makes our ecosystem unique.</p>
        </div>
        <Link href="#" className="text-[var(--nith-sky)] font-medium flex items-center hover:underline">
          View all features <ArrowRight className="ml-1 w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-6 h-auto md:h-[600px]">
        {/* Large Card - Research */}
        <Card className="col-span-1 md:col-span-2 row-span-2 relative overflow-hidden group border-0 shadow-lg bg-white">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
          {/* Placeholder for actual image */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581093588401-fbb62a02f120?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center group-hover:scale-105 transition-transform duration-700" />
          <div className="relative z-20 h-full flex flex-col justify-end p-8">
            <Badge className="w-fit mb-4 bg-[var(--nith-accent)] hover:bg-[var(--nith-accent)]">Research Focus</Badge>
            <h3 className="text-3xl font-bold text-white mb-2">Centre for Energy Studies</h3>
            <p className="text-gray-200 max-w-lg">
              Pioneering sustainable solutions for the Himalayas. Our labs are equipped with state-of-the-art simulation tools.
            </p>
          </div>
        </Card>

        {/* Small Card - Placements */}
        <Card className="col-span-1 row-span-1 border-0 shadow-md bg-white p-6 hover:shadow-lg transition-shadow">
           <CardHeader className="p-0 mb-4">
             <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
               <Trophy className="w-5 h-5" />
             </div>
             <CardTitle>Record Placements</CardTitle>
           </CardHeader>
           <CardContent className="p-0">
             <div className="text-4xl font-bold text-gray-900">₹1.5 Cr</div>
             <p className="text-sm text-gray-500 mt-1">Highest International Package (2025)</p>
           </CardContent>
        </Card>

        {/* Small Card - Campus Life */}
        <Card className="col-span-1 row-span-1 border-0 shadow-md bg-[#0E3B68] text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
          <CardHeader className="p-0 mb-4 relative z-10">
             <CardTitle className="text-white">Campus Life</CardTitle>
             <CardDescription className="text-gray-300">Experience the Himalayas</CardDescription>
          </CardHeader>
          <CardContent className="p-0 relative z-10 mt-auto">
             <Button variant="secondary" className="w-full justify-between group">
               Explore Clubs <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
);

const DepartmentTicker = () => (
  <section className="py-12 border-y border-gray-100 bg-white">
    <div className="max-w-7xl mx-auto px-4 overflow-hidden">
      <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8">
        Academic Departments
      </p>
      {/* Simple flex implementation for example; use Marquee component in prod */}
      <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
        {['Computer Science', 'Electronics & Comm.', 'Mechanical', 'Civil', 'Chemical', 'Architecture'].map((dept) => (
          <span key={dept} className="text-lg font-bold text-gray-800 cursor-pointer hover:text-[var(--nith-blue)]">
            {dept}
          </span>
        ))}
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-[#0E3B68] text-white pt-20 pb-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-2xl font-bold mb-6">NIT Hamirpur</h2>
          <p className="text-gray-300 max-w-sm leading-relaxed">
            An Institute of National Importance under Ministry of Education (MoE), Government of India.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
          <ul className="space-y-3 text-gray-300">
            <li><a href="#" className="hover:text-white">Academic Calendar</a></li>
            <li><a href="#" className="hover:text-white">Central Library</a></li>
            <li><a href="#" className="hover:text-white">Alumni Relations</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-4">Contact</h3>
          <address className="text-gray-300 not-italic space-y-3">
            <p>NIT Hamirpur, Himachal Pradesh</p>
            <p>Pin - 177005, India</p>
            <p>+91-1972-254011</p>
          </address>
        </div>
      </div>
      <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} National Institute of Technology Hamirpur. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <DepartmentTicker />
      <BentoGridSection />
      <Footer />
    </main>
  );
}