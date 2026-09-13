"use client";
import BaseSearchBox from "../base-search";

type Props = {
  /** Department codes; labelled with `branchLabels` when given. */
  branches: string[];
  years: string[];
  branchLabels?: Record<string, string>;
};

export default function ScheduleSearchBox({
  branches,
  years,
  branchLabels,
}: Props) {
  const filterOptions = [
    {
      key: "branch",
      label: "Department",
      values: [
        { value: "all", label: "All departments" },
        ...branches.map((branch) => ({
          value: branch,
          label: branchLabels?.[branch] ?? branch.toUpperCase(),
        })),
      ],
    },
    {
      key: "year",
      label: "Year",
      values: [
        { value: "all", label: "All years" },
        ...years.map((year) => ({ value: year, label: `Year ${year}` })),
      ],
    },
  ];

  return (
    <BaseSearchBox
      searchPlaceholder="Search section or department"
      filterOptions={filterOptions}
      filterDialogTitle="Filter timetables"
      filterDialogDescription="Narrow the list by department and year."
      id="schedule-search"
    />
  );
}
