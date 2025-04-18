import { Game } from "../models/game.model";
import Move from "../models/move.model";
import { ChessPiece, ChessBoard } from "../interfaces/chess.interface";
import { CapturedPiece, MakeMoveDTO, MoveCreateDTO } from "../dto/move.dto";
import { GameReturnDTO } from "../dto/move.dto";
import { UserToken } from "../dto/auth.dto";
import { gameService } from "./game.service";
import { ChessColor } from "../types";
import { GameStatus } from "../enums/gameStatus.enum";
import {
  AccessDeniedError,
  CheckError,
  GameNotFoundError,
  GameOverError,
  InvalidMoveError,
  InvalidMoveIndexError,
  InvalidTurnError,
  PromotionError,
} from "../error/custom-error";

export class MoveService {
  //private readonly INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  private initialBoard: ChessBoard = {
    a1: { type: "ROOK", color: "WHITE" },
    b1: { type: "KNIGHT", color: "WHITE" },
    c1: { type: "BISHOP", color: "WHITE" },
    d1: { type: "QUEEN", color: "WHITE" },
    e1: { type: "KING", color: "WHITE" },
    f1: { type: "BISHOP", color: "WHITE" },
    g1: { type: "KNIGHT", color: "WHITE" },
    h1: { type: "ROOK", color: "WHITE" },
    a2: { type: "PAWN", color: "WHITE" },
    b2: { type: "PAWN", color: "WHITE" },
    c2: { type: "PAWN", color: "WHITE" },
    d2: { type: "PAWN", color: "WHITE" },
    e2: { type: "PAWN", color: "WHITE" },
    f2: { type: "PAWN", color: "WHITE" },
    g2: { type: "PAWN", color: "WHITE" },
    h2: { type: "PAWN", color: "WHITE" },
    a8: { type: "ROOK", color: "BLACK" },
    b8: { type: "KNIGHT", color: "BLACK" },
    c8: { type: "BISHOP", color: "BLACK" },
    d8: { type: "QUEEN", color: "BLACK" },
    e8: { type: "KING", color: "BLACK" },
    f8: { type: "BISHOP", color: "BLACK" },
    g8: { type: "KNIGHT", color: "BLACK" },
    h8: { type: "ROOK", color: "BLACK" },
    a7: { type: "PAWN", color: "BLACK" },
    b7: { type: "PAWN", color: "BLACK" },
    c7: { type: "PAWN", color: "BLACK" },
    d7: { type: "PAWN", color: "BLACK" },
    e7: { type: "PAWN", color: "BLACK" },
    f7: { type: "PAWN", color: "BLACK" },
    g7: { type: "PAWN", color: "BLACK" },
    h7: { type: "PAWN", color: "BLACK" },
  };

  private COLUMNS = ["a", "b", "c", "d", "e", "f", "g", "h"];
  private ROWS = ["1", "2", "3", "4", "5", "6", "7", "8"];

  async getInitialBoard(game: Game, user: UserToken): Promise<GameReturnDTO> {
    const fen = await this.getFenFromBoard(this.initialBoard, game.id);

    const playersInformations = await gameService.getPlayersInformations(
      game,
      user
    );

    const moveReturn: GameReturnDTO = {
      id: game.id.toString(),
      fen: fen,
      moves: [],
      isCheck: false,
      isCheckmate: false,
      status: game.status,
      promotion: null,
      whitePlayer: playersInformations.whitePlayer,
      blackPlayer: playersInformations.blackPlayer,
    };

    return moveReturn;
  }

  async createMove(dto: MoveCreateDTO) {
    return Move.create({
      game_id: dto.game_id,
      from: dto.from,
      to: dto.to,
      piece: dto.piece,
      type: dto.type,
      isCheck: dto.isCheck,
      isCheckmate: dto.isCheckmate,
      turn: dto.turn,
    });
  }

  async currentMoveOfGame(game_id: number): Promise<ChessBoard> {
    let currentBoard = { ...this.initialBoard };
    const moves = await Move.findAll({
      where: { game_id },
      order: [["id", "ASC"]],
    });

    for (const move of moves) {
      const from = move.from;
      const to = move.to;
      currentBoard[to] = currentBoard[from];
      currentBoard[from] = null;
      if (move.type === "promotion") {
        currentBoard[to] = {
          type: move.piece as
            | "PAWN"
            | "ROOK"
            | "KNIGHT"
            | "BISHOP"
            | "QUEEN"
            | "KING",
          color: move.turn as "WHITE" | "BLACK",
        };
      }
    }

    return currentBoard;
  }

  async validateMove(board: ChessBoard, move: MakeMoveDTO): Promise<boolean> {
    const piece = board[move.from];
    if (!piece) return false;

    const tempBoard = { ...board };
    tempBoard[move.to] = tempBoard[move.from];
    tempBoard[move.from] = null;

    const movingColor = piece.color;

    const isCheck = this.isKingInCheck(tempBoard, movingColor);

    if (isCheck) {
      return false;
    }

    return this.switchCaseTypePiece(piece.type, move, board, piece.color);
  }

  switchCaseTypePiece(
    type: string,
    move: MakeMoveDTO,
    board: ChessBoard,
    color: string
  ): boolean {
    const isFirstMove = this.firstMovePawn(move.from, color);

    switch (type) {
      case "PAWN":
        return this.validatePawnMove(board, move, isFirstMove, color);
      case "KNIGHT":
        return this.validateKnightMove(board, move, color);
      case "BISHOP":
        return this.validateBishopMove(board, move, color);
      case "ROOK":
        return this.validateRookMove(board, move, color);
      case "QUEEN":
        return this.validateQueenMove(board, move, color);
      case "KING":
        return this.validateKingMove(board, move, color);
      default:
        return false;
    }
  }

  firstMovePawn(from: string, color: string): boolean {
    if (color === "WHITE") {
      return from[1] === "2";
    } else {
      return from[1] === "7";
    }
  }

  validatePawnMove(
    board: ChessBoard,
    move: MakeMoveDTO,
    isFirstMove: boolean,
    color: string
  ): boolean {
    const fromCol = this.COLUMNS.indexOf(move.from[0]);
    const fromRow = parseInt(move.from[1]);
    const toCol = this.COLUMNS.indexOf(move.to[0]);
    const toRow = parseInt(move.to[1]);

    const direction = color === "WHITE" ? 1 : -1;
    const targetPiece = board[move.to];

    if (fromCol === toCol && toRow === fromRow + direction && !targetPiece) {
      return true;
    }

    if (
      isFirstMove &&
      fromCol === toCol &&
      toRow === fromRow + 2 * direction &&
      !targetPiece
    ) {
      const intermediateSquare = `${move.from[0]}${fromRow + direction}`;
      return !board[intermediateSquare];
    }

    if (Math.abs(toCol - fromCol) === 1 && toRow === fromRow + direction) {
      return !!targetPiece && targetPiece.color !== color;
    }

    return false;
  }

  validateKnightMove(
    board: ChessBoard,
    move: MakeMoveDTO,
    color: string
  ): boolean {
    const fromCol = this.COLUMNS.indexOf(move.from[0]);
    const fromRow = parseInt(move.from[1]);
    const toCol = this.COLUMNS.indexOf(move.to[0]);
    const toRow = parseInt(move.to[1]);

    const targetPiece = board[move.to];
    if (targetPiece && targetPiece.color === color) return false;

    const colDiff = Math.abs(toCol - fromCol);
    const rowDiff = Math.abs(toRow - fromRow);

    return (colDiff === 2 && rowDiff === 1) || (colDiff === 1 && rowDiff === 2);
  }

  validateBishopMove(
    board: ChessBoard,
    move: MakeMoveDTO,
    color: string
  ): boolean {
    const fromCol = this.COLUMNS.indexOf(move.from[0]);
    const fromRow = parseInt(move.from[1]);
    const toCol = this.COLUMNS.indexOf(move.to[0]);
    const toRow = parseInt(move.to[1]);

    const colDiff = Math.abs(toCol - fromCol);
    const rowDiff = Math.abs(toRow - fromRow);

    if (colDiff !== rowDiff) return false;

    const colStep = toCol > fromCol ? 1 : -1;
    const rowStep = toRow > fromRow ? 1 : -1;

    for (let i = 1; i < colDiff; i++) {
      const square = `${this.COLUMNS[fromCol + i * colStep]}${fromRow + i * rowStep}`;
      if (board[square]) return false;
    }

    const targetPiece = board[move.to];
    return !targetPiece || targetPiece.color !== color;
  }

  validateRookMove(
    board: ChessBoard,
    move: MakeMoveDTO,
    color: string
  ): boolean {
    const fromCol = this.COLUMNS.indexOf(move.from[0]);
    const fromRow = parseInt(move.from[1]);
    const toCol = this.COLUMNS.indexOf(move.to[0]);
    const toRow = parseInt(move.to[1]);

    if (fromCol !== toCol && fromRow !== toRow) return false;

    const isVertical = fromCol === toCol;
    const start = isVertical
      ? Math.min(fromRow, toRow)
      : Math.min(fromCol, toCol);
    const end = isVertical
      ? Math.max(fromRow, toRow)
      : Math.max(fromCol, toCol);

    for (let i = start + 1; i < end; i++) {
      const square = isVertical
        ? `${move.from[0]}${i}`
        : `${this.COLUMNS[i]}${fromRow}`;
      if (board[square]) return false;
    }

    const targetPiece = board[move.to];
    return !targetPiece || targetPiece.color !== color;
  }

  validateQueenMove(
    board: ChessBoard,
    move: MakeMoveDTO,
    color: string
  ): boolean {
    return (
      this.validateBishopMove(board, move, color) ||
      this.validateRookMove(board, move, color)
    );
  }

  validateKingMove(
    board: ChessBoard,
    move: MakeMoveDTO,
    color: string
  ): boolean {
    const fromCol = this.COLUMNS.indexOf(move.from[0]);
    const fromRow = parseInt(move.from[1]);
    const toCol = this.COLUMNS.indexOf(move.to[0]);
    const toRow = parseInt(move.to[1]);

    const colDiff = Math.abs(toCol - fromCol);
    const rowDiff = Math.abs(toRow - fromRow);

    if (colDiff > 1 || rowDiff > 1) return false;

    const targetPiece = board[move.to];
    return !targetPiece || targetPiece.color !== color;
  }

  // Partie pour les suggestions
  switchCaseTypePieceSuggestion(
    type: string,
    from: string,
    board: ChessBoard,
    color: string
  ): String[] {
    switch (type) {
      case "PAWN":
        return this.suggestPawnMove(board, from, color);
      case "KNIGHT":
        return this.suggestKnightMove(board, from, color);
      case "BISHOP":
        return this.suggestBishopMove(board, from, color);
      case "ROOK":
        return this.suggestRookMove(board, from, color);
      case "QUEEN":
        return this.suggestQueenMove(board, from, color);
      case "KING":
        return this.suggestKingMove(board, from, color);
      default:
        return [];
    }
  }

  suggestPawnMove(board: ChessBoard, from: string, color: string): String[] {
    const suggestions: String[] = [];
    const fromCol = this.COLUMNS.indexOf(from[0]);
    const fromRow = parseInt(from[1]);
    const direction = color === "WHITE" ? 1 : -1;
    const isFirstMove =
      (color === "WHITE" && fromRow === 2) ||
      (color === "BLACK" && fromRow === 7);

    const oneStep = `${from[0]}${fromRow + direction}`;
    if (!board[oneStep]) {
      suggestions.push(oneStep);

      if (isFirstMove) {
        const twoStep = `${from[0]}${fromRow + 2 * direction}`;
        if (!board[twoStep] && !board[oneStep]) {
          suggestions.push(twoStep);
        }
      }
    }

    const diagonals = [fromCol - 1, fromCol + 1];
    for (const col of diagonals) {
      if (col >= 0 && col < 8) {
        const capture = `${this.COLUMNS[col]}${fromRow + direction}`;
        const targetPiece = board[capture];
        if (targetPiece && targetPiece.color !== color) {
          suggestions.push(capture);
        }
      }
    }

    return suggestions;
  }

  suggestKnightMove(board: ChessBoard, from: string, color: string): String[] {
    const suggestions: String[] = [];
    const fromCol = this.COLUMNS.indexOf(from[0]);
    const fromRow = parseInt(from[1]);

    const moves = [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1],
    ];

    for (const [colDiff, rowDiff] of moves) {
      const newCol = fromCol + colDiff;
      const newRow = fromRow + rowDiff;

      if (newCol >= 0 && newCol < 8 && newRow > 0 && newRow <= 8) {
        const target = `${this.COLUMNS[newCol]}${newRow}`;
        const targetPiece = board[target];
        if (!targetPiece || targetPiece.color !== color) {
          suggestions.push(target);
        }
      }
    }

    return suggestions;
  }

  suggestBishopMove(board: ChessBoard, from: string, color: string): String[] {
    const suggestions: String[] = [];
    const fromCol = this.COLUMNS.indexOf(from[0]);
    const fromRow = parseInt(from[1]);

    const directions = [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];

    for (const [colDir, rowDir] of directions) {
      let newCol = fromCol + colDir;
      let newRow = fromRow + rowDir;

      while (newCol >= 0 && newCol < 8 && newRow > 0 && newRow <= 8) {
        const target = `${this.COLUMNS[newCol]}${newRow}`;
        const targetPiece = board[target];

        if (!targetPiece) {
          suggestions.push(target);
        } else {
          if (targetPiece.color !== color) {
            suggestions.push(target);
          }
          break;
        }

        newCol += colDir;
        newRow += rowDir;
      }
    }

    return suggestions;
  }

  suggestRookMove(board: ChessBoard, from: string, color: string): String[] {
    const suggestions: String[] = [];
    const fromCol = this.COLUMNS.indexOf(from[0]);
    const fromRow = parseInt(from[1]);

    const directions = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];

    for (const [colDir, rowDir] of directions) {
      let newCol = fromCol + colDir;
      let newRow = fromRow + rowDir;

      while (newCol >= 0 && newCol < 8 && newRow > 0 && newRow <= 8) {
        const target = `${this.COLUMNS[newCol]}${newRow}`;
        const targetPiece = board[target];

        if (!targetPiece) {
          suggestions.push(target);
        } else {
          if (targetPiece.color !== color) {
            suggestions.push(target);
          }
          break;
        }

        newCol += colDir;
        newRow += rowDir;
      }
    }

    return suggestions;
  }

  suggestQueenMove(board: ChessBoard, from: string, color: string): String[] {
    return [
      ...this.suggestBishopMove(board, from, color),
      ...this.suggestRookMove(board, from, color),
    ];
  }

  suggestKingMove(board: ChessBoard, from: string, color: string): String[] {
    const suggestions: String[] = [];
    const fromCol = this.COLUMNS.indexOf(from[0]);
    const fromRow = parseInt(from[1]);

    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    for (const [colDir, rowDir] of directions) {
      const newCol = fromCol + colDir;
      const newRow = fromRow + rowDir;

      if (newCol >= 0 && newCol < 8 && newRow > 0 && newRow <= 8) {
        const target = `${this.COLUMNS[newCol]}${newRow}`;
        const targetPiece = board[target];
        if (!targetPiece || targetPiece.color !== color) {
          const tempBoard = { ...board };
          tempBoard[target] = tempBoard[from];
          tempBoard[from] = null;
          if (!this.isKingInCheck(tempBoard, color)) {
            suggestions.push(target);
          }
        }
      }
    }

    return suggestions;
  }

  isPromotion(board: ChessBoard): boolean {
    for (const col of this.COLUMNS) {
      const whitePos = `${col}8`;
      if (
        board[whitePos]?.type === "PAWN" &&
        board[whitePos]?.color === "WHITE"
      ) {
        return true;
      }
      const blackPos = `${col}1`;
      if (
        board[blackPos]?.type === "PAWN" &&
        board[blackPos]?.color === "BLACK"
      ) {
        return true;
      }
    }
    return false;
  }

  makePromotion(board: ChessBoard, newPieceType: string): ChessBoard {
    const newBoard = { ...board };
    let promotionSquare: string | null = null;
    let pieceColor: string | null = null;

    for (const col of this.COLUMNS) {
      const whitePos = `${col}8`;
      if (
        board[whitePos]?.type === "PAWN" &&
        board[whitePos]?.color === "WHITE"
      ) {
        promotionSquare = whitePos;
        pieceColor = "WHITE";
        break;
      }
      const blackPos = `${col}1`;
      if (
        board[blackPos]?.type === "PAWN" &&
        board[blackPos]?.color === "BLACK"
      ) {
        promotionSquare = blackPos;
        pieceColor = "BLACK";
        break;
      }
    }

    if (promotionSquare && pieceColor) {
      newBoard[promotionSquare] = {
        type: newPieceType as
          | "PAWN"
          | "ROOK"
          | "KNIGHT"
          | "BISHOP"
          | "QUEEN"
          | "KING",
        color: pieceColor as "WHITE" | "BLACK",
      };
    }

    return newBoard;
  }

  async getCurrentPlayer(game_id: number): Promise<ChessColor> {
    const lastMove = await Move.findOne({
      where: { game_id },
      order: [["id", "DESC"]],
    });

    return lastMove ? lastMove.turn : "BLACK";
  }

  async getNextPlayer(game_id: number): Promise<ChessColor> {
    const currentPlayer = await this.getCurrentPlayer(game_id);
    return currentPlayer === "WHITE" ? "BLACK" : "WHITE";
  }

  isKingInCheck(board: ChessBoard, playerColor: string): boolean {
    let kingPosition: string | null = null;
    for (const [square, piece] of Object.entries(board)) {
      if (piece && piece.type === "KING" && piece.color === playerColor) {
        kingPosition = square;
        break;
      }
    }

    if (!kingPosition) return false;

    for (const [square, piece] of Object.entries(board)) {
      if (piece && piece.color !== playerColor) {
        const move: MakeMoveDTO = {
          from: square,
          to: kingPosition,
        };
        if (this.switchCaseTypePiece(piece.type, move, board, piece.color)) {
          return true;
        }
      }
    }

    return false;
  }

  isCheckmate(board: ChessBoard, playerColor: string): boolean {
    if (!this.isKingInCheck(board, playerColor)) return false;

    for (const [fromSquare, piece] of Object.entries(board)) {
      if (!piece || piece.color !== playerColor) continue;

      for (const toCol of this.COLUMNS) {
        for (const toRow of this.ROWS) {
          const toSquare = `${toCol}${toRow}`;
          const move: MakeMoveDTO = { from: fromSquare, to: toSquare };

          if (this.switchCaseTypePiece(piece.type, move, board, piece.color)) {
            const tempBoard = { ...board };
            tempBoard[toSquare] = tempBoard[fromSquare];
            tempBoard[fromSquare] = null;

            if (!this.isKingInCheck(tempBoard, playerColor)) {
              return false;
            }
          }
        }
      }
    }

    return true;
  }

  async getFenFromBoard(board: ChessBoard, game_id: number): Promise<string> {
    const rows: string[] = [];
    for (let row = 8; row >= 1; row--) {
      let rowString = "";
      let emptyCount = 0;
      for (const col of this.COLUMNS) {
        const square = `${col}${row}`;
        const piece = board[square];
        if (piece) {
          if (emptyCount > 0) {
            rowString += emptyCount.toString();
            emptyCount = 0;
          }
          let pieceChar: string;
          switch (piece.type) {
            case "KING":
              pieceChar = "k";
              break;
            case "QUEEN":
              pieceChar = "q";
              break;
            case "ROOK":
              pieceChar = "r";
              break;
            case "BISHOP":
              pieceChar = "b";
              break;
            case "KNIGHT":
              pieceChar = "n";
              break;
            case "PAWN":
              pieceChar = "p";
              break;
            default:
              pieceChar = "";
              break;
          }
          rowString +=
            piece.color === "WHITE" ? pieceChar.toUpperCase() : pieceChar;
        } else {
          emptyCount++;
        }
      }
      if (emptyCount > 0) {
        rowString += emptyCount.toString();
      }
      rows.push(rowString);
    }
    const fen =
      rows.join("/") +
      " " +
      ((await this.getNextPlayer(game_id)) === "WHITE" ? "w" : "b") +
      " - - 0 1";
    return fen;
  }

  async makeMove(game_id: number, move: MakeMoveDTO, user: UserToken) {
    const game = await gameService.getGameUserMoves(game_id);
    if (!game) {
      throw new GameNotFoundError(game_id);
    }
    if (game.user_id != user.id) {
      throw new AccessDeniedError();
    }

    if (game.status == GameStatus.CHECKMATE) {
      throw new GameOverError();
    }

    const currentBoard = await this.currentMoveOfGame(game_id);
    const currentPlayer = await this.getNextPlayer(game_id);
    const piece = currentBoard[move.from];

    if (!piece || piece.color !== currentPlayer) {
      throw new InvalidTurnError();
    }

    const isCheckBefore = this.isKingInCheck(currentBoard, currentPlayer);

    if (await this.validateMove(currentBoard, move)) {
      const newBoard = { ...currentBoard };
      const targetPiece = newBoard[move.to];
      newBoard[move.to] = newBoard[move.from];
      newBoard[move.from] = null;

      let type = "normal";
      if (targetPiece) {
        type = "capture";
      }

      const nextPlayer = currentPlayer === "WHITE" ? "BLACK" : "WHITE";
      const isCheck = this.isKingInCheck(newBoard, nextPlayer);

      if (isCheckBefore && isCheck) {
        throw new CheckError();
      }

      const isCheckmate = this.isCheckmate(newBoard, nextPlayer);
      const isPromotion = this.isPromotion(newBoard);

      if (isCheckmate) {
        game.status = GameStatus.CHECKMATE;
        if (currentPlayer.toUpperCase() == game.opponentColor.toUpperCase()) {
          game.result = gameService.LOSER_POINTS;
        } else {
          game.result = gameService.WINNER_POINTS;
        }
        await game.save();
      } else if (isCheck) {
        game.status = GameStatus.CHECK;
        await game.save();
      } else {
        game.status = GameStatus.IN_PROGRESS;
        await game.save();
      }

      const moveCreate: MoveCreateDTO = {
        game_id: game_id,
        from: move.from,
        to: move.to,
        piece: piece.type,
        type: type,
        isCheck: isCheck,
        isCheckmate: isCheckmate,
        turn: currentPlayer,
      };

      const newMove = await this.createMove(moveCreate);

      const allMoves = await Move.findAll({
        where: { game_id },
        order: [["id", "ASC"]],
      });

      const fen = await this.getFenFromBoard(newBoard, game_id);
      game.moves.push(newMove);
      const playersInformations = await gameService.getPlayersInformations(
        game,
        user
      );

      const moveReturn: GameReturnDTO = {
        id: game_id.toString(),
        fen: fen,
        moves: allMoves.map((m) => ({
          from: m.from,
          to: m.to,
          piece: m.piece,
          color: m.turn,
        })),
        isCheck: isCheck,
        isCheckmate: isCheckmate,
        status: game.status,
        promotion: isPromotion ? piece.color : null,
        whitePlayer: playersInformations.whitePlayer,
        blackPlayer: playersInformations.blackPlayer,
      };

      return moveReturn;
    } else {
      throw new InvalidMoveError();
    }
  }

  async getState(game_id: number, user: UserToken): Promise<GameReturnDTO> {
    const game = await gameService.getGameUserMoves(game_id);
    if (!game) {
      throw new GameNotFoundError(game_id);
    }
    if (!game.isPublic && game.user_id != user.id) {
      throw new AccessDeniedError();
    }

    const currentBoard = await this.currentMoveOfGame(game_id);
    const currentPlayer = await this.getCurrentPlayer(game_id);
    const nextPlayer = await this.getNextPlayer(game_id);
    const isCheck = this.isKingInCheck(currentBoard, nextPlayer);
    const isCheckmate = this.isCheckmate(currentBoard, nextPlayer);
    const isPromotion = this.isPromotion(currentBoard);

    const allMoves = await Move.findAll({
      where: { game_id },
      order: [["id", "ASC"]],
    });

    const fen = await this.getFenFromBoard(currentBoard, game_id);
    const playersInformations = await gameService.getPlayersInformations(
      game,
      user
    );

    const moveReturn: GameReturnDTO = {
      id: game_id.toString(),
      fen: fen,
      moves: allMoves.map((m) => ({
        from: m.from,
        to: m.to,
        piece: m.piece,
        color: m.turn,
      })),
      isCheck: isCheck,
      isCheckmate: isCheckmate,
      status: game.status,
      promotion: isPromotion ? currentPlayer : null,
      whitePlayer: playersInformations.whitePlayer,
      blackPlayer: playersInformations.blackPlayer,
    };

    return moveReturn;
  }

  async getSuggestions(
    game_id: number,
    from: string,
    user: UserToken
  ): Promise<String[]> {
    const game = await gameService.getGameUserMoves(game_id);
    if (!game) {
      throw new GameNotFoundError(game_id);
    }
    if (game.user_id != user.id) {
      throw new AccessDeniedError();
    }
    const currentBoard = await this.currentMoveOfGame(game_id);
    const currentPlayer = await this.getNextPlayer(game_id);
    const piece = currentBoard[from];
    if (!piece || piece.color !== currentPlayer) {
      throw new InvalidTurnError();
    }

    return this.switchCaseTypePieceSuggestion(
      piece.type,
      from,
      currentBoard,
      currentPlayer
    );
  }

  async promotion(game_id: number, piece: ChessPiece, user: UserToken) {
    const game = await gameService.getGameUserMoves(game_id);
    if (!game) {
      throw new GameNotFoundError(game_id);
    }
    const currentBoard = await this.currentMoveOfGame(game_id);
    if (!this.isPromotion(currentBoard)) {
      throw new PromotionError("No pawn available for promotion");
    }

    const promotionBoard = this.makePromotion(currentBoard, piece.type);

    const currentPlayer = await this.getNextPlayer(game_id);
    const isCheck = this.isKingInCheck(currentBoard, currentPlayer);
    const isCheckmate = this.isCheckmate(currentBoard, currentPlayer);

    const allMoves = await Move.findAll({
      where: { game_id },
      order: [["id", "ASC"]],
    });

    const fen = await this.getFenFromBoard(promotionBoard, game_id);

    const lastMove = allMoves[allMoves.length - 1];
    lastMove.piece = piece.type;
    lastMove.type = "promotion";
    await lastMove.save();

    const playersInformations = await gameService.getPlayersInformations(
      game,
      user
    );

    const moveReturn: GameReturnDTO = {
      id: game_id.toString(),
      fen: fen,
      moves: allMoves.map((m) => ({
        from: m.from,
        to: m.to,
        piece: m.piece,
        color: m.turn,
      })),
      isCheck: isCheck,
      isCheckmate: isCheckmate,
      status: game.status,
      promotion: null,
      whitePlayer: playersInformations.whitePlayer,
      blackPlayer: playersInformations.blackPlayer,
    };

    return moveReturn;
  }

  async goto(
    game_id: number,
    index: number,
    user: UserToken
  ): Promise<GameReturnDTO> {
    const game = await gameService.getGameUserMoves(game_id, undefined, index);
    if (!game) {
      throw new GameNotFoundError(game_id);
    }

    const allMoves = await Move.findAll({
      where: { game_id },
      order: [["id", "ASC"]],
    });

    if (index < 0 || index > allMoves.length) {
      throw new InvalidMoveIndexError();
    }

    const movesUntilIndex = allMoves.slice(0, index);

    let currentBoard = { ...this.initialBoard };
    for (const move of movesUntilIndex) {
      currentBoard[move.to] = currentBoard[move.from];
      currentBoard[move.from] = null;

      if (move.type === "promotion") {
        currentBoard[move.to] = {
          type: move.piece as
            | "PAWN"
            | "ROOK"
            | "KNIGHT"
            | "BISHOP"
            | "QUEEN"
            | "KING",
          color: move.turn as "WHITE" | "BLACK",
        };
      }
    }

    const currentPlayer =
      index === 0 ? "WHITE" : movesUntilIndex[index - 1].turn;
    const nextPlayer = currentPlayer === "WHITE" ? "BLACK" : "WHITE";

    const isCheck = this.isKingInCheck(currentBoard, nextPlayer);
    const isCheckmate = this.isCheckmate(currentBoard, nextPlayer);
    const isPromotion = this.isPromotion(currentBoard);

    const fen = await this.getFenFromBoard(currentBoard, game_id);

    const playersInformations = await gameService.getPlayersInformations(
      game,
      user
    );

    const moveReturn: GameReturnDTO = {
      id: game_id.toString(),
      fen: fen,
      moves: allMoves.map((m) => ({
        from: m.from,
        to: m.to,
        piece: m.piece,
        color: m.turn,
      })),
      isCheck: isCheck,
      isCheckmate: isCheckmate,
      status: game.status,
      promotion: isPromotion ? currentPlayer : null,
      whitePlayer: playersInformations.whitePlayer,
      blackPlayer: playersInformations.blackPlayer,
    };

    return moveReturn;
  }

  async getCapturedPieces(moves: Move[]): Promise<{
    white: CapturedPiece[];
    black: CapturedPiece[];
  }> {
    let board = { ...this.initialBoard };
    const capturedPieces = {
      white: [] as CapturedPiece[],
      black: [] as CapturedPiece[],
    };
    if (!moves || moves.length === 0) {
      return capturedPieces;
    }

    for (const move of moves) {
      if (move.type === "capture") {
        const targetPiece = board[move.to];
        if (targetPiece) {
          if (targetPiece.color === "WHITE") {
            capturedPieces.black.push({
              type: targetPiece.type,
              color: targetPiece.color,
            });
          } else {
            capturedPieces.white.push({
              type: targetPiece.type,
              color: targetPiece.color,
            });
          }
        }
      }
      board[move.to] = board[move.from];
      board[move.from] = null;
      if (move.type === "promotion") {
        board[move.to] = {
          type: move.piece as
            | "PAWN"
            | "ROOK"
            | "KNIGHT"
            | "BISHOP"
            | "QUEEN"
            | "KING",
          color: move.turn as "WHITE" | "BLACK",
        };
      }
    }

    return capturedPieces;
  }
}

export default new MoveService();
