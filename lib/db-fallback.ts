export async function withDbFallback<T>(
  query: () => Promise<T>,
  fallback: T | (() => T)
): Promise<T> {
  try {
    return await query()
  } catch (error) {
    console.error("[db-fallback] Database unavailable, using fallback data:", error)
    return typeof fallback === "function" ? (fallback as () => T)() : fallback
  }
}
