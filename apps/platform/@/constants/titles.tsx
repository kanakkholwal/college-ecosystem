export const titlesMap = new Map<
  string,
  {
    title: string;
    description: string;
  }
>([
  [
    "/admin",
    {
      title: "Admin Dashboard",
      description: "Track and manage all the activities of the platform",
    },
  ],
  [
    "/student",
    {
      title: "Student Dashboard",
      description: "Track and manage all your activities on the platform",
    },
  ],
  [
    "/student/outpass",
    {
      title: "Outpass Request Portal",
      description: "Request and manage your outpass requests",
    },
  ],
]);
