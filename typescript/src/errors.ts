// Typed errors thrown by the SDK. The server returns a stable envelope
// { error: { code, message } }; the client maps it onto these.
export type TimeoutSource = "statement" | "request" | "gateway" | "client";

export class GraphAnswerError extends Error {
  code: string;
  status?: number;
  timeoutSource?: TimeoutSource;
  requestId?: string;
  constructor(
    code: string,
    message: string,
    status?: number,
    details: { timeoutSource?: TimeoutSource; requestId?: string } = {},
  ) {
    super(message);
    this.name = "GraphAnswerError";
    this.code = code;
    this.status = status;
    this.timeoutSource = details.timeoutSource;
    this.requestId = details.requestId;
  }
}

export class AuthError extends GraphAnswerError {
  constructor(message: string, status = 401) {
    super("unauthorized", message, status);
    this.name = "AuthError";
  }
}

export interface ResourceSelectionCandidate {
  id: string;
  anyshiftID: string | null;
  name: string;
  type: string | null;
  namespace: string | null;
  cluster: string | null;
}

export class BadQueryError extends GraphAnswerError {
  selectionCode?: "ambiguous_resource";
  candidates: ResourceSelectionCandidate[];

  constructor(
    message: string,
    status = 400,
    selectionCode?: "ambiguous_resource",
    candidates: ResourceSelectionCandidate[] = [],
  ) {
    super("bad_request", message, status);
    this.name = "BadQueryError";
    this.selectionCode = selectionCode;
    this.candidates = candidates;
  }
}
