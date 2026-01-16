// components/accessibility-bar.tsx
'use client';

import { Button } from '@/components/ui/button';
import {
  Contrast,
  Home,
  Link as LinkIcon,
  Minus,
  Moon,
  Plus,
  RefreshCw,
  Sun
} from 'lucide-react';
import { useEffect, useState } from 'react';

export function AccessibilityBar() {
  const [contrast, setContrast] = useState(false);
  const [grayscale, setGrayscale] = useState(false);
  const [lightMode, setLightMode] = useState(true);
  const [underlinedLinks, setUnderlinedLinks] = useState(false);

  useEffect(() => {
    if (contrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    if (grayscale) {
      document.documentElement.classList.add('grayscale');
    } else {
      document.documentElement.classList.remove('grayscale');
    }
    
    if (underlinedLinks) {
      document.documentElement.classList.add('underlined-links');
    } else {
      document.documentElement.classList.remove('underlined-links');
    }
    
    document.documentElement.classList.toggle('dark', !lightMode);
  }, [contrast, grayscale, lightMode, underlinedLinks]);

  const changeFontSize = (increase: boolean) => {
    const html = document.documentElement;
    const currentSize = parseFloat(getComputedStyle(html).fontSize);
    const newSize = increase ? currentSize * 1.1 : currentSize * 0.9;
    html.style.fontSize = `${newSize}px`;
  };

  return (
    <div className="bg-secondary py-2 text-sm text-white">
      <div className="container mx-auto px-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon_xs"
            onClick={() => changeFontSize(true)}
          >
            <Plus size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon_xs"
            onClick={() => changeFontSize(false)}
          >
            <Minus size={16} />
          </Button>
        </div>
        
        <Button 
          variant="ghost"
          size="xs"
          onClick={() => setContrast(!contrast)}
          
        >
          <Contrast size={16} />
          Toggle Contrast
        </Button>
        
        <Button 
          variant="ghost"
          onClick={() => setGrayscale(!grayscale)}
          size="xs"
          
        >
          <Contrast size={16} />
          Grey Scale
        </Button>
        
        <Button 
          variant="ghost"
          onClick={() => setUnderlinedLinks(!underlinedLinks)}
          size="xs"
        >
          <LinkIcon size={16} />
          Links
        </Button>
        
        <Button 
          variant="ghost"
          onClick={() => setLightMode(!lightMode)}
          size="xs"
        >
        
          {lightMode ? <Moon size={16} /> : <Sun size={16} />}
          {lightMode ? 'Dark Mode' : 'Light Mode'}
        </Button>
        
        <Button 
          variant="ghost"
          onClick={() => window.location.reload()}
          size="xs"
        >
          <RefreshCw size={16} />
          Reset
        </Button>
        
        <div className="flex items-center gap-4 ml-auto">
          <a href="https://nith.ac.in" className="flex items-center gap-1 hover:text-primary">
            <Home size={16} />
            Home
          </a>
          <a href="http://172.16.28.5/" className="flex items-center gap-1 hover:text-primary">
            <LinkIcon size={16} />
            Intranet
          </a>
          <a href="https://eoffice.nith.ac.in/" className="flex items-center gap-1 hover:text-primary">
            <LinkIcon size={16} />
            eOffice
          </a>
          <a href="https://nith.ac.in/td/index.html" className="flex items-center gap-1 hover:text-primary">
            <LinkIcon size={16} />
            Directory
          </a>
          <a href="https://nith.ac.in/contact-us" className="flex items-center gap-1 hover:text-primary">
            <LinkIcon size={16} />
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}