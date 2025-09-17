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
  const [explanation, setExplanation] = useState<string | null>(null);

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

    let currentPayload: any = { 
      query,
      executorRole: 'analyst' // Add this to ensure it's always present
    };

    for (let i = 0; i < agentSteps.length; i++) {
      const step = agentSteps[i];
      
      try {
        // console.log(`Sending to ${step.name}:`, {
        //   payload: currentPayload,
        //   keys: Object.keys(currentPayload),
        //   hasSemanticModel: !!currentPayload.semanticModel,
        //   semanticModelKeys: currentPayload.semanticModel ? Object.keys(currentPayload.semanticModel) : 'none'
        // });

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${step.endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentPayload),
        });

        const data = await res.json();

        // console.log(`Response from ${step.name}:`, {
        //   // success: data.success || true,
        //   hasSQL: !!data.sql,
        //   hasExplanation: !!data.explanation,
        //   responseKeys: Object.keys(data),
        //   data: data // Full response for debugging
        // });

        if (!res.ok) {
          console.error(`HTTP Error from ${step.name}:`, res.status, res.statusText);
          throw new Error(`Agent ${step.name} failed with status ${res.status}`);
        }

        // if (!data.success) {
        //   throw new Error(data.error || `Agent ${step.name} returned success: false`);
        // }

        setResponses((prev) => [...prev, { step: step.name, data }]);
        
        // For the last step (SQL Expert), preserve the original query
        if (i === agentSteps.length - 1) {
          currentPayload = { ...data, query: query };
        } else {
          currentPayload = { ...data, query: query }; // Always preserve original query
        }

      } catch (err: any) {
        console.error(`Error in ${step.name}:`, err);
        setError(err.message || "Unknown error");
        setLoading(false);
        return;
      }
    }

    // Check if the final step returned an empty SQL string
    if (!currentPayload.sql || currentPayload.sql.trim() === "") {
      const errorMsg = currentPayload.explanation || "Unable to generate SQL due to ambiguity or access issues.";
      console.log('No SQL generated:', errorMsg);
      setError(errorMsg);
      setExplanation(currentPayload.explanation || null);
      setLoading(false);
      return;
    }

    console.log('SQL generation successful:', {
      sqlLength: currentPayload.sql.length,
      hasExplanation: !!currentPayload.explanation
    });

    setSQL(currentPayload.sql);
    setExplanation(currentPayload.explanation || null);
    setLoading(false);
  }, []);

  return { sql, loading, error, explanation, responses, generate };
};