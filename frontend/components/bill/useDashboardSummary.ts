"use client";

import { useEffect, useState } from "react";

export type DashboardSummary = {
  backendStatus: "connected" | "offline";
  orders: {
    active: number;
    settled: number;
    total: number;
    revenue: number;
    averageTicket: number;
  };
  tables: {
    total: number;
    occupied: number;
    available: number;
  };
  menu: {
    items: number;
  };
  updatedAt: string | null;
};

const POS_API_BASE_URL = process.env.NEXT_PUBLIC_POS_API_BASE_URL ?? "http://localhost:8000";

const emptySummary: DashboardSummary = {
  backendStatus: "offline",
  orders: { active: 0, settled: 0, total: 0, revenue: 0, averageTicket: 0 },
  tables: { total: 0, occupied: 0, available: 0 },
  menu: { items: 0 },
  updatedAt: null,
};

async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const response = await fetch(`${POS_API_BASE_URL}/api/pos/dashboard`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load dashboard summary");
  }

  return response.json();
}

export function useDashboardSummary() {
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const data = await fetchDashboardSummary();
        if (!isMounted) {
          return;
        }
        setSummary(data);
        setError(null);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }
        setSummary(emptySummary);
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load dashboard summary");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { summary, loading, error };
}
