"use client";

import BaseSearchBox from "@/components/application/base-search";
import type { FilterOption } from "@/components/application/filter-panel";

const FILTERS: FilterOption[] = [
  {
    key: "status",
    label: "Status",
    values: [
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" },
      { value: "in_use", label: "Out now" },
      { value: "processed", label: "Returned" },
    ],
  },
  {
    key: "sort",
    label: "Order",
    values: [{ value: "asc", label: "Oldest first" }],
  },
];

export function OutpassLogSearch() {
  return (
    <BaseSearchBox
      id="outpass-log-search"
      searchPlaceholder="Search by name or roll number"
      filterOptions={FILTERS}
      filterDialogTitle="Filter outpass logs"
      filterDialogDescription="Narrow by status or show the oldest requests first."
      className="max-w-none"
    />
  );
}
