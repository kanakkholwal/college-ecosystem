// "use client";
// import { Comments } from "@fuma-comment/react";
// import { usePathname, useRouter } from "next/navigation";
// import { Session } from "~/lib/auth";

// export function CommentsWithAuth({page,session}: {page: string, session: Session | null}) {
//   const router = useRouter();
//   const pathname = usePathname();
//   return (
//     <Comments
//       // comments are grouped by page
//       page={page}
//       auth={{
//         type: "ssr",
//         session: {
//           id: session?.user?.id || "",
//           permissions: {
//             delete: !!session?.user?.role && session.user.role === "admin",
//           },
//         },
//         signIn: () => {
//           // Redirect to sign-in page
//           router.push("/sign-in");
//         },
//       }}
//     />
//   );
// }
