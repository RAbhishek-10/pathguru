import { describe, it, expect } from "vitest"
import { parseJsonArray } from "./json"

describe("parseJsonArray", () => {
  it("parses valid JSON arrays", () => {
    expect(parseJsonArray('["a","b"]')).toEqual(["a", "b"])
  })

  it("returns empty array for invalid JSON", () => {
    expect(parseJsonArray("not-json")).toEqual([])
  })
})
