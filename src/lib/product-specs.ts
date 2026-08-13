import type { SpecPair } from "@/repositories/interfaces/IProductRepository";

export function normalizeSpecs(raw: unknown): SpecPair[] {
  if (Array.isArray(raw)) {
    return raw
      .filter(
        (item): item is SpecPair =>
          typeof item === "object" &&
          item !== null &&
          "key" in item &&
          "value" in item,
      )
      .filter(
        (item) =>
          typeof item.key === "string" &&
          typeof item.value === "string",
      )
      .map((item) => ({
        key: item.key.trim(),
        value: item.value.trim(),
      }))
      .filter((item) => item.key !== "" || item.value !== "");
  }

  if (raw && typeof raw === "object") {
    return Object.entries(raw as Record<string, unknown>)
      .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "")
      .map(([key, value]) => ({ key, value: String(value) }));
  }

  return [];
}