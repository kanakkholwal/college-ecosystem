"use client";
import { Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function GoBackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        router.back();
      }}
      className="relative flex h-12 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:border before:border-transparent before:bg-primary/10 before:bg-linear-to-b before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 dark:before:border-gray-700 dark:before:bg-gray-800 sm:w-max"
    >
      <span className="relative text-base font-semibold text-primary dark:text-white flex items-center gap-2">
        <Undo2 className="w-5 h-5" />
        Go Back
      </span>
    </button>
  );
}
