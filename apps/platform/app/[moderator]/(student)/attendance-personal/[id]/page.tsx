import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";

// Server Actions
import {
    deleteAttendanceRecord,
    getAttendanceRecordById,
    updateAttendanceRecord,
} from "~/actions/student.record_personal";

// Components
import { PreviousPageLink } from "@/components/utils/link";
import { UpdateAttendanceRecord } from "../update-record";
import { AttendanceDetails } from "./attendance-details";

export default async function SubjectDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const record = await getAttendanceRecordById(id);

    if (!record) {
        return notFound();
    }

    return (
        <div className="min-h-screen pb-20">
            {/* 1. Header Navigation */}
            <header className="sticky top-0 z-30 flex h-16 items-center border-b px-6">
                <div className="flex w-full items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <PreviousPageLink  variant="ghost" size="icon_sm" className="rounded-full">
                                <ArrowLeft className="size-4" />
                        </PreviousPageLink>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-semibold tracking-tight">
                                    {record.subjectName}
                                </h1>
                                <Badge
                                    variant="outline"
                                    className="text-xs font-normal text-muted-foreground"
                                >
                                    {record.subjectCode}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Edit / Actions Menu */}
                    <UpdateAttendanceRecord
                        updateAttendanceRecord={updateAttendanceRecord.bind(null, record.id)}
                        deleteAttendanceRecord={deleteAttendanceRecord.bind(null, record.id)}
                        deleteFloating={false}
                    />
                </div>
            </header>

            {/* 2. Main Content - Delegated to Client Component */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                <AttendanceDetails record={record} />
            </main>
        </div>
    );
}