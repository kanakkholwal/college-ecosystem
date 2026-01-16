// components/header.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Facebook, Linkedin, Menu, Search, Twitter } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const navigationItems = [
  {
    title: "About NITH",
    items: [
      { title: "History", href: "/nith-history" },
      { title: "Vision & Mission", href: "/vision-mission" },
      { title: "Goals", href: "/goals" },
      { title: "Core Values", href: "/core-values" },
      { title: "About City", href: "/about-city" },
      { title: "Connectivity", href: "/connectivity" },
    ]
  },
  {
    title: "Authorities",
    items: [
      { 
        title: "Board of Governors (BOG)",
        subItems: [
          { title: "Composition of BOG", href: "/uploads/topics/16995962036784.pdf" },
          { title: "Minutes of BOG", href: "/minutes-of-bog" },
        ]
      },
      // ... other authority items
    ]
  },
  // ... other navigation categories
];

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className='bg-primary'>
      <div className="container mx-auto px-4 py-4 bg-primary">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="mr-8">
              <Image
                src="https://nith.ac.in/uploads/settings/15795036012617.png"
                alt="NITH Logo"
                width={200}
                height={60}
                className="h-16 w-auto"
              />
            </Link>
            
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex gap-4">
              <a href="https://www.facebook.com/Official.NITHamirpur" target="_blank" rel="noopener noreferrer">
                <Facebook className="text-white" size={20} />
              </a>
              <a href="https://twitter.com/nithamirpurhp" target="_blank" rel="noopener noreferrer">
                <Twitter className="text-white" size={20} />
              </a>
              <a href="https://www.linkedin.com/mwlite/in/nithamirpur-hamirpur-4688551b9" target="_blank" rel="noopener noreferrer">
                <Linkedin className="text-white" size={20} />
              </a>
            </div>
            
            {searchOpen ? (
              <div className="flex">
                <Input 
                  placeholder="Search..." 
                  className="h-8 w-40 transition-all duration-300"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSearchOpen(false)}
                  className="text-secondary"
                >
                  <Search size={18} />
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSearchOpen(true)}
                className="text-secondary"
              >
                <Search size={20} />
              </Button>
            )}
            
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger className="lg:hidden p-2">
                <Menu className="text-secondary" size={24} />
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="mt-8 space-y-4">
                  {navigationItems.map((item) => (
                    <div key={item.title} className="border-b pb-4">
                      <h3 className="font-bold text-primary mb-2">{item.title}</h3>
                      <ul className="space-y-2 pl-4">
                        {/* {item.items.map((subItem) => (
                          <li key={subItem.title}>
                            {subItem.subItems ? (
                              <div>
                                <h4 className="font-medium mb-1">{subItem.title}</h4>
                                <ul className="space-y-1 pl-4">
                                  {subItem.subItems.map((child) => (
                                    <li key={child.title}>
                                      <Link href={child.href} className="text-sm">
                                        {child.title}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : (
                              <Link href={subItem.href} className="hover:text-primary">
                                {subItem.title}
                              </Link>
                            )}
                          </li>
                        ))} */}
                      </ul>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <nav className='sticky top-0 z-50 shadow-md w-full bg-secondary py-1'>
        <NavigationMenu className="container px-4 justify-start mr-auto ml-0">
          <NavigationMenuList className='justify-start'>
            {navigationItems.map((navItem) => (
              <NavigationMenuItem key={navItem.title}>
                <NavigationMenuTrigger className="bg-transparent text-white! !hover:bg-transparent !data-[state=open]:bg-transparent  !data-[state=open]:focus:bg-transparent">
                  {navItem.title}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="p-4 space-y-2">
                    {navItem.items.map((item) => (
                      <li key={item.title}>
                        <Link href={item.title} className="block text-sm">
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </nav>
    </header>
  );
}