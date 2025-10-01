"use client"

import { useState, useCallback } from "react"
import { apiClient } from "@/lib/api-client"

interface UseApiWithRetryOptions {
  maxRetries?: number
  retryDelay?: number // in milliseconds
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

/**
 * Hook for making API calls with automatic retry on failure
 */
export function useApiWithRetry<TResponse, TInput = undefined>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "POST",
  options: UseApiWithRetryOptions = {},
) {
  const [data, setData] = useState<TResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const maxRetries = options.maxRetries ?? 3
  const retryDelay = options.retryDelay ?? 1000

  const execute = useCallback(
    async (inputData?: TInput) => {
      setIsLoading(true)
      setError(null)
      setRetryCount(0)

      const attemptRequest = async (attempt: number): Promise<TResponse> => {
        try {
          const response = await apiClient<TResponse, TInput>(endpoint, method, inputData)
          setData(response.data)
          options.onSuccess?.(response.data)
          return response.data
        } catch (err) {
          if (attempt < maxRetries) {
            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, retryDelay))
            setRetryCount(attempt + 1)
            return attemptRequest(attempt + 1)
          }

          // Max retries reached, throw error
          const error = err instanceof Error ? err : new Error(String(err))
          setError(error)
          options.onError?.(error)
          throw error
        }
      }

      try {
        const result = await attemptRequest(0)
        return result
      } finally {
        setIsLoading(false)
      }
    },
    [endpoint, method, options, maxRetries, retryDelay],
  )

  return {
    data,
    isLoading,
    error,
    retryCount,
    execute,
  }
}
