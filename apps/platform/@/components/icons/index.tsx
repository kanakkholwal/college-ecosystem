import {
  Activity,
  AlignLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BarChart2,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Calendar,
  Camera,
  ChartBarBig,
  ChartCandlestick,
  CircleAlert,
  CirclePlus,
  Code,
  Command,
  CopyCheckIcon,
  CopyIcon,
  Cpu,
  Dot,
  EllipsisVertical,
  Eye,
  Facebook,
  Gamepad2,
  Github,
  Globe,
  Instagram,
  LayoutTemplate,
  Linkedin,
  LoaderCircleIcon,
  Lock,
  Mail,
  Palette,
  Phone,
  Pin,
  Plus,
  Podcast,
  RocketIcon,
  Search,
  Share,
  ShieldCheck,
  SparklesIcon,
  Terminal,
  TrendingUp,
  Twitter,
  Users,
  X,
  Youtube,
  Zap,
} from "lucide-react";

import {
  FaChrome,
  FaEdge,
  FaFirefoxBrowser,
  FaHeart,
  FaRegHeart,
  FaSafari,
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { GrArticle } from "react-icons/gr";
import { LuMonitor, LuMonitorSmartphone, LuSmartphone } from "react-icons/lu";
import { MdHistoryEdu } from "react-icons/md";
import { RiTwitterXFill } from "react-icons/ri";

export type IconComponentType = {
  [key: string]: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};
export const IconComponent = {
  articles: GrArticle,
  experiences: MdHistoryEdu,
  activity: Activity,
  barchart: BarChart2,
  book: BookOpen,
  calendar: Calendar,
  sparkles: SparklesIcon,
  code: Code,
  dot: Dot,
  eye: Eye,
  camera: Camera,
  facebook: Facebook,
  gamepad2: Gamepad2,
  palette: Palette,
  youtube: Youtube,
  zap: Zap,
  cpu: Cpu,
  globe: Globe,
  share: Share,
  lock: Lock,
  command:Command,
  search:Search,
  pin:Pin,
  "trend-up": TrendingUp,
  X: X,
  "align-left": AlignLeft,
  toc: AlignLeft,
  "chart-bar-big": ChartBarBig,
  "chart-candlestick": ChartCandlestick,
  "ellipsis-vertical": EllipsisVertical,
  // browser icons
  safari: FaSafari,
  chrome: FaChrome,
  firefox: FaFirefoxBrowser,
  edge: FaEdge,
  browser: FaChrome, // Default browser icon
  monitor: LuMonitor,
  smartphone: LuSmartphone,
  "monitor-smartphone": LuMonitorSmartphone,
  website: Globe,
  copy: CopyIcon,
  plus: Plus,
  rocket: RocketIcon,
  plus_circle: CirclePlus,
  "copy-check": CopyCheckIcon,
  send: Share, // Share icon for sending
  bookmark: Bookmark,
  "bookmark-check": BookmarkCheck,
  heart: FaHeart,
  podcast:Podcast,
  "heart-empty": FaRegHeart,
  // social media icons
  github: Github,
  instagram: Instagram,
  linkedin: Linkedin,
  mail: Mail,
  phone: Phone,
  shield: ShieldCheck,
  terminal: Terminal,
  twitter: RiTwitterXFill,
  "twitter-bird": Twitter,
  "google-fc": FcGoogle,
  users: Users,
  "arrow-up-right": ArrowUpRight,
  "arrow-right": ArrowRight,
  "arrow-left": ArrowLeft,
  "arrow-up": ArrowUp,
  "loader-circle": LoaderCircleIcon,
  "alert-circle": CircleAlert,
  layout: LayoutTemplate,
  default: LayoutTemplate, // Fallback icon
  unknown: LayoutTemplate, // Fallback for unknown icons
} as const;

export type IconType = keyof typeof IconComponent;

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconType;
  className?: string;
}

export function Icon({
  name,
  className,
}: IconProps): React.ReactElement | null {
  const Icon = IconComponent[name];
  if (!Icon) {
    return null;
  }
  return <Icon className={className} />;
}
