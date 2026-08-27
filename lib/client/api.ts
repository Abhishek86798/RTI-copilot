import { matchDemoCase } from "./demo-cases";
import type { DraftResponse, RoutingResponse } from "./types";

/**
 * The single place the frontend talks to the backend.
 *
 * Everything the UI knows about the server lives behind these two functions:
 * the paths, the request shapes, the timeout, the retry policy, and the
 * translation of an HTTP failure into a sentence a citizen can act on. Pages
 * and components never call `fetch` directly, so when the backend adds
 * persistence or changes a route, this file changes and nothing else does.
 *
 * Endpoints consumed (owned by `app/api/`, not by this file):
 *   POST /api/route-authority  { grievance }
 *     -> 200 { candidates[], extractedReferences[], lowConfidence }
 *     -> 400 { error }  grievance under 15 words
 *     -> 422 { error }  nothing in the directory plausibly matches
 *   POST /api/draft            { grievance, authorityId, extractedReferences }
 *     -> 200 { items[], lifeOrLibertyFlag, lifeOrLibertyReason,
 *              portalText, portalCharCount, fullText, overPortalLimit }
 *     -> 400 { error }  unknown authority, or missing grievance
 */

/** Where a result came from. Surfaced in the UI; never silently swallowed. */
export type ResultSource = "live" | "demo-fixture";

export type ApiResult<T> = {
  data: T;
  source: ResultSource;
};

export type ApiErrorKind =
  /** The server understood us and said no. The message is worth showing. */
  | "rejected"
  /** Network down, DNS, offline, CORS. Retrying may help. */
  | "unreachable"
  /** Took longer than we are willing to make someone stare at a spinner. */
  | "timeout"
  /** 5xx, or a malformed body. Backend problem, not the citizen's. */
  | "server";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }

  /**
   * What to actually put on screen. Never leaks a stack trace or a provider
   * name at somebody who is already frustrated enough to be filing an RTI.
   */
  get userMessage(): string {
    switch (this.kind) {
      case "rejected":
        return this.message;
      case "unreachable":
        return "Unable to establish secure connection with the central registry. Verify local connectivity; local state is preserved.";
      case "timeout":
        return "Transaction timeout exceeded. This indicates high network latency. Please retry the operation.";
      case "server":
        return "An internal system error has occurred. Please retry the operation.";
    }
  }

  /** Whether offering a "Try again" button makes sense. */
  get retryable(): boolean {
    return this.kind !== "rejected";
  }
}

/**
 * Generous by web standards, because the alternative is worse. Both calls are
 * a round trip to an LLM on a free tier, and a citizen on a 3G connection in a
 * district town would rather wait twenty seconds than retype their grievance.
 */
const TIMEOUT_MS = 30_000;

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("timeout", "Request timed out.");
    }
    throw new ApiError("unreachable", "Network request failed.");
  } finally {
    clearTimeout(timer);
  }

  // Read the body once, then decide. A 500 from the platform is often HTML,
  // and calling .json() on it would throw a parse error that hides the status.
  const raw = await response.text();
  let parsed: unknown;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    const serverMessage =
      parsed && typeof parsed === "object" && "error" in parsed
        ? String((parsed as { error: unknown }).error)
        : null;

    // 4xx means the request was understood and refused, and the route handlers
    // already phrase those for citizens. 5xx is ours to apologise for.
    if (response.status < 500 && serverMessage) {
      throw new ApiError("rejected", serverMessage, response.status);
    }
    throw new ApiError(
      "server",
      serverMessage ?? `Request failed with status ${response.status}.`,
      response.status
    );
  }

  if (parsed === null) {
    throw new ApiError("server", "The server returned an empty response.");
  }
  return parsed as T;
}

/* ------------------------------------------------------------------ */
/* Endpoints                                                           */
/* ------------------------------------------------------------------ */

/**
 * Step 1 — map the grievance to candidate Public Authorities.
 *
 * On failure, falls back to a canned response only when the text is verbatim
 * one of our seeded demo cases. Real user text always surfaces the error: a
 * fabricated authority match would send someone to the wrong office, which is
 * the precise harm this product exists to prevent.
 */
export async function routeAuthority(
  grievance: string
): Promise<ApiResult<RoutingResponse>> {
  try {
    const data = await postJson<RoutingResponse>("/api/route-authority", {
      grievance,
    });
    return { data, source: "live" };
  } catch (error) {
    const demo = matchDemoCase(grievance);
    if (demo && error instanceof ApiError && error.kind !== "rejected") {
      return { data: demo.routing, source: "demo-fixture" };
    }
    throw error;
  }
}

/**
 * Step 2 — rewrite the grievance into an itemized request for records.
 *
 * Same fallback rule as routing, for the same reason: a generated RTI
 * application is a legal document, and inventing one for text we have not
 * actually processed would be worse than showing an error.
 */
export async function generateDraft(params: {
  grievance: string;
  authorityId: string;
  extractedReferences: string[];
}): Promise<ApiResult<DraftResponse>> {
  try {
    const data = await postJson<DraftResponse>("/api/draft", params);
    return { data, source: "live" };
  } catch (error) {
    const demo = matchDemoCase(params.grievance);
    if (demo && error instanceof ApiError && error.kind !== "rejected") {
      return { data: demo.draft, source: "demo-fixture" };
    }
    throw error;
  }
}

/** Narrows an unknown catch value to something with a showable message. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  return new ApiError("server", "An unexpected system exception was encountered.");
}
