import BaseSearchBox from "../base-search";

type Props = {
  branches: string[];
  batches: string[];
  programmes: string[];
};

export default function ResultSearchBox({
  branches,
  batches,
  programmes,
}: Props) {
  const filterOptions = [
    {
      key: "branch",
      label: "Branch",
      values: [
        { value: "all", label: "All" },
        ...branches.map((branch) => ({ value: branch, label: branch })),
      ],
    },
    {
      key: "batch",
      label: "Batch",
      values: [
        { value: "all", label: "All" },
        ...batches.map((batch) => ({ value: batch, label: batch })),
      ],
    },
    {
      key: "programme",
      label: "Programme",
      values: [
        { value: "all", label: "All" },
        ...programmes.map((programme) => ({
          value: programme,
          label: programme,
        })),
      ],
    },
  ];

  return (
    <BaseSearchBox
      searchPlaceholder="Roll number or name"
      filterOptions={filterOptions}
      filterDialogTitle="Filter results"
      filterDialogDescription="Narrow the list by branch, batch or programme."
      searchBoxClassName="border-transparent bg-muted dark:bg-muted"
    />
  );
}
