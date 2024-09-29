export class ValidationError extends Error {
  constructor(message: string, public code: number = 400) {
    super(message);
    this.name = "ValidationError";
    this.code = code;
  }
}
