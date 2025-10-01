import { useLocalStorage } from "./use-local-storage"

interface RecentSearch {
  id: string
  type: "route" | "station" | "closest"
  timestamp: number
  data: any
}

/**
 * Hook for managing recent searches
 */
export function useRecentSearches(maxItems = 10) {
  const [recentSearches, setRecentSearches] = useLocalStorage<RecentSearch[]>("recent-searches", [])

  // Add a new search to the history
  const addSearch = (search: Omit<RecentSearch, "id" | "timestamp">) => {
    const newSearch: RecentSearch = {
      ...search,
      id: generateId(),
      timestamp: Date.now(),
    }

    setRecentSearches((prev) => {
      // Remove duplicates based on stringified data
      const filtered = prev.filter((item) => JSON.stringify(item.data) !== JSON.stringify(newSearch.data))

      // Add new search at the beginning and limit to maxItems
      return [newSearch, ...filtered].slice(0, maxItems)
    })

    return newSearch.id
  }

  // Remove a search from history
  const removeSearch = (id: string) => {
    setRecentSearches((prev) => prev.filter((item) => item.id !== id))
  }

  // Clear all search history
  const clearSearches = () => {
    setRecentSearches([])
  }

  // Helper function to generate a unique ID
  const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  return {
    recentSearches,
    addSearch,
    removeSearch,
    clearSearches,
  }
}
