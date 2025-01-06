import type { RegisterValidation, RegisterValidationError } from '@/types/auth';
import type { PasswordUpdate, ProfileUpdate, ProfileValidationError } from '@/types/profile';

export class ValidationService {
  static validateRegisterForm(data: RegisterValidation): RegisterValidationError[] {
    const errors: RegisterValidationError[] = [];

    if (!data.username.trim()) {
      errors.push({
        field: 'username',
        code: 'REQUIRED',
        message: 'Username is required',
      });
    } else if (data.username.length < 3) {
      errors.push({
        field: 'username',
        code: 'MIN_LENGTH',
        message: 'Username must be at least 3 characters long',
      });
    }

    if (!data.password) {
      errors.push({
        field: 'password',
        code: 'REQUIRED',
        message: 'Password is required',
      });
    } else if (data.password.length < 8) {
      errors.push({
        field: 'password',
        code: 'MIN_LENGTH',
        message: 'Password must be at least 8 characters long',
      });
    }

    if (data.password !== data.confirmPassword) {
      errors.push({
        field: 'confirmPassword',
        code: 'NOT_MATCHING',
        message: 'Passwords do not match',
      });
    }

    if (!data.acceptTerms) {
      errors.push({
        field: 'acceptTerms',
        code: 'REQUIRED',
        message: 'Please accept the terms and conditions',
      });
    }

    return errors;
  }

  static validateProfileUpdate(data: ProfileUpdate): ProfileValidationError[] {
    const errors: ProfileValidationError[] = [];

    if (!data.username.trim()) {
      errors.push({
        field: 'username',
        code: 'REQUIRED',
        message: 'Username cannot be empty',
      });
    } else if (data.username.length < 3) {
      errors.push({
        field: 'username',
        code: 'MIN_LENGTH',
        message: 'Username must be at least 3 characters long',
      });
    }

    return errors;
  }

  static validatePasswordUpdate(data: PasswordUpdate): ProfileValidationError[] {
    const errors: ProfileValidationError[] = [];

    if (!data.currentPassword) {
      errors.push({
        field: 'currentPassword',
        code: 'REQUIRED',
        message: 'Current password is required',
      });
    }

    if (!data.newPassword) {
      errors.push({
        field: 'newPassword',
        code: 'REQUIRED',
        message: 'New password is required',
      });
    } else if (data.newPassword.length < 8) {
      errors.push({
        field: 'newPassword',
        code: 'MIN_LENGTH',
        message: 'New password must be at least 8 characters long',
      });
    }

    if (data.newPassword !== data.confirmPassword) {
      errors.push({
        field: 'confirmPassword',
        code: 'NOT_MATCHING',
        message: 'New passwords do not match',
      });
    }

    return errors;
  }
}
