import { SocialBar, SupportBar } from "@/components/common/navbar";
import { ThemeSwitcher } from "./theme-switcher";

export default function Footer() {
  return (
    <footer className="flex justify-around flex-wrap gap-4 w-full max-w-6xl mx-auto">
    <SocialBar/>
    <SupportBar/>
    <ThemeSwitcher />
  </footer>
  );
}
