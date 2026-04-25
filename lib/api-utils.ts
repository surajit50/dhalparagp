import { NextResponse } from "next/server";

export function apiResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function getPaginationParams(url: string) {
  const { searchParams } = new URL(url);
  const q = searchParams.get("q") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.max(1, parseInt(searchParams.get("pageSize") || "10"));
  
  return { q, page, pageSize, skip: (page - 1) * pageSize };
}
