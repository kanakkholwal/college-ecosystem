import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";
import { brand, theme } from "./theme";

export function EmailLayout({
  preview,
  children,
}: {
  preview: string;
  children: ReactNode;
}) {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Preview>{preview}</Preview>
      <Body
        style={{
          margin: 0,
          padding: "32px 12px",
          backgroundColor: theme.canvas,
          fontFamily: theme.font,
          color: theme.foreground,
        }}
      >
        <Container style={{ maxWidth: "520px", margin: "0 auto" }}>
          <Section style={{ padding: "0 4px 20px" }}>
            <Img
              src={`${brand.assetBaseUrl}/logo.png`}
              width="137"
              height="32"
              alt={brand.name}
            />
          </Section>
          <Section
            style={{
              backgroundColor: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: theme.radius,
              padding: "32px 28px",
            }}
          >
            {children}
          </Section>
          <Section style={{ padding: "20px 4px 0" }}>
            <Text style={footerText}>
              {brand.name} for {brand.orgName}
            </Text>
            <Text style={footerText}>
              Questions or something looks wrong?{" "}
              <Link href={brand.contactUrl} style={{ color: theme.muted }}>
                Contact us
              </Link>
              .
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const footerText = {
  margin: "0 0 4px",
  fontSize: "12px",
  lineHeight: "18px",
  color: theme.muted,
};

export function EmailHeading({ children }: { children: ReactNode }) {
  return (
    <Heading
      as="h1"
      style={{
        margin: "0 0 16px",
        fontSize: "22px",
        lineHeight: "30px",
        fontWeight: 600,
        color: theme.foreground,
      }}
    >
      {children}
    </Heading>
  );
}

export function Paragraph({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        margin: "0 0 16px",
        fontSize: "15px",
        lineHeight: "24px",
        color: theme.foreground,
      }}
    >
      {children}
    </Text>
  );
}

export function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Section style={{ margin: "24px 0" }}>
      <Button
        href={href}
        style={{
          display: "inline-block",
          backgroundColor: theme.primary,
          color: theme.primaryForeground,
          borderRadius: "8px",
          padding: "12px 22px",
          fontSize: "15px",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        {children}
      </Button>
    </Section>
  );
}

/** Raw URL under the button for clients that strip or block buttons. */
export function LinkFallback({ href }: { href: string }) {
  return (
    <Text
      style={{
        margin: "0 0 8px",
        fontSize: "13px",
        lineHeight: "20px",
        color: theme.muted,
      }}
    >
      Button not working? Paste this link into your browser:
      <br />
      <Link
        href={href}
        style={{ color: theme.primary, wordBreak: "break-all" }}
      >
        {href}
      </Link>
    </Text>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <>
      <Hr style={{ borderColor: theme.border, margin: "24px 0 16px" }} />
      <Text
        style={{
          margin: 0,
          fontSize: "13px",
          lineHeight: "20px",
          color: theme.muted,
        }}
      >
        {children}
      </Text>
    </>
  );
}
