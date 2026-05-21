"use client"

import { useEffect, useState } from "react"

export function useFetch<T>(url: string | null, defaultValue?: T) {
  const [data, setData] = useState<T | null>(defaultValue ?? null)
  const [loading, setLoading] = useState(!!url)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!url) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch")
        return res.json() as Promise<T>
      })
      .then((json) => setData(json))
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false))
  }, [url, reloadKey])

  const resolved = defaultValue !== undefined ? (data ?? defaultValue) : data

  return {
    data: resolved as T extends undefined ? T | null : T,
    loading,
    error,
    refetch: () => setReloadKey((k) => k + 1),
  }
}

/** useFetch with a non-null default while loading or on error */
export function useFetchWithDefault<T>(url: string | null, defaultValue: T) {
  const { data, loading, error, refetch } = useFetch<T>(url)
  return { data: data ?? defaultValue, loading, error, refetch }
}
