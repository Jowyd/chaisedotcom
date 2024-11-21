import { Op } from "sequelize";
import { Game } from "../models/game.model";
import Move from "../models/move.model";

interface ChessPiece {
  type: "PAWN" | "ROOK" | "KNIGHT" | "BISHOP" | "QUEEN" | "KING";
  color: "WHITE" | "BLACK";
  hasMoved?: boolean;
}

interface ChessBoard {
  [square: string]: ChessPiece | null;
}

interface MoveOptions {
  isPromotion?: boolean;
  promotionPiece?: "QUEEN" | "ROOK" | "KNIGHT" | "BISHOP";
  isCastle?: "KINGSIDE" | "QUEENSIDE" | null;
  isEnPassant?: boolean;
}

export class MoveService {
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

  private validatePawnMove(
    board: ChessBoard,
    from: string,
    to: string,
    color: "WHITE" | "BLACK"
  ): boolean {
    const [fromCol, fromRow] = from.split("");
    const [toCol, toRow] = to.split("");
    const direction = color === "WHITE" ? 1 : -1;

    const rowDiff = parseInt(toRow) - parseInt(fromRow);
    if (fromCol === toCol) {
      if (rowDiff === direction && !board[to]) return true;

      if (
        (color === "WHITE" && fromRow === "2" && rowDiff === 2) ||
        (color === "BLACK" && fromRow === "7" && rowDiff === -2)
      ) {
        const middleSquare = `${fromCol}${parseInt(fromRow) + direction}`;
        return !board[middleSquare] && !board[to];
      }
    }

    if (
      Math.abs(this.COLUMNS.indexOf(fromCol) - this.COLUMNS.indexOf(toCol)) ===
        1 &&
      rowDiff === direction
    ) {
      const targetPiece = board[to];
      return targetPiece !== null && targetPiece.color !== color;
    }

    return false;
  }

  private validateRookMove(
    board: ChessBoard,
    from: string,
    to: string
  ): boolean {
    const [fromCol, fromRow] = from.split("");
    const [toCol, toRow] = to.split("");

    if (fromCol !== toCol && fromRow !== toRow) return false;

    const direction =
      fromCol === toCol
        ? parseInt(toRow) > parseInt(fromRow)
          ? 1
          : -1
        : this.COLUMNS.indexOf(toCol) > this.COLUMNS.indexOf(fromCol)
          ? 1
          : -1;

    const isVertical = fromCol === toCol;
    let current = isVertical
      ? `${fromCol}${parseInt(fromRow) + direction}`
      : `${this.COLUMNS[this.COLUMNS.indexOf(fromCol) + direction]}${fromRow}`;

    while (current !== to) {
      if (board[current]) return false;
      current = isVertical
        ? `${current[0]}${parseInt(current[1]) + direction}`
        : `${this.COLUMNS[this.COLUMNS.indexOf(current[0]) + direction]}${current[1]}`;
    }

    return true;
  }

  private validateKnightMove(from: string, to: string): boolean {
    const [fromCol, fromRow] = from.split("");
    const [toCol, toRow] = to.split("");

    const colDiff = Math.abs(
      this.COLUMNS.indexOf(fromCol) - this.COLUMNS.indexOf(toCol)
    );
    const rowDiff = Math.abs(parseInt(fromRow) - parseInt(toRow));

    return (colDiff === 1 && rowDiff === 2) || (colDiff === 2 && rowDiff === 1);
  }

  private validateBishopMove(
    board: ChessBoard,
    from: string,
    to: string
  ): boolean {
    const [fromCol, fromRow] = from.split("");
    const [toCol, toRow] = to.split("");

    const colDiff = Math.abs(
      this.COLUMNS.indexOf(fromCol) - this.COLUMNS.indexOf(toCol)
    );
    const rowDiff = Math.abs(parseInt(fromRow) - parseInt(toRow));

    if (colDiff !== rowDiff) return false;

    const colDirection =
      this.COLUMNS.indexOf(toCol) > this.COLUMNS.indexOf(fromCol) ? 1 : -1;
    const rowDirection = parseInt(toRow) > parseInt(fromRow) ? 1 : -1;

    let currentCol = this.COLUMNS[this.COLUMNS.indexOf(fromCol) + colDirection];
    let currentRow = (parseInt(fromRow) + rowDirection).toString();

    while (`${currentCol}${currentRow}` !== to) {
      if (board[`${currentCol}${currentRow}`]) return false;
      currentCol =
        this.COLUMNS[this.COLUMNS.indexOf(currentCol) + colDirection];
      currentRow = (parseInt(currentRow) + rowDirection).toString();
    }

    return true;
  }

