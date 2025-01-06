export interface ProfileUpdate {
  username: string;
}

export interface PasswordUpdate {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileValidationError {
  field: keyof ProfileUpdate | keyof PasswordUpdate;
  code: string;
  message: string;
}
