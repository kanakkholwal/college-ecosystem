"use client";
import BaseSearchBox from "../base-search";

type Props = {
  departments: string[];
  types: string[];
};

export default function CourseSearchBox({ departments, types }: Props) {
  const filterOptions = [
    {
      key: "department",
      label: "By Departments",
      values: [
        { value: "all", label: "All" },
        ...departments.map((dept) => ({ value: dept, label: dept })),
      ],
    },
    {
      key: "type",
      label: "By Course Types",
      values: [
        { value: "all", label: "All" },
        ...types.map((type) => ({ value: type, label: type })),
      ],
    },
  ];

  return (
    <BaseSearchBox
      searchPlaceholder="Search by name or code"
      filterOptions={filterOptions}
      filterDialogTitle="Filter Courses"
      filterDialogDescription="Filter by departments, course type, etc."
    />
  );
}
