import { useState, useEffect, useCallback } from "react";

type AgentStep = {
  name: string;
  endpoint: string;
  description?: string;
};

export const useGenerateSQL = () => {
  const [sql, setSQL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [explanation, setExplanation] = useState<string | null>(null); // optional for UI

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

  const generate = useCallback(async (query: string) => {
    if (!query) return;
    setLoading(true);
    setError(null);
    setExplanation(null);
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

        setResponses((prev) => [...prev, { step: step.name, data }]);
        currentPayload = data;
      } catch (err: any) {
        setError(err.message || "Unknown error");
        setLoading(false);
        return;
      }
    }

    // Check if the final step returned an empty SQL string
    if (!currentPayload.sql || currentPayload.sql.trim() === "") {
      setError(
        currentPayload.explanation ||
          "Unable to generate SQL due to ambiguity or access issues."
      );
      setExplanation(currentPayload.explanation || null);
      setLoading(false);
      return;
    }

    setSQL(currentPayload.sql);
    setExplanation(currentPayload.explanation || null);
    setLoading(false);
  }, []);

  return { sql, loading, error, explanation, responses, generate };
};