  private validateQueenMove(
    board: ChessBoard,
    from: string,
    to: string
  ): boolean {
    return (
      this.validateRookMove(board, from, to) ||
      this.validateBishopMove(board, from, to)
    );
  }

  private validateKingMove(from: string, to: string): boolean {
    const [fromCol, fromRow] = from.split("");
    const [toCol, toRow] = to.split("");

    const colDiff = Math.abs(
      this.COLUMNS.indexOf(fromCol) - this.COLUMNS.indexOf(toCol)
    );
    const rowDiff = Math.abs(parseInt(fromRow) - parseInt(toRow));

    return colDiff <= 1 && rowDiff <= 1;
  }

  async reconstructGameState(gameId: number): Promise<{
    board: ChessBoard;
    moves: Move[];
  }> {
    const moves = await Move.findAll({
      where: { gameId },
      order: [["createdAt", "ASC"]],
    });

    let board = { ...this.initialBoard };

    for (const move of moves) {
      board[move.toSquare] = board[move.fromSquare];
      board[move.fromSquare] = null;
    }

    return { board, moves };
  }

  private getNextPlayerColor(board: ChessBoard): "WHITE" | "BLACK" {
    const whitePieces = Object.values(board).filter(
      (p) => p?.color === "WHITE"
    );
    const blackPieces = Object.values(board).filter(
      (p) => p?.color === "BLACK"
    );

    return whitePieces.length !== blackPieces.length ? "WHITE" : "BLACK";
  }

  async getGameReplay(gameId: number): Promise<Move[]> {
    return Move.findAll({
      where: { gameId },
      order: [["createdAt", "ASC"]],
    });
  }

  validateMove(
    board: ChessBoard,
    from: string,
    to: string,
    currentPlayerColor: "WHITE" | "BLACK",
    options: MoveOptions = {}
  ): boolean {
    const piece = board[from];

    if (!piece || piece.color !== currentPlayerColor) {
      return false;
    }

    // Vérification des mouvements spéciaux
    if (options.isCastle) {
      return this.validateCastle(
        board,
        from,
        to,
        currentPlayerColor,
        options.isCastle
      );
    }

    if (options.isEnPassant) {
      return this.validateEnPassant(board, from, to, currentPlayerColor);
    }

    // Validation standard du mouvement
    const baseValidation = this.baseValidateMove(board, from, to, piece);

    // Validation de promotion
    if (options.isPromotion) {
      return (
        baseValidation && this.validatePromotion(from, to, currentPlayerColor)
      );
    }

    // Vérification finale qu'un mouvement ne met pas le roi en échec
    if (baseValidation) {
      const newBoard = this.simulateMove(board, from, to);
      return !this.isKingInCheck(newBoard, currentPlayerColor);
    }

    return false;
  }

  // Validation de base du mouvement sans considération des échecs
  private baseValidateMove(
    board: ChessBoard,
    from: string,
    to: string,
    piece: ChessPiece
  ): boolean {
    switch (piece.type) {
      case "PAWN":
        return this.validatePawnMove(board, from, to, piece.color);
      case "ROOK":
        return this.validateRookMove(board, from, to);
      case "KNIGHT":
        return this.validateKnightMove(from, to);
      case "BISHOP":
        return this.validateBishopMove(board, from, to);
      case "QUEEN":
        return this.validateQueenMove(board, from, to);
      case "KING":
        return this.validateKingMove(from, to);
      default:
        return false;
    }
  }

