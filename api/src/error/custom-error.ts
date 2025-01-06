export class BaseError extends Error {
    constructor(
      public message: string,
      public statusCode: number,
      public code: string
    ) {
      super(message);
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class UserNotFoundError extends BaseError {
    constructor(identifier: string | number) {
      super(
        `User ${identifier} not found`,
        404,
        'USER_NOT_FOUND'
      );
    }
  }
  
  export class UsernameConflictError extends BaseError {
    constructor(username: string) {
      super(
        `Username "${username}" is already taken`,
        409,
        'USERNAME_CONFLICT'
      );
    }
  }
  
  export class InvalidPasswordError extends BaseError {
    constructor() {
      super(
        'Current password is incorrect',
        401,
        'INVALID_PASSWORD'
      );
    }
  }
  
  export class PrivacyViolationError extends BaseError {
    constructor() {
      super(
        'You do not have permission to view this profile',
        403,
        'PRIVACY_VIOLATION'
      );
    }
  }
  
  export class GameHistoryAccessError extends BaseError {
    constructor() {
      super(
        'Game history is not publicly available for this user',
        403,
        'GAME_HISTORY_PRIVATE'
      );
    }
  }
  
  export class InvalidDateRangeError extends BaseError {
    constructor() {
      super(
        'Invalid date range provided for game history',
        400,
        'INVALID_DATE_RANGE'
      );
    }
  }

  export class UserCreationError extends BaseError {
    constructor(reason: string) {
      super(
        `Failed to create user: ${reason}`,
        400,
        'USER_CREATION_FAILED'
      );
    }
  }
  
  export class UserUpdateError extends BaseError {
    constructor(reason: string) {
      super(
        `Failed to update user: ${reason}`,
        400,
        'USER_UPDATE_FAILED'
      );
    }
  }
  
  export class UserDeletionError extends BaseError {
    constructor(id: number) {
      super(
        `Failed to delete user with ID ${id}`,
        400,
        'USER_DELETION_FAILED'
      );
    }
  }
  
  export class LeaderboardError extends BaseError {
    constructor(reason: string) {
      super(
        `Failed to fetch leaderboard: ${reason}`,
        500,
        'LEADERBOARD_ERROR'
      );
    }
  }

  export class AuthenticationError extends BaseError {
    constructor(message: string) {
      super(message, 401, 'AUTHENTICATION_FAILED');
    }
  }
  
  export class InvalidCredentialsError extends AuthenticationError {
    constructor() {
      super('Invalid username or password');
    }
  }
  
  export class UserExistsError extends BaseError {
    constructor(field: string) {
      super(
        `User with this ${field} already exists`,
        409,
        'USER_EXISTS'
      );
    }
  }
  
  export class TokenError extends BaseError {
    constructor(message: string) {
      super(message, 401, 'TOKEN_ERROR');
    }
  }
  
  export class InvalidRefreshTokenError extends TokenError {
    constructor() {
      super('Invalid or expired refresh token');
    }
  }
  
  export class MissingTokenError extends TokenError {
    constructor() {
      super('Refresh token is missing or malformed');
    }
  }