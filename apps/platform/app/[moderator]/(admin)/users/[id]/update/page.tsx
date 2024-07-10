import { notFound } from "next/navigation";
import { getUser } from "src/lib/users/actions";
import UpdateUserForm from "./components";
import { GoBackButton } from "@/components/common/go-back";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function UpdateUserPage({ params }: PageProps) {
  const user = await getUser(params.id);
  if (!user) {
    return notFound();
  }

  return (
    <div className="space-y-6 my-5">
      <GoBackButton />
      <div className="container mx-auto py-10 px-2">
        <h1 className="text-2xl font-bold">Update User</h1>
        <div className="flex items-center space-x-2">
          <span className="text-gray-700 font-semibold">User ID:</span>
          <span className="font-medium">{user._id}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-700 font-semibold">Name:</span>
          <span className="font-medium">
            {user.firstName} {user.lastName}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-700 font-semibold">Email:</span>
          <span className="font-medium">{user.email}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-700 font-semibold">Department:</span>
          <span className="font-medium">{user.department}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-700 font-semibold">Roles:</span>
          <span className="font-medium">{user.roles.join(", ")}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-700 font-semibold">Joined At:</span>
          <span className="font-medium">
            {new Date(user.createdAt).toLocaleString()}
          </span>
        </div>

        <UpdateUserForm currentUser={user} />
      </div>
    </div>
  );
}
