import BaseSearchBox from "../base-search";

type Props = {
  departments: string[];
  types: string[];
};

const toOptions = (values: string[]) => [
  { value: "all", label: "All" },
  ...values
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ value, label: value })),
];

export default function CourseSearchBox({ departments, types }: Props) {
  return (
    <BaseSearchBox
      searchPlaceholder="Search by course name or code"
      filterOptions={[
        {
          key: "department",
          label: "Department",
          values: toOptions(departments),
        },
        { key: "type", label: "Course type", values: toOptions(types) },
      ]}
      filterDialogTitle="Filter courses"
      filterDialogDescription="Narrow the list by department or course type."
    />
  );
}
