// hooks/useSemanticSankeyData.ts
import { useState, useEffect } from "react";
import axios from "axios";

interface SankeyData {
  selectedTables: string[];
  currentUserRoles: string[];
  roles: string[];
  queryName: string;
}

export default function useSemanticSankeyData() {
  const [data, setData] = useState<SankeyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Replace with your MongoDB (or DynamoDB) API endpoint
        const response = await axios.get("/api/sankeyData");
        setData(response.data);
      } catch (err: any) {
        setError(err.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}
