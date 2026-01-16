import BaseSearchBox from "./base-search";

export default function SearchBox() {
  return (
    <BaseSearchBox
      searchPlaceholder="Search by Roll No. or Name"
      filterOptions={["all", "available", "occupied"].map((status) => ({
        key: "status",
        label: "By Status",
        values: [{ value: status, label: status }],
      }))}
      searchParamsKey="query"
      filterDialogTitle="Filter Rooms"
      filterDialogDescription="Filter by status, room type, etc."
      variant="expanded"
    />
  );
}
