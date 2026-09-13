import BaseSearchBox from "../base-search";

/** Writes `query` and `currentStatus`, the params both room pages read. */
export default function SearchBox() {
  return (
    <BaseSearchBox
      searchPlaceholder="Search by room number"
      filterOptions={[
        {
          key: "currentStatus",
          label: "Status",
          values: [
            { value: "all", label: "Any status" },
            { value: "available", label: "Available" },
            { value: "occupied", label: "Occupied" },
          ],
        },
      ]}
      searchParamsKey="query"
      filterDialogTitle="Filter rooms"
      filterDialogDescription="Show only free or occupied rooms."
      id="room-search"
    />
  );
}
