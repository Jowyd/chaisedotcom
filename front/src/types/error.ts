export interface ValidationError<T> {
  field: keyof T;
  code: string;
  message: string;
}
