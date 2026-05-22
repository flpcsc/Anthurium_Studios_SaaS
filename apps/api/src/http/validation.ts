import { HttpError } from "./errors.js";

export type JsonRecord = Record<string, unknown>;

export function asRecord(value: unknown): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpError(400, "INVALID_BODY", "Request body must be an object.");
  }

  return value as JsonRecord;
}

export function optionalString(
  body: JsonRecord,
  key: string,
): string | undefined {
  const value = body[key];

  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new HttpError(400, "INVALID_FIELD", `${key} must be a string.`);
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

export function requiredString(body: JsonRecord, key: string): string {
  const value = optionalString(body, key);

  if (!value) {
    throw new HttpError(400, "INVALID_FIELD", `${key} is required.`);
  }

  return value;
}
