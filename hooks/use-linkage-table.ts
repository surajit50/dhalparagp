import { useState, useEffect, useCallback } from "react";

interface UseLinkageTableProps<T> {
  apiEndpoint: string;
  initialItems: T[];
  initialTotal?: number;
}

export function useLinkageTable<T>({ 
  apiEndpoint, 
  initialItems, 
  initialTotal = 0 
}: UseLinkageTableProps<T>) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [items, setItems] = useState<T[]>(initialItems);
  const [total, setTotal] = useState(initialTotal || initialItems.length);
  const [loading, setLoading] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const refresh = useCallback(() => {
    setRefreshCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiEndpoint}?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setItems(data.items);
          setTotal(data.total);
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error(`Error loading data from ${apiEndpoint}:`, error);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [apiEndpoint, q, page, pageSize, refreshCount]);

  const handleSearch = (query: string) => {
    setQ(query);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    q,
    setQ: handleSearch,
    page,
    setPage,
    pageSize,
    items,
    setItems,
    total,
    setTotal,
    loading,
    refresh,
    totalPages
  };
}
