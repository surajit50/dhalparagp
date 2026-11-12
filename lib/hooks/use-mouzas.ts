"use client";

import useSWR from "swr";

export interface MouzaOption {
  id: string;
  mouzaName: string;
}

export interface TubewellOption {
  id: string;
  tubewellNo: string | null;
  mouza: string | null;
  mouzaId: string | null;
  condition: string;
  landmark: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load options (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export function useMouzas() {
  const { data, error } = useSWR<MouzaOption[]>("/api/mouza-master", fetchJson);
  return {
    mouzas: data ?? [],
    isLoading: !data && !error,
    error,
  };
}

export function useTubewellOptions() {
  const { data, error } = useSWR<TubewellOption[]>("/api/tubewells", fetchJson);
  return {
    tubewells: data ?? [],
    isLoading: !data && !error,
    error,
  };
}
