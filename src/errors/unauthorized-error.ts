export class UnauthorizedError extends Error {
  constructor() {
    super("권한이 없습니다.");
    this.name = "UnauthorizedError";
  }
}
