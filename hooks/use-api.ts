"use client"

import { useState, useCallback } from "react"
import { apiClient } from "@/lib/api-client"

interface UseApiOptions {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

/**
 * Generic hook for making API calls with loading and error states
 */
export function useApi<TResponse, TInput = undefined>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "POST",
  options: UseApiOptions = {},
) {
  const [data, setData] = useState<TResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(
    async (inputData?: TInput) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await apiClient<TResponse, TInput>(endpoint, method, inputData)
        setData(response.data)
        options.onSuccess?.(response.data)
        return response.data
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        options.onError?.(error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [endpoint, method, options],
  )

  return {
    data,
    isLoading,
    error,
    execute,
  }
}
