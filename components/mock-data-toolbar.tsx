'use client';

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface MockDataToolbarProps {
  show: boolean;
  message?: string;
}

export function MockDataToolbar({ show, message }: MockDataToolbarProps) {
  if (!show) return null;

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50">
      <Info className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        {message || "This data is from mock sources. Real data will be shown once the backend connection is established."}
      </AlertDescription>
    </Alert>
  );
}