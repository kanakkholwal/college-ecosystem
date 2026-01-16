"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ButtonLink } from "@/components/utils/link";
import {
  AlertTriangle,
  ArrowLeft,
  Home,
  Lock,
  LogIn,
  Shield,
} from "lucide-react";
import Link from "next/link";

export function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
      <Card className="w-full max-w-md text-center border-red-200 shadow-lg">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 border-4 border-red-200">
            <Lock className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl text-red-800">
            Access Forbidden
          </CardTitle>
          <CardDescription className="text-red-700">
            You don&apos;t have permission to access this resource. Please
            contact your administrator if you believe this is an error.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 justify-center">
              <AlertTriangle className="h-4 w-4" />
              <span>Error 403 - Forbidden</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
              <Link href="/">
                <Home />
                Go to Home
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <ArrowLeft />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-25 to-orange-25">
      <Card className="w-full max-w-md text-center border-amber-100 shadow-lg">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-amber-50 border-2 border-amber-100">
            <Shield className="h-12 w-12 text-amber-500" />
          </div>
          <CardTitle className="text-2xl text-amber-700">
            Access Denied
          </CardTitle>
          <CardDescription className="text-amber-600">
            You need to be authenticated to access this page. Please log in to
            continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-amber-600 bg-amber-25 p-3 rounded-lg border border-amber-100">
            <div className="flex items-center gap-2 justify-center">
              <Lock className="h-4 w-4" />
              <span>Error 401 - Unauthorized</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <ButtonLink
              className="bg-amber-500 hover:bg-amber-600 text-white"
              href="/auth/sign-in"
            >
              <LogIn />
              Log In
            </ButtonLink>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="border-amber-200 text-amber-600 hover:bg-amber-25"
            >
              <ArrowLeft />
              Go Back
            </Button>
          </div>
          <div className="pt-4 border-t border-amber-100">
            <p className="text-xs text-amber-500">
              Don&apos;t have an account?
              <Link
                href="/auth/sign-in"
                className="ml-1 underline hover:text-amber-700"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
