import { Metadata } from "next";
import { appConfig } from "~/project.config";
import HeroSection from "./hero";
import FreeStuffTable from "./list";

export const metadata: Metadata = {
    title: "Student Benefits - Free Stuff for College Students",
    description:
        "From software tools to learning platforms, explore how you can enhance your college experience with these exclusive offers.",
    openGraph: {
        title: "Free Stuff for College Students",
        description:
            "From software tools to learning platforms, explore how you can enhance your college experience with these exclusive offers.",
    },
    twitter: {
        title: "Free Stuff for College Students",
        description:
            "From software tools to learning platforms, explore how you can enhance your college experience with these exclusive offers.",
    },
    keywords: [
        "free stuff for college students",
        "student discounts",
        "college benefits",
        "student resources",
        "free software for students",
        "educational discounts",
        "college scholarships",
        "student deals",
        "college grants",
        "financial aid for students",
        "student offers",
        "college freebies",
        "student savings",
        "academic discounts",
        "college student programs",
    ],

    alternates: {
        canonical: appConfig.url + "/benefits",
    }

};

export default function BenefitsPage() {

    return (<>
        <HeroSection />
        <FreeStuffTable/>
    </>)
}