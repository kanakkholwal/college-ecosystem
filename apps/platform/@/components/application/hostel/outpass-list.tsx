
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/typography";
import type { OutPassType } from "~/models/hostel_n_outpass";

interface OutpassListProps {
    outPasses: OutPassType[];
}

const classNames = {
    container: "w-full grid grid-cols-1 @lg:grid-cols-2 @2xl:grid-cols-3 @5xl:grid-cols-4 gap-3 p-4",
    item: "flex items-center justify-between p-4 mb-3 bg-white border border-gray-200 rounded-lg shadow-xs last:mb-0",
    details: "flex flex-col",
    studentInfo: "font-medium text-gray-800",
    outpassInfo: "text-sm text-gray-600",
};

export default function OutpassList({ outPasses }: OutpassListProps) {
    return (<>
        <Heading level={4} className="text-gray-800">
            Last {outPasses.length} OutPass
        </Heading>
        <div className={classNames.container}>
            {outPasses.map((outpass) => (
                <div key={outpass._id} className={classNames.item}>
                    {/* Outpass Details */}
                    <div className={classNames.details}>
                        <span className={classNames.studentInfo}>{outpass.student.name} | {outpass.student.rollNumber}</span>
                        <span className={classNames.outpassInfo}>
                            {outpass.hostel.name} | Room No: {outpass.roomNumber}
                        </span>
                        <span className={classNames.outpassInfo}>
                            Reason: {outpass.reason} | Status:{" "}
                            <Badge
                                size="sm"
                                variant={
                                    outpass.status === "approved"
                                        ? "success_light"
                                        : outpass.status === "pending"
                                            ? "warning_light"
                                            : "destructive_light"
                                }
                            >
                                {outpass.status}
                            </Badge>
                        </span>
                        <span className={classNames.outpassInfo}>
                            {outpass.actualInTime ? <>
                                {new Date(outpass.actualOutTime || "").toLocaleString("en-US")} - {new Date(outpass.actualInTime || "").toLocaleString("en-US")}
                            </> : <>
                                {new Date(outpass.expectedOutTime || "").toLocaleString("en-US")} - {new Date(outpass.expectedInTime || "").toLocaleString("en-US")}
                            </>}

                        </span>

                    </div>


                </div>
            ))}
        </div>
    </>);
}
