import { useEffect, useRef, useState } from "react";
import { EventSource } from "eventsource";

function useSSE<Data>(
  url: string,
  options?: EventSourceInit
): {
  data: Data | null;
  error: string | null;
  sse: EventSource | null;
} {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!url) {
      setError("URL is required for SSE connection");
      console.error("SSE Error: URL is required");
      return;
    }
    eventSourceRef.current = new EventSource(url, options);

    // Handle incoming data
    eventSourceRef.current.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setData(newData);
    };

    // Handle errors
    eventSourceRef.current.onerror = () => {
      setError("Connection lost. Trying to reconnect...");
      eventSourceRef.current?.close();
    };

    // Cleanup when component unmounts
    return () => eventSourceRef.current?.close();
  }, [url, options]);

  return { data, error, sse: eventSourceRef.current };
}

export default useSSE;
