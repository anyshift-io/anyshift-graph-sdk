// Typed errors thrown by the SDK. The server returns a stable envelope
// { error: { code, message } }; the client maps it onto these.
export class GraphAnswerError extends Error {
  code: string;
  status?: number;
  constructor(code: string, message: string, status?: number) {
    super(message);
    this.name = "GraphAnswerError";
    this.code = code;
    this.status = status;
  }
}

export class AuthError extends GraphAnswerError {
  constructor(message: string, status = 401) {
    super("unauthorized", message, status);
    this.name = "AuthError";
  }
}

export class BadQueryError extends GraphAnswerError {
  constructor(message: string, status = 400) {
    super("bad_request", message, status);
    this.name = "BadQueryError";
  }
}
