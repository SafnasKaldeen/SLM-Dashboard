"use client"

import { useState, useCallback } from "react"
import { apiClient } from "@/lib/api-client"
import { useApiCache } from "./use-api-cache"

interface UseCachedApiOptions {
  ttl?: number // Time to live in milliseconds
  maxItems?: number // Maximum number of items to store
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

/**
 * Hook for making API calls with caching
 */
export function useCachedApi<TResponse, TInput = undefined>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "POST",
  options: UseCachedApiOptions = {},
) {
  const [data, setData] = useState<TResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const { getCachedItem, setCachedItem } = useApiCache<TResponse>(endpoint, {
    ttl: options.ttl,
    maxItems: options.maxItems,
  })

  const execute = useCallback(
    async (inputData?: TInput) => {
      setIsLoading(true)
      setError(null)

      // Generate cache key based on endpoint and input data
      const cacheKey = inputData ? `${endpoint}-${JSON.stringify(inputData)}` : endpoint

      try {
        // Try to get from cache first
        const cachedData = getCachedItem(cacheKey)

        if (cachedData) {
          setData(cachedData)
          options.onSuccess?.(cachedData)
          setIsLoading(false)
          return cachedData
        }

        // If not in cache, make API call
        const response = await apiClient<TResponse, TInput>(endpoint, method, inputData)
        setData(response.data)

        // Cache the response
        setCachedItem(cacheKey, response.data)

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
    [endpoint, method, options, getCachedItem, setCachedItem],
  )

  return {
    data,
    isLoading,
    error,
    execute,
  }
}
