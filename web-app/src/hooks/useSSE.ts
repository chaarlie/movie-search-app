import { useEffect, useState } from "react";

interface SSEResponse<T> {
  status: "success" | "failure";
  results?: T;
  duration?: number;
  errorMessage?: string;
}

interface UseSSEOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  enabled?: boolean;
}

export function useSSE<T>(
  streamUrl: string,
  queryId: string | null,
  options: UseSSEOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const url = new URL(streamUrl);

    if (queryId) {
      url.searchParams.append("queryId", queryId);
    }

    setIsLoading(true);
    setError(null);
    setData(null); // Clear previous data

    const eventSource = new EventSource(url.toString());

    eventSource.onopen = () => {
      console.log("✓ SSE connected:", streamUrl);
    };

    eventSource.onmessage = (event) => {
      console.log("SSE message received:", event.data);
      try {
        const response: SSEResponse<T> = JSON.parse(event.data);

        if (response.status === "success") {
          setData(response.results!);
          setIsLoading(false);
          options.onSuccess?.(response.results!);
          eventSource.close();
        } else {
          const errorMsg = response.errorMessage || "Unknown error";
          console.error("✗ SSE failure:", errorMsg);
          setError(errorMsg);
          setIsLoading(false);
          options.onError?.(errorMsg);
          eventSource.close();
        }
      } catch (err) {
        setError("Failed to parse response");
        setIsLoading(false);
        eventSource.close();
      }
    };

    eventSource.onerror = (err) => {
      console.error("✗ SSE Error:", err);
      setError("Connection failed");
      setIsLoading(false);
      eventSource.close();
    };

    return () => {
      console.log("SSE cleanup, closing connection");
      eventSource.close();
    };
  }, [streamUrl, queryId, options.enabled]);

  return { data, error, isLoading };
}
