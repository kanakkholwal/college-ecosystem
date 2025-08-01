import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {ApplicationForm} from "./form";

export default function ApplyNowPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Button variant="link" asChild className="pl-0 mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
      </Button>
      
      <div className="border rounded-xl p-6 md:p-10 shadow-sm">
        <h1 className="text-3xl font-bold mb-2">Build House Application</h1>
        <p className="text-gray-600 mb-8">
          Join our 1-month sprint to build real projects with peers. Fill out this form to apply.
        </p>
        
        <ApplicationForm />
      </div>
    </div>
  );
}