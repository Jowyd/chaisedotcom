import type { ValidationError } from './error';

export interface RegisterValidation {
  username: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export type RegisterValidationError = ValidationError<RegisterValidation>;

export interface LoginValidation {
  username: string;
  password: string;
}

export type LoginValidationError = ValidationError<LoginValidation>;
