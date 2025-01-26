"use client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BsMarkdown } from "react-icons/bs";

import { Textarea, type TextareaProps } from "@/components/ui/textarea";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
// import {
//   Command,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
// } from "@/components/ui/command";
// import { cn } from "@/lib/utils";

import { getCurrentWord, replaceWord } from "./utils";

import {
  BsChatQuote,
  BsCode,
  BsCodeSlash,
  BsDashSquare,
  BsImage,
  BsLink45Deg,
  BsListOl,
  BsListUl,
  BsTypeBold,
  BsTypeH1,
  BsTypeH2,
  BsTypeH3,
  BsTypeItalic,
} from "react-icons/bs";

const listItems = [
  {
    title: "Heading 1",
    content: "# heading",
    icon: BsTypeH1,
  },
  {
    title: "Heading 2",
    content: "## heading",
    icon: BsTypeH2,
  },
  {
    title: "Heading 3",
    content: "### heading",
    icon: BsTypeH3,
  },
  {
    title: "Bold",
    content: "**bold text**",
    icon: BsTypeBold,
  },
  {
    title: "Italic",
    content: "*italic text*",
    icon: BsTypeItalic,
  },
  {
    title: "Quote",
    content: "> quoted text",
    icon: BsChatQuote,
  },
  {
    title: "Link",
    content: "[link text](url)",
    icon: BsLink45Deg,
  },
  {
    title: "Image",
    content: "![alt](url 'title')",
    icon: BsImage,
  },
  {
    title: "Code",
    content: "`code`",
    icon: BsCode,
  },
  {
    title: "Code block",
    content: "```lang",
    icon: BsCodeSlash,
  },
  {
    title: "Unordered list",
    content: "- item",
    icon: BsListUl,
  },
  {
    title: "Ordered list",
    content: "1. item",
    icon: BsListOl,
  },
  {
    title: "Horizontal rule",
    content: "---",
    icon: BsDashSquare,
  },
];

interface Props extends TextareaProps {
  textValue: string;
  setTextValue: (value: string) => void;
  disabled?: boolean;
}

export function Write({ textValue, setTextValue, disabled, ...props }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [commandValue, setCommandValue] = useState("");

  // const texarea = textareaRef.current;
  // const dropdown = dropdownRef.current;

  const handleBlur = useCallback((e: Event) => {
    const dropdown = dropdownRef.current;
    if (dropdown) {
      dropdown.classList.add("hidden");
      setCommandValue("");
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const textarea = textareaRef.current;
    const input = inputRef.current;
    const dropdown = dropdownRef.current;
    if (textarea && input && dropdown) {
      const currentWord = getCurrentWord(textarea);
      const isDropdownHidden = dropdown.classList.contains("hidden");
      if (currentWord.startsWith("@") && !isDropdownHidden) {
        // FIXME: handle Escape
        if (
          e.key === "ArrowUp" ||
          e.keyCode === 38 ||
          e.key === "ArrowDown" ||
          e.keyCode === 40 ||
          e.key === "Enter" ||
          e.keyCode === 13 ||
          e.key === "Escape" ||
          e.keyCode === 27
        ) {
          e.preventDefault();
          input.dispatchEvent(new KeyboardEvent("keydown", e));
        }
      }
    }
  }, []);

  const onTextValueChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      // const textarea = textareaRef.current;
      // const dropdown = dropdownRef.current;

      // if (textarea && dropdown) {
      // const caret = getCaretCoordinates(textarea, textarea.selectionEnd);
      // const currentWord = getCurrentWord(textarea);
      setTextValue(text);
      // console.log({ currentWord })
      // if (currentWord.startsWith("@")) {
      //   setCommandValue(currentWord);
      //   dropdown.style.left = caret.left + "px";
      //   dropdown.style.top = caret.top + caret.height + "px";
      //   dropdown.classList.remove("hidden");
      // } else {
      //   // REMINDER: apparently, we need it when deleting
      //   if (commandValue !== "") {
      //     setCommandValue("");
      //     dropdown.classList.add("hidden");
      //   }
      // }
      // }
      // }, [setTextValue, commandValue])
    },
    [setTextValue]
  );

  const onCommandSelect = useCallback((value: string) => {
    const textarea = textareaRef.current;
    const dropdown = dropdownRef.current;
    if (textarea && dropdown) {
      replaceWord(textarea, `${value}`);
      setCommandValue("");
      dropdown.classList.add("hidden");
    }
  }, []);

  const handleMouseDown = useCallback((e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleSectionChange = useCallback(
    (e: Event) => {
      const textarea = textareaRef.current;
      const dropdown = dropdownRef.current;
      if (textarea && dropdown) {
        const currentWord = getCurrentWord(textarea);
        console.log(currentWord);
        if (!currentWord.startsWith("@") && commandValue !== "") {
          setCommandValue("");
          dropdown.classList.add("hidden");
        }
      }
    },
    [commandValue]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    const dropdown = dropdownRef.current;
    textarea?.addEventListener("keydown", handleKeyDown);
    textarea?.addEventListener("blur", handleBlur);
    document?.addEventListener("selectionchange", handleSectionChange);
    dropdown?.addEventListener("mousedown", handleMouseDown);
    return () => {
      textarea?.removeEventListener("keydown", handleKeyDown);
      textarea?.removeEventListener("blur", handleBlur);
      document?.removeEventListener("selectionchange", handleSectionChange);
      dropdown?.removeEventListener("mousedown", handleMouseDown);
    };
  }, [handleBlur, handleKeyDown, handleMouseDown, handleSectionChange]);

  return (
    <div className="w-full relative">
      <Textarea
        ref={textareaRef}
        autoComplete="off"
        autoCorrect="off"
        className="resize-none h-auto"
        value={textValue}
        onChange={onTextValueChange}
        rows={5}
        disabled={disabled}
        {...props}
      />

      <Sheet>
        <SheetTrigger asChild>
          <button
            type="button"
            className="text-sm text-muted-foreground prose-none mt-1"
          >
            <BsMarkdown className="text-gray-700 h-4 w-5 mr-2 inline-block" />
            Supports markdown.
          </button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Markdown Cheatsheet</SheetTitle>
            <SheetDescription>
              Use markdown to format your text. For example, you can make text
              bold by wrapping it in double asterisks like **this**.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-1 w-full mt-5">
            {listItems.map((item) => {
              return (
                <div key={item.title} className="flex items-center gap-2">
                  <item.icon className="text-gray-600 h-4  shrink-0" />
                  <h4 className="text-md font-semibold text-gray-700">
                    {item.title}
                  </h4>
                  <div className="ml-auto prose">
                    <kbd className="ml-2">{item.content}</kbd>
                  </div>
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
