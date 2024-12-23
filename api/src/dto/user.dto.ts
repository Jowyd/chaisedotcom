export interface UserInputDTO {
  username: string;
  password: string;
}

export interface UserInputPatchDTO {
  username?: string;
  password?: string;
}

export interface UserOutputDTO {
  id: number;
  username: string;
  password: string;
}

export interface UserProfile {
  username: string;
  createdAt: Date;
  publicProfile: boolean;
  showGameHistory: boolean;
}

export interface PasswordUpdate {
  currentPassword: string;
  newPassword: string;
}

export interface PrivacySettings {
  publicProfile: boolean;
  showGameHistory: boolean;
}
