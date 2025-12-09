import { useState, useEffect } from "react";

type AgentStep = {
  name: string;
  endpoint: string;
  description?: string;
};

export const useGenerateSQL = (query: string) => {
  const [sql, setSQL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<any[]>([]);

  const agentSteps: AgentStep[] = [
    {
      name: "Database Expert",
      endpoint: "/api/TableSelector",
      description:
        "Knows all about the organization and the database format. Given a query, returns the relevant tables.",
    },
    {
      name: "Context Enricher",
      endpoint: "/api/SemanticBuilder",
      description:
        "Constructs a semantic model based on the selected tables and passes it to the SQL Expert.",
    },
    {
      name: "SQL Expert",
      endpoint: "/api/SQLGenerator",
      description:
        "Generates SQL from the semantic model and enforces role-based access and ambiguity checks.",
    },
  ];

  useEffect(() => {
    const runAgentsSequentially = async () => {
      if (!query) return;
      setLoading(true);
      setError(null);
      setResponses([]);
      setSQL(null);

      let currentPayload: any = { query };

      for (const step of agentSteps) {
        try {
          const res = await fetch(step.endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(currentPayload),
          });

          const data = await res.json();

          if (!res.ok || !data) {
            throw new Error(`Agent ${step.name} failed`);
          }

          console.log(`✅ ${step.name} responded:`, data);
          setResponses((prev) => [...prev, { step: step.name, data }]);

          currentPayload = data;
        } catch (err: any) {
          setError(err.message || "Unknown error");
          setLoading(false);
          return;
        }
      }

      setSQL(currentPayload.sql || null);
      setLoading(false);
    };

    runAgentsSequentially();
  }, [query]);

  return { sql, loading, error, responses };
};
