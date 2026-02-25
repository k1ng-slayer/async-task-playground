import { validate as uuidValidate } from "uuid";

export function isValidTaskPayload(body: unknown): {
  valid: boolean;
  error?: string;
} {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body is required." };
  }

  const { name, duration, shouldFail, priority } = body as Record<
    string,
    unknown
  >;

  const trimmedName = typeof name === "string" ? name.trim() : "";
  if (!trimmedName || trimmedName.length > 15) {
    return {
      valid: false,
      error: "Name is required and must be 15 characters or fewer.",
    };
  }

  if (
    typeof duration !== "number" ||
    !Number.isInteger(duration) ||
    duration < 1 ||
    duration > 600
  ) {
    return {
      valid: false,
      error: "Duration must be an integer between 1 and 600 seconds.",
    };
  }

  if (typeof shouldFail !== "boolean") {
    return { valid: false, error: "shouldFail must be a boolean." };
  }

  if (
    priority !== undefined &&
    (typeof priority !== "number" ||
      !Number.isInteger(priority) ||
      ![1, 2, 3].includes(priority))
  ) {
    return { valid: false, error: "Priority must be 1, 2, or 3." };
  }

  return { valid: true };
}

export function hasValidTaskId(id: string): boolean {
  return uuidValidate(id);
}
