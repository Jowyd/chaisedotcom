export function notFound(name: string): never {
  const error = new Error(name + " not found");
  (error as any).status = 404;
  throw error;
}

export function unauthorized(): never {
  const error = new Error("Unauthorized");
  (error as any).status = 401;
  throw error;
}
