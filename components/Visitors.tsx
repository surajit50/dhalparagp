"use client";

import { updateTotalVisitors, getOnlineVisitors } from "@/action/Visitor";
import { useTransition, useState, useEffect } from "react";

export const Visitors = () => {
  const [isPending, startTransition] = useTransition();
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startTransition(() => {
      updateTotalVisitors()
        .then((data) => {
          setVisitorCount(data);
          setError(null);
        })
        .catch((err) => {
          console.error("Failed to update total visitors:", err);
          setError("Failed to load visitor count");
        });
    });
  }, []);

  return (
    <div aria-live="polite" aria-atomic="true">
      {error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <p className="text-center">
          {isPending
            ? "Updating total visitors..."
            : visitorCount !== null
            ? `Total Visitors: ${visitorCount}`
            : "Loading total visitors..."}
        </p>
      )}
    </div>
  );
};

export const OnlineVisitors = () => {
  const [isPending, startTransition] = useTransition();
  const [onlineCount, setOnlineCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOnlineVisitors = () => {
      startTransition(() => {
        getOnlineVisitors()
          .then((data) => {
            setOnlineCount(data);
            setError(null);
          })
          .catch((err) => {
            console.error("Failed to fetch online visitors:", err);
            setError("Failed to load online visitor count");
          });
      });
    };

    fetchOnlineVisitors();
    // Refresh online visitors count every 30 seconds
  }, []);

  return (
    <div aria-live="polite" aria-atomic="true">
      {error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <p className="text-center">
          {isPending
            ? "Updating online visitors..."
            : onlineCount !== null
            ? `Online Visitors: ${onlineCount}`
            : "Loading online visitors..."}
        </p>
      )}
    </div>
  );
};
