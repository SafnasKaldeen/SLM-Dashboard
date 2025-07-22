"use client";

import React, { useState, useEffect } from "react";
import EnhancedSemanticSankey from "./SemanticSankey";
import catalog from "@/Prompts/Catalog";
import { Button } from "@/components/ui/button";

export default function SankeyPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<any>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/sankey-data?page=${page}&limit=1`);
        const json = await res.json();
        if (!res.ok || !json.data?.length) {
          setError(json.error || "No data found");
          setData(null);
          return;
        }
        setData(json.data[0]);
        setTotal(json.total);
        setError(null); // reset error
      } catch (err: any) {
        setError(err.message || "Unexpected error");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!data) return <div className="p-6">No data available</div>;

  return (
    <main className="p-6 space-y-4">
      <EnhancedSemanticSankey
        catalog={catalog}
        selectedTables={data.selectedTables}
        currentUserRoles={data.currentUserRoles}
        roles={data.roles}
        queryName={data.queryName}
      />

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="text-sm text-slate-400">
          Page {page} of {total}
        </span>
        <Button
          variant="outline"
          onClick={() => setPage((prev) => prev + 1)}
          disabled={page >= total}
        >
          Next
        </Button>
      </div>
    </main>
  );
}
