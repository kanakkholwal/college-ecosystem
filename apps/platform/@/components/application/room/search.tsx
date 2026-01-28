import BaseSearchBox from "../base-search";

export default function SearchBox() {
  return (
    <BaseSearchBox
      searchPlaceholder="Search by Roll No. or Name"
      filterOptions={[{
        key: "status",
        label: "By Status",
        values: [{ value: "all", label: "All" }, { value: "available", label: "Available" }, { value: "occupied", label: "Occupied" }],
      }]}
      searchParamsKey="query"
      filterDialogTitle="Filter Rooms"
      filterDialogDescription="Filter by status, room type, etc."
      variant="expanded"
    />
  );
}
