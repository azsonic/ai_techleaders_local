"use client";

import { useEffect, useState } from "react";

import type { ApiResult } from "@devmentor/core";
import { apiCall } from "@devmentor/ui/backend/api/api-call";
import { ErrorMessage } from "@devmentor/ui/backend/feedback/error-message";
import { LoadingMessage } from "@devmentor/ui/backend/feedback/loading-message";

import type { HealthStatus } from "@/modules/health/health.service";

export function HealthStatusPanel() {
  const [result, setResult] = useState<ApiResult<HealthStatus>>();

  useEffect(() => {
    let isCurrent = true;
    apiCall<HealthStatus>("/api/health").then((next) => {
      if (isCurrent) setResult(next);
    });
    return () => {
      isCurrent = false;
    };
  }, []);

  if (!result) {
    return <LoadingMessage label="Checking the database…" />;
  }
  if (!result.ok) {
    return <ErrorMessage title="Health check failed" message={result.error.message} />;
  }
  return <p className="text-sm text-muted-foreground">Database connection is healthy.</p>;
}
