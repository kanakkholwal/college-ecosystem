"use client";

import { useShare } from "@/hooks/useShare";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Icon } from "../icons";
import { Button, ButtonProps } from "../ui/button";
import { ResponsiveDialog } from "../ui/responsive-dialog";
import { ButtonLink } from "../utils/link";
import { sendGAEvent } from '@next/third-parties/google'

type ShareButtonProps = {
  data: {
    title?: string;
    text?: string;
    url?: string;
    image?: string;
  };
} & ButtonProps;

function ShareButton({ data, ...props }: ShareButtonProps) {
  const { share, isNativeShareSupported, socials } = useShare({
    title: data.title,
    text: data.text,
    url: data.url,
    image: data.image,
  });

  const [copied, setCopied] = useState(false);
  if (!data.url) {
    toast.error("No URL provided for sharing");
    return null;
  }

  return (
    <ResponsiveDialog
      title={data.title || "Share"}
      description={data.text || "Share this content with your friends"}
      btnProps={{
        children: props.children || "Share",
        variant: "outline",
        ...props,
        onClick: (e) => {
          props.onClick?.(e);
          sendGAEvent("event", "share_button_click", {
            url: data.url,
            hasNativeSupport: isNativeShareSupported,
          });
        }
      }}
      className="grid-cols-1 gap-4 grid w-full"
    >
      <div className="flex items-center gap-2 flex-wrap">
        {socials.map((social) => {
          return (
            <ButtonLink
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              size="icon"
              transition="damped"
              variant="glass"
            >
              <social.icon className="icon" />
            </ButtonLink>
          );
        })}
        {isNativeShareSupported && (
          <Button
            size="icon"
            variant="ghost"
            transition="damped"
            onClick={() => share()}
            className="flex items-center gap-2"
          >
            <Icon name="share" className="icon" />
          </Button>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        Or copy the link to share manually
      </p>
      <div className="w-full flex items-center p-3 border rounded-lg bg-muted hover:border-primary">
        <p className="flex-1 text-sm text-muted-foreground truncate">
          {data.url || "No URL provided"}
        </p>
        <Button
          className="ml-auto"
          variant="ghost"
          rounded="large"
          size="xs"
          onClick={() => {
            if (!data.url) {
              toast.error("No URL provided to copy");
              return;
            }
            try {
              navigator.clipboard.writeText(data.url);
              setCopied(true);
              toast.success("Link copied to clipboard", {
                duration: 2000,
              });
            } catch (error) {
              toast.error("Failed to copy link");
            } finally {
              setTimeout(() => {
                setCopied(false);
              }, 2000);
            }
          }}
        >
          <Icon name={copied ? "copy-check" : "copy"} />
          {copied ? "Copied!" : "Copy Link"}
          <span className="sr-only">Copy Link</span>
        </Button>
      </div>
    </ResponsiveDialog>
  );
}
ShareButton.displayName = "ShareButton";
export default ShareButton;
