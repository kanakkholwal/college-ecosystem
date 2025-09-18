"use client";
// create a useShare hook with navigator.share() as a fallback
// https://web.dev/web-share/
// https://developer.mozilla.org/en-IN/docs/Web/API/Navigator/share
// https://caniuse.com/web-share
// https://caniuse.com/web-share-api
// https://caniuse.com/web-share-target
// https://caniuse.com/web-share-target-api
import { Linkedin } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { IoLogoReddit, IoMailOutline } from "react-icons/io5";
import { LuFacebook } from "react-icons/lu";
import { TbBrandTelegram } from "react-icons/tb";

import { useMemo } from "react";
import toast from "react-hot-toast";
import { FaPinterestP, FaXTwitter } from "react-icons/fa6";

type Social = {
  name: string;
  url: string;
  icon: React.ElementType;
};

export const useShare = (data: {
  title?: string;
  text?: string;
  url?: string;
  image?: string;
}) => {
  

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: data.text,
          url: data.url,
        });
      } catch (error) {
        toast.error("Failed to share content");
        console.error(error);
      }
    } else {
      toast.error("Web Share API not supported in your browser");
      console.error("Web Share API not supported in your browser");
    }
  };
  const isNativeShareSupported = !!navigator.share;

  return {
    share,
    isNativeShareSupported,
    socials: [
      {
        name: "facebook",
        url: `https://www.facebook.com/sharer/sharer.php?u=${data.url}`,
        icon: LuFacebook,
      },
      {
        name: "twitter",
        url: `https://twitter.com/intent/tweet?url=${data.url}&text=${data.title}`,
        icon: FaXTwitter,
      },
      {
        name: "linkedin",
        url: `https://www.linkedin.com/shareArticle?mini=true&url=${data.url}&title=${data.title}`,
        icon: Linkedin,
      },
      {
        name: "whatsapp",
        url: `https://api.whatsapp.com/send?text=${data.url}`,
        icon: FaWhatsapp,
      },
      {
        name: "pinterest",
        url: `https://pinterest.com/pin/create/button/?url=${data.url}&media=${data.image}&description=${data.text}`,
        icon: FaPinterestP,
      },
      {
        name: "telegram",
        url: `https://t.me/share/url?url=${data.url}&text=${data.title}`,
        icon: TbBrandTelegram,
      },
      {
        name: "reddit",
        url: `https://www.reddit.com/submit?url=${data.url}&title=${data.title}`,
        icon: IoLogoReddit,
      },
      {
        name: "email",
        url: `mailto:?subject=${data.title}&body=${data.text}: ${data.url}`,
        icon: IoMailOutline,
      },
    ] as Social[],
  };
};