  // Validation du roque
  private validateCastle(
    board: ChessBoard,
    kingFrom: string,
    kingTo: string,
    color: "WHITE" | "BLACK",
    castleSide: "KINGSIDE" | "QUEENSIDE"
  ): boolean {
    const isWhite = color === "WHITE";
    const rank = isWhite ? "1" : "8";

    const kingStartCol = "e";
    const kingSideRookCol = "h";
    const queenSideRookCol = "a";

    const kingStartSquare = `${kingStartCol}${rank}`;
    const king = board[kingStartSquare];

    if (!king || king.hasMoved) return false;

    if (castleSide === "KINGSIDE") {
      const rookSquare = `${kingSideRookCol}${rank}`;
      const rook = board[rookSquare];

      // Vérifier les cases entre le roi et la tour
      const intermediateCols = ["f", "g"];
      for (const col of intermediateCols) {
        if (board[`${col}${rank}`]) return false;
      }

      return (
        !rook?.hasMoved &&
        !this.isSquareUnderAttack(board, kingStartSquare, color)
      );
    } else {
      const rookSquare = `${queenSideRookCol}${rank}`;
      const rook = board[rookSquare];

      // Vérifier les cases entre le roi et la tour
      const intermediateCols = ["b", "c", "d"];
      for (const col of intermediateCols) {
        if (board[`${col}${rank}`]) return false;
      }

      return (
        !rook?.hasMoved &&
        !this.isSquareUnderAttack(board, kingStartSquare, color)
      );
    }
  }

  // Validation de la prise en passant
  private validateEnPassant(
    board: ChessBoard,
    from: string,
    to: string,
    color: "WHITE" | "BLACK"
  ): boolean {
    const [fromCol, fromRow] = from.split("");
    const [toCol, toRow] = to.split("");
    const direction = color === "WHITE" ? 1 : -1;

    // Vérifier que le mouvement est diagonal et sur la bonne rangée
    const expectedRow = color === "WHITE" ? "5" : "4";
    if (fromRow !== expectedRow) return false;

    // Vérifier que le mouvement est diagonal d'une case
    if (
      Math.abs(this.COLUMNS.indexOf(fromCol) - this.COLUMNS.indexOf(toCol)) !==
        1 ||
      parseInt(toRow) !== parseInt(fromRow) + direction
    ) {
      return false;
    }

    // Vérifier la présence d'un pion adverse ayant fait un double mouvement
    const pawnSquare = `${toCol}${fromRow}`;
    const pawn = board[pawnSquare];

    return !!pawn && pawn.type === "PAWN" && pawn.color !== color;
  }

  // Validation de promotion
  private validatePromotion(
    from: string,
    to: string,
    color: "WHITE" | "BLACK"
  ): boolean {
    const [, fromRow] = from.split("");
    const [, toRow] = to.split("");

    return (
      (color === "WHITE" && toRow === "8") ||
      (color === "BLACK" && toRow === "1")
    );
  }

  // Vérification si le roi est en échec
  isKingInCheck(board: ChessBoard, color: "WHITE" | "BLACK"): boolean {
    // Trouver la position du roi
    const kingSquare = this.findKingSquare(board, color);
    if (!kingSquare) return false;

    // Vérifier si le roi est attaqué par n'importe quelle pièce adverse
    return this.isSquareUnderAttack(board, kingSquare, color);
  }

  // Trouver la position du roi
  private findKingSquare(
    board: ChessBoard,
    color: "WHITE" | "BLACK"
  ): string | null {
    for (const [square, piece] of Object.entries(board)) {
      if (piece?.type === "KING" && piece.color === color) {
        return square;
      }
    }
    return null;
  }

  // Vérifier si une case est sous attaque
  private isSquareUnderAttack(
    board: ChessBoard,
    square: string,
    defendingColor: "WHITE" | "BLACK"
  ): boolean {
    const attackingColor = defendingColor === "WHITE" ? "BLACK" : "WHITE";

    for (const [fromSquare, piece] of Object.entries(board)) {
      if (piece?.color === attackingColor) {
        if (this.baseValidateMove(board, fromSquare, square, piece)) {
          return true;
        }
      }
    }

    return false;
  }

