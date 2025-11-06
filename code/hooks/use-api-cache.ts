"use client"

import { useCallback } from "react"
import { useLocalStorage } from "./use-local-storage"

interface CacheItem<T> {
  data: T
  timestamp: number
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxItems?: number // Maximum number of items to store
}

/**
 * Hook for caching API responses
 */
export function useApiCache<T>(cacheKey: string, options: CacheOptions = { ttl: 1000 * 60 * 5, maxItems: 20 }) {
  const [cache, setCache] = useLocalStorage<Record<string, CacheItem<T>>>(`api-cache-${cacheKey}`, {})

  // Get an item from cache
  const getCachedItem = useCallback(
    (key: string): T | null => {
      const item = cache[key]

      // Return null if item doesn't exist
      if (!item) return null

      // Check if item has expired
      if (options.ttl && Date.now() - item.timestamp > options.ttl) {
        // Remove expired item
        const newCache = { ...cache }
        delete newCache[key]
        setCache(newCache)
        return null
      }

      return item.data
    },
    [cache, options.ttl, setCache],
  )

  // Set an item in cache
  const setCachedItem = useCallback(
    (key: string, data: T) => {
      setCache((prevCache) => {
        const newCache = { ...prevCache }

        // Add new item
        newCache[key] = {
          data,
          timestamp: Date.now(),
        }

        // Enforce max items limit if needed
        if (options.maxItems && Object.keys(newCache).length > options.maxItems) {
          // Find oldest item
          let oldestKey = Object.keys(newCache)[0]
          let oldestTime = newCache[oldestKey].timestamp

          Object.entries(newCache).forEach(([key, item]) => {
            if (item.timestamp < oldestTime) {
              oldestKey = key
              oldestTime = item.timestamp
            }
          })

          // Remove oldest item
          delete newCache[oldestKey]
        }

        return newCache
      })
    },
    [setCache, options.maxItems],
  )

  // Clear cache
  const clearCache = useCallback(() => {
    setCache({})
  }, [setCache])

  return {
    getCachedItem,
    setCachedItem,
    clearCache,
  }
}
