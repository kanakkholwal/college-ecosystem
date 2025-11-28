"use client";
import { Icon } from "@/components/icons";
// import { BannerPanel } from "@/components/utils/banner";
// import ConditionalRender from "@/components/utils/conditional-render";
import type { Session } from "~/auth/client";


// const PROMO = {
//     title: "Share your Personal Guide, Experiences",
//     description:
//         "Personal career experiences, articles, and case studies. You can also promote your articles on the site if they are valuable reads",
//     label: (
//         <>
//             Share Now
//             <Icon name="arrow-up-right" />
//         </>
//     ),
//     showTill: "2025-12-31T19:00:00",
//     getRedirectUrl: () => "https://forms.gle/NWAfkZngLozRjRJZ6",
//     getConditionByUser: (user: Session["user"]) =>
//         // user?.other_roles.includes(ROLES_ENUMS.STUDENT) &&
//         // user?.gender === "not_specified",
//         new Date() < new Date(PROMO.showTill),
// };
const PROMO = {
    title: "🌱 Help Us Keep Growing",
    description:
        "Our community is expanding with 250+ daily users and over 50,000 monthly visits. To keep improving and covering costs, we’ve added a few ads. Your support helps us stay free and continue building a better experience for everyone. Thank you!",
    label: (
        <>
            Share Now
            <Icon name="arrow-up-right" />
        </>
    ),
    showTill: "2026-12-31T19:00:00",
    getRedirectUrl: () => "https://forms.gle/NWAfkZngLozRjRJZ6",
    getConditionByUser: (user: Session["user"]) =>
        // user?.other_roles.includes(ROLES_ENUMS.STUDENT) &&
        // user?.gender === "not_specified",
        new Date() < new Date(PROMO.showTill),
};

export function LayoutClient({ user }: { user?: Session["user"] }) {
    return null; // Disable the banner for now
    return <>
        {/* <ConditionalRender
            condition={true} //PROMO.getConditionByUser(user) <--- Uncomment this line to enable the banner based on condition
        >

            <BannerPanel
                id="ads-disclaimer"
                title={PROMO.title}
                description={PROMO.description}
                redirectUrl={PROMO.getRedirectUrl()}
                isClosable={true}
                 Icon={<Icon name="rocket" className="size-4 text-primary" />}
                btnProps={{
                    children: null,
                    className:"hidden"
                }}
            // Show only to students and non-binary users
            // Condition can be changed as per requirement
            // Only show till the specified date
            // You can also add more conditions like checking if user has already submitted the form etc.
            // For now, it's just based on date
            // And user role and

            />
        </ConditionalRender> */}


    </>;
}