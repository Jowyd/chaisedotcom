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

  export class GameNotFoundError extends BaseError {
    constructor(gameId: number | string) {
      super(
        `Game with id ${gameId} not found`,
        404,
        'GAME_NOT_FOUND'
      );
    }
  }
  
  export class GameOverError extends BaseError {
    constructor() {
      super(
        'Game is already over',
        403,
        'GAME_OVER'
      );
    }
  }
  
  export class InvalidTurnError extends BaseError {
    constructor() {
      super(
        'Not your turn or invalid piece selection',
        403,
        'INVALID_TURN'
      );
    }
  }
  
  export class InvalidMoveError extends BaseError {
    constructor(reason?: string) {
      super(
        reason || 'Invalid move',
        403,
        'INVALID_MOVE'
      );
    }
  }
  
  export class PromotionError extends BaseError {
    constructor(message: string) {
      super(
        message,
        403,
        'PROMOTION_ERROR'
      );
    }
  }
  
  export class InvalidMoveIndexError extends BaseError {
    constructor() {
      super(
        'Invalid move index',
        400,
        'INVALID_MOVE_INDEX'
      );
    }
  }
  
  export class AccessDeniedError extends BaseError {
    constructor() {
      super(
        'You do not have permission to access this game',
        403,
        'ACCESS_DENIED'
      );
    }
  }
  
  export class CheckError extends BaseError {
    constructor() {
      super(
        'Move would leave king in check',
        403,
        'CHECK_ERROR'
      );
    }
  }