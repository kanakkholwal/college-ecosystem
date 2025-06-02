"use client";
import BaseSearchBox from "./base-search";

type Props = {
  branches: string[];
  batches: string[];
  programmes: string[];
};

export default function ResultSearchBox({ branches, batches, programmes }: Props) {
  const filterOptions = [
    {
      key: "branch",
      label: "By Branches",
      values: [
        { value: "all", label: "All" },
        ...branches.map(branch => ({ value: branch, label: branch }))
      ],
    },
    {
      key: "batch",
      label: "By Batch",
      values: [
        { value: "all", label: "All" },
        ...batches.map(batch => ({ value: batch, label: batch }))
      ],
    },
    {
      key: "programme",
      label: "By Programme",
      values: [
        { value: "all", label: "All" },
        ...programmes.map(programme => ({ value: programme, label: programme }))
      ],
    },
  ];

  return (
    <BaseSearchBox
      searchPlaceholder="Search by Roll No. or Name"
      filterOptions={filterOptions}
      filterDialogTitle="Filter Results"
      filterDialogDescription="Filter by branches, batch, programme"
    />
  );
}