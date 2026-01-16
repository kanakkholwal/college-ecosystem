"use client";

import ErrorBanner from "@/components/utils/error";
import React, { Component, ErrorInfo, ReactNode, Suspense } from "react";

// Shared interfaces
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Class-based Error Boundary
export class GracefullyDegradingErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <ErrorBanner
            title="Something went wrong"
            description="An error occurred while rendering this component. Please try again later."
          />
        )
      );
    }

    return this.props.children;
  }
}

// ErrorBoundary (Wrapper around the class-based version)
export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  children,
  fallback,
  onError,
}) => {
  return (
    <GracefullyDegradingErrorBoundary fallback={fallback} onError={onError}>
      {children}
    </GracefullyDegradingErrorBoundary>
  );
};

// ErrorBoundary with Suspense support
interface ErrorBoundaryWithSuspenseProps extends ErrorBoundaryProps {
  loadingFallback: ReactNode;
}

export const ErrorBoundaryWithSuspense: React.FC<
  ErrorBoundaryWithSuspenseProps
> = ({ children, fallback, onError, loadingFallback }) => {
  return (
    <Suspense fallback={loadingFallback}>
      <GracefullyDegradingErrorBoundary fallback={fallback} onError={onError}>
        {children}
      </GracefullyDegradingErrorBoundary>
    </Suspense>
  );
};
