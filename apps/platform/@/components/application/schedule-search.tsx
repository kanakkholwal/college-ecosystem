"use client";
import BaseSearchBox from "./base-search";

type Props = {
  branches: string[];
  years: string[];
};

export default function ScheduleSearchBox({ branches, years }: Props) {
  const filterOptions = [
    {
      key: "branch",
      label: "By Branches",
      values: [
        { value: "all", label: "All" },
        ...branches.map((branch) => ({ value: branch, label: branch })),
      ],
    },
    {
      key: "year",
      label: "By Year",
      values: [
        { value: "all", label: "All" },
        ...years.map((year) => ({ value: year, label: year })),
      ],
    },
  ];

  return (
    <BaseSearchBox
      searchPlaceholder="Search by Section Name"
      filterOptions={filterOptions}
      filterDialogTitle="Filter Schedule"
      filterDialogDescription="Filter by branches and years"
    />
  );
}
