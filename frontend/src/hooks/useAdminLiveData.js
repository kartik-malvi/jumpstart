import { useCallback, useEffect, useState } from "react";
import api from "../api/api";

const DEFAULT_DATA = {
  kpis: {
    totalUsers: 0,
    testsPurchased: 0,
    completedTests: 0,
    revenue: 0,
    revenueLabel: "₹0",
  },
  users: [],
  payments: [],
  submissions: [],
  publishedResults: [],
  recentActivity: [],
  updatedAt: null,
};

export default function useAdminLiveData(pollMs = 5000) {
  const [data, setData] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLiveData = useCallback(async () => {
    try {
      const res = await api.get("/v1/admin/live-data");
      setData(res?.data?.data || DEFAULT_DATA);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.msg || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const safeFetch = async () => {
      if (!mounted) return;
      await fetchLiveData();
    };

    safeFetch();
    const id = setInterval(safeFetch, pollMs);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [fetchLiveData, pollMs]);

  return { data, loading, error, refetch: fetchLiveData };
}
