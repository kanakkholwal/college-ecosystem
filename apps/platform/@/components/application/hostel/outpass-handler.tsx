'use client';
import { LoaderCircle } from 'lucide-react';
import { LuScanBarcode } from "react-icons/lu";
import type { OutPassType } from "~/models/hostel_n_outpass";

import EmptyArea from '@/components/common/empty-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heading } from "@/components/ui/typography";
import ConditionalRender from '@/components/utils/conditional-render';
import { ErrorBoundary } from "@/components/utils/error-boundary";
import { useExternalBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { ScanSearch } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { allowEntryExit } from "~/actions/hostel_outpass";
import { apiFetch } from '~/lib/client-fetch';
import OutpassList from './outpass-list';
import OutpassRender from './outpass-render';

type responseType = {
    identifier: "rollNo";
    history: OutPassType[];
} | {
    identifier: "id";
    outpass: OutPassType | null;
} | {
    identifier: "unknown";
    message: string;
    error?: string | unknown
}

async function fetchByIdentifier(identifier: string) {
    return await apiFetch<responseType>(`/api/outpass?identifier=${identifier}`);
}


export default function OutpassVerifier() {
    const { currentCode, scanHistory, clearHistory } = useExternalBarcodeScanner();
    const [rollNo, setRollNo] = useState('');
    const [outpassHistory, setOutpassHistory] = useState<OutPassType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(false);
    const [currentOutpass, setCurrentOutpass] = useState<OutPassType | null>(null);


    const fetchOutpassHistory = async (identifier: string) => {
        setIsLoading(true);
        setError('');
        setOutpassHistory([]);
        setCurrentOutpass(null);
        clearHistory(); // Clear the scanner history

        try {
            const response = await fetchByIdentifier(identifier);
            console.log(response)
            if (response.error || !response?.data) {
                setError(response.error.message || 'An error occurred.');
                return;
            }
            const data = response.data;
            if (data.identifier === 'rollNo') {
                setOutpassHistory(data.history);
                setCurrentOutpass(data.history[0]);
            } else if (data.identifier === 'id') {
                setCurrentOutpass(data.outpass);
                setOutpassHistory(data.outpass ? [data.outpass] : []);
            } else {
                setError(data.message);
            }

        } catch (err) {
            setError(err?.toString() || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = () => {
        if (rollNo.trim() || currentCode.trim()) {
            const identifier = rollNo || currentCode; // Use rollNo or scanned code
            fetchOutpassHistory(identifier.trim());
        }
    };

    const handleEntryExit = async () => {
        if (outpassHistory.length === 0) {
            toast.error("No outpass history found.");
            return;
        }
        setUpdating(true);
        return new Promise((resolve) => {
            try {
                toast.promise(allowEntryExit(outpassHistory[0]._id,
                    outpassHistory[0].status === "approved" ? "exit" : "entry"
                ), {
                    loading: "Updating status...",
                    success: (msg: string | undefined) =>
                        msg || "Status updated successfully",
                    error: (msg: unknown | undefined) =>{
                        console.log(msg)
                        return"Failed to update status"
                    },
                });
            } catch {
                toast.error("Unexpected error occurred");
            } finally {
                setUpdating(false);
                resolve(true);
            }
        });
    }

    return (
        <div className="mx-auto px-4 py-8 space-y-10">
            <Heading className="text-center text-gray-800">Outpass Verifier</Heading>
            <div className="relative flex items-stretch w-full rounded-full h-auto max-w-4xl mx-auto">
                <div className="absolute top-0 bottom-0 left-0">
                    <div
                        className="relative flex h-12 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:border before:border-transparent before:bg-primary/10 before:bg-linear-to-b before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 dark:before:border-gray-700 dark:before:bg-gray-800 sm:w-max"
                    >
                        <span className="relative text-base font-semibold text-primary ">
                            <LuScanBarcode className="w-5 h-5" />
                        </span>
                    </div>
                </div>
                <Input
                    className="w-full rounded-full px-20 border border-border h-12 "
                    id="rollNo"
                    name="rollNo"
                    type="text"
                    placeholder="Enter Roll No. or Scan Barcode"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    onKeyUp={(e) => {
                        if (e.key === "Enter") {
                            handleVerify();
                        }
                    }}
                />
                <div className="absolute top-0 bottom-0 right-0">
                    <Button
                        onClick={handleVerify}
                        disabled={isLoading}
                        variant="gradient_purple"
                        effect="shineHover"
                        className="relative rounded-r-full h-12"
                    >
                        <ConditionalRender condition={isLoading}>
                            <LoaderCircle className="animate-spin" />
                            Checking...
                        </ConditionalRender>
                        <ConditionalRender condition={!isLoading}>
                            Verify
                            <ScanSearch />
                        </ConditionalRender>
                    </Button>
                </div>
            </div>


            <ConditionalRender condition={!!error}>
                <EmptyArea
                    title="An error occurred"
                    description="Failed to fetch outpass history. Please try again."
                />
            </ConditionalRender>
            <ConditionalRender condition={isLoading}>
                <EmptyArea
                    title="Loading..."
                    description="Please wait while we fetch the outpass history."
                />
            </ConditionalRender>

            <ConditionalRender condition={outpassHistory.length > 0 && currentOutpass !== null}>
                <div className="relative flex items-stretch w-full max-w-2xl mx-auto bg-white border rounded-lg p-6">
                    <div className='flex w-full gap-2 justify-start items-stretch text-sm'>
                        <div className="flex flex-col text-gray-700">
                            <span className="font-bold">
                                Actual Out Time
                            </span>
                            <span className="font-medium text-left">
                                {currentOutpass?.actualOutTime ?
                                new Date(currentOutpass?.actualOutTime || "").toLocaleDateString("en-US", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                }):"Not exited yet"}
                            </span>
                        </div>
                        <div className="flex flex-col text-gray-700">
                            <span className="font-bold">
                                Actual In Time
                            </span>
                            <span className="font-medium text-left">
                                {currentOutpass?.actualInTime ?
                                new Date(currentOutpass?.actualInTime || "").toLocaleDateString("en-US", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                }):"Not entered yet"}
                            </span>
                        </div>
                        <div className="flex flex-col text-gray-700">
                            <span className="font-bold">
                                Status
                            </span>
                            <Badge
                                size="sm"
                                variant={
                                    currentOutpass?.status === "approved"
                                        ? "success_light"
                                        : currentOutpass?.status === "pending"
                                            ? "warning_light"
                                            : "destructive_light"
                                }
                            >
                                {currentOutpass?.status}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex items-center justify-between my-auto">
                        <Button
                            onClick={handleEntryExit}
                            disabled={updating || (!!currentOutpass?.actualInTime)}
                            variant={currentOutpass?.actualInTime ? "glass":"default_light"}
                            effect="shineHover"
                        >
                            {currentOutpass?.actualInTime ? "Already Processed":currentOutpass?.actualOutTime ? "Allow Entry" : "Allow Exit" }
                        </Button>
                    </div>

                </div>
                <ErrorBoundary fallback={<EmptyArea title="An error occurred" description="Some error occurred while displaying Outpass. Please reload page." />}>
                <OutpassRender outpass={outpassHistory[0]} viewOnly={true} />
                </ErrorBoundary>
                <ErrorBoundary fallback={<EmptyArea title="An error occurred" description="Some error occurred while displaying Outpass History. Please reload page." />}>
                <OutpassList outPasses={outpassHistory} />
                </ErrorBoundary>
            </ConditionalRender>

            <ConditionalRender condition={!isLoading && !error && outpassHistory.length === 0}>
                <EmptyArea
                    title="No outpass history found."
                    description="Please enter a valid Roll No. or scan a barcode to verify outpass history."
                />
            </ConditionalRender>

        </div>
    );
}
