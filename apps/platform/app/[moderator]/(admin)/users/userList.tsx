"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import axios from "axios";
import { Loader2, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { deleteUser } from "src/lib/users/actions";
import { UserWithId } from "src/models/user";

const USER_PER_PAGE = 50;

interface UserListProps {
  initialUsers: UserWithId[];
  initialHasMore: boolean;
}

export default function UserList({
  initialUsers,
  initialHasMore,
}: UserListProps) {
  const searchParams = useSearchParams() as URLSearchParams;
  const [offset, setOffset] = useState(USER_PER_PAGE);
  const [users, setUsers] = useState<UserWithId[]>(initialUsers);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  const loadMoreUsers = async () => {
    if (hasMore) {
      setLoading(true);
      await axios
        .get(
          `/api/users?query=${searchParams.get("query") || ""}&offset=${offset}`
        )
        .then((response) => response.data)
        .then((response) => {
          setHasMore(response.hasMore);
          setUsers((prevUsers) => [...prevUsers, ...response.users]);
          setOffset((prevOffset) => prevOffset + USER_PER_PAGE);
        })
        .catch((err) => {
          console.log("err", err);
        })
        .finally(() => setLoading(false));
    }
  };

  return (
    <>
      {/* <div className="flex justify-end items-center gap-2 p-3 w-full">
        <Button  size="sm" variant="default_light" asChild>
          <Link href="/admin/users/create">Create New User</Link>
        </Button>
      </div> */}

      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="whitespace-nowrap">Joined At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => <UserRow user={user} key={user._id} />)}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center w-full mt-4">
        {hasMore ? (
          <Button
            onClick={loadMoreUsers}
            disabled={loading}
            width="md"
          >
            {loading && <Loader2 className="animate-spin" />}
            {!loading && "Load More"}
          </Button>
        ) : (
          <div className="w-1/2 mx-auto text-center">No more users</div>
        )}
      </div>
    </>
  );
}

function UserRow({ user }: { user: UserWithId }) {

  return <TableRow>
    <TableCell className="font-medium">{user["firstName"]} {user["lastName"]}</TableCell>
    <TableCell className="font-medium"><Link
      className="text-left font-medium"
      href={`/people/${user.rollNo}`}
      target="_blank"
    >
      @{user["rollNo"]}
    </Link></TableCell>
    <TableCell className="font-medium">{user["email"]}</TableCell>
    <TableCell className="font-medium"> {user.roles?.map((role: string) => {
      return (
        <Badge key={role} variant="default_light" className="m-1">
          {role}
        </Badge>
      );
    })}</TableCell>
    <TableCell className="font-medium">{user["department"]}</TableCell>
    <TableCell className="font-medium">{new Date(user["createdAt"]).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    )}</TableCell>
    <TableCell className="font-medium">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() =>
              toast.promise(navigator.clipboard.writeText(user._id), {
                loading: "Copying...",
                success: "ID copied to clipboard",
                error: "Failed to copy ID",
              })
            }
          >
            {" "}
            Copy ID{" "}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              console.log("deleting user ", user);
              toast.promise(deleteUser(user._id), {
                loading: "Deleting...",
                success: "User deleted",
                error: (error) => error.response.data.message,
              });
            }}
          >
            <span className="text-red-600">Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TableCell>
  </TableRow>
}