import { appConfig } from "@/project.config";
import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Img,
  Link,
  Row,
  Section,
  Tailwind,
  Text
} from "@react-email/components";
import { twConfig } from "./tw-config";

export default function EmailWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Tailwind config={twConfig}>
        <Body className="bg-gray-50 font-sans text-gray-900 px-4 py-6">
          <Container className="bg-white border border-gray-200 rounded-xl max-w-[480px] mx-auto p-6 shadow-sm">
            {/* Header */}
            <Section className="mt-[32px] text-center">
              <Column align="center" className="w-full my-[12px]">
                <Img
                  src={appConfig.logo}
                  alt={appConfig.name}
                  height="32"
                  className="mx-auto text-[12px] font-semibold text-gray-700"
                />
              </Column>
            </Section>

            {/* Main Content */}
            <Section className="mb-6">{children}</Section>

            {/* Footer */}
            <Section className="text-center border-t border-gray-200 pt-4">
              <Row align="center">
                <Link href={appConfig.url}>
                  <Img
                    src={appConfig.logo}
                    alt={appConfig.name}
                    height="32"
                    className="mx-auto text-[12px] font-semibold text-gray-700"
                  />
                </Link>
              </Row>
              <Row align="center" className="my-[20px]">
                {[
                  { href: appConfig.socials.twitter, src: "https://cdn-icons-png.flaticon.com/512/5968/5968830.png", alt: "X" },
                  { href: appConfig.socials.linkedin, src: "https://cdn-icons-png.flaticon.com/512/3536/3536505.png", alt: "LinkedIn" },
                  { href: appConfig.socials.instagram, src: "https://cdn-icons-png.flaticon.com/512/15713/15713420.png", alt: "Instagram" },
                  { href: appConfig.socials.github, src: "https://cdn-icons-png.flaticon.com/512/1051/1051377.png", alt: "GitHub" },
                ].map((icon, i) => (
                  <Column key={i} align="center" className="max-w-[80px]">
                    <Link href={icon.href} target="_blank">
                      <Img
                        src={icon.src}
                        alt={icon.alt}
                        width="20"
                        height="20"
                        className="mx-[2px]"
                      />
                    </Link>
                  </Column>
                ))}
              </Row>
              <Column align="right" className="mt-[12px]">
                <Text className="text-[12px] font-medium text-gray-700">
                  {appConfig.name}
                </Text>
                <Text className="text-[8px] text-gray-500">
                  {appConfig.tagline}
                </Text>
              </Column>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
