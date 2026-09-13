import BaseSearchBox from "../base-search";

type Props = {
  /** When given, adds a room type filter that writes `roomType`. */
  roomTypes?: readonly string[];
};

/** Writes `query` and `currentStatus`, the params both room pages read. */
export default function SearchBox({ roomTypes }: Props = {}) {
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
        ...(roomTypes?.length
          ? [
              {
                key: "roomType",
                label: "Room type",
                values: [
                  { value: "all", label: "Any type" },
                  ...roomTypes.map((type) => ({
                    value: type,
                    label: type[0].toUpperCase() + type.slice(1),
                  })),
                ],
              },
            ]
          : []),
      ]}
      searchParamsKey="query"
      filterDialogTitle="Filter rooms"
      filterDialogDescription={
        roomTypes?.length
          ? "Show rooms by status or type."
          : "Show only free or occupied rooms."
      }
      id="room-search"
    />
  );
}