  // Simuler un mouvement sans modifier le plateau réel
  private simulateMove(
    board: ChessBoard,
    from: string,
    to: string
  ): ChessBoard {
    const newBoard = { ...board };
    newBoard[to] = newBoard[from];
    newBoard[from] = null;
    return newBoard;
  }

  // Méthode d'enregistrement de mouvement enrichie
  async recordMove(
    gameId: number,
    fromSquare: string,
    toSquare: string,
    piece: ChessPiece,
    options: MoveOptions = {}
  ): Promise<Move> {
    const game = await Game.findByPk(gameId);
    if (!game) throw new Error("Partie non trouvée");

    const { board } = await this.reconstructGameState(gameId);

    const currentPlayerColor = this.getNextPlayerColor(board);
    const isValidMove = this.validateMove(
      board,
      fromSquare,
      toSquare,
      currentPlayerColor,
      options
    );

    if (!isValidMove) {
      throw new Error("Mouvement invalide");
    }

    // Gestion des mouvements spéciaux
    if (options.isCastle) {
      // Logique de déplacement de la tour lors du roque
      const rank = currentPlayerColor === "WHITE" ? "1" : "8";
      const rookFromCol = options.isCastle === "KINGSIDE" ? "h" : "a";
      const rookToCol = options.isCastle === "KINGSIDE" ? "f" : "d";
      const rookFromSquare = `${rookFromCol}${rank}`;
      const rookToSquare = `${rookToCol}${rank}`;

      await Move.create({
        gameId,
        fromSquare: rookFromSquare,
        toSquare: rookToSquare,
        piece: "ROOK",
      });
    }

    if (options.isEnPassant) {
      // Supprimer le pion capturé en passant
      const capturedPawnSquare = `${toSquare[0]}${fromSquare[1]}`;
      await Move.create({
        gameId,
        fromSquare: capturedPawnSquare,
        toSquare: capturedPawnSquare,
        piece: "PAWN",
        isCapture: true,
      });
    }

    if (options.isPromotion) {
      // Promotion du pion
      options.promotionPiece = options.promotionPiece || "QUEEN";
    }

    const move = await Move.create({
      gameId,
      fromSquare,
      toSquare,
      piece: options.isPromotion ? options.promotionPiece : piece.type,
    });

    // Vérifier l'état final (échec et mat ou pat)
    const newBoard = this.simulateMove(board, fromSquare, toSquare);
    const opponentColor = currentPlayerColor === "WHITE" ? "BLACK" : "WHITE";

    if (this.isCheckmate(newBoard, opponentColor)) {
      await game.update({ status: "CHECKMATE" });
    } else if (this.isStalemate(newBoard, opponentColor)) {
      await game.update({ status: "DRAW" });
    }

    return move;
  }

  // Vérification d'échec et mat
  private isCheckmate(board: ChessBoard, color: "WHITE" | "BLACK"): boolean {
    // Vérifier si le roi est en échec
    if (!this.isKingInCheck(board, color)) return false;

    // Vérifier tous les mouvements possibles
    for (const [fromSquare, piece] of Object.entries(board)) {
      if (piece?.color === color) {
        for (const toSquare of this.getAllPossibleSquares()) {
          if (this.validateMove(board, fromSquare, toSquare, color)) {
            return false; // Un mouvement est possible
          }
        }
      }
    }

    return true;
  }

  // Vérification de pat
  private isStalemate(board: ChessBoard, color: "WHITE" | "BLACK"): boolean {
    // Vérifier que le roi n'est PAS en échec
    if (this.isKingInCheck(board, color)) return false;

    // Vérifier tous les mouvements possibles
    for (const [fromSquare, piece] of Object.entries(board)) {
      if (piece?.color === color) {
        for (const toSquare of this.getAllPossibleSquares()) {
          if (this.validateMove(board, fromSquare, toSquare, color)) {
            return false; // Un mouvement est possible
          }
        }
      }
    }

    return true;
  }

  // Générer toutes les cases possibles
  private getAllPossibleSquares(): string[] {
    const squares: string[] = [];
    for (const col of this.COLUMNS) {
      for (const row of this.ROWS) {
        squares.push(`${col}${row}`);
      }
    }
    return squares;
  }
}

export default new MoveService();
