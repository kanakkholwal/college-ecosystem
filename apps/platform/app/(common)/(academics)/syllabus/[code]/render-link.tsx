import { booksAndRefType } from "src/models/course";
import BookPng from "./assets/book.png";
import DriveSvg from "./assets/drive.svg";
import OthersPng from "./assets/others.png";
import ReferencePng from "./assets/reference.png";
import YoutubePng from "./assets/youtube.png";

export const IconList = [
  {
    type: "drive",
    icon: DriveSvg,
  },
  {
    type: "youtube",
    icon: YoutubePng,
  },
  {
    type: "book",
    icon: BookPng,
  },
  {
    type: "others",
    icon: OthersPng,
  },
  {
    type: "reference",
    icon: ReferencePng,
  },
] as {
  type: booksAndRefType["type"];
  icon: string;
}[];
export const IconMap = new Map(IconList.map((i) => [i.type, i.icon]));
