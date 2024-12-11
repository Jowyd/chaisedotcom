import { Op } from "sequelize";
import { Game } from "../models/game.model";
import Move from "../models/move.model";
import { ChessMove } from "../interfaces/chess.interface";
import { ChessPiece, ChessBoard } from "../interfaces/chess.interface";
import { MakeMoveDTO, MoveCreateDTO } from "../dto/move.dto";
import { MoveReturnDTO } from "../dto/move.dto";

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


  async getInitialBoard(game: Game): Promise<MoveReturnDTO> {
    const fen = await this.getFenFromBoard(this.initialBoard, game.id);

    const moveReturn: MoveReturnDTO = {
      id: game.id.toString(),
      fen: fen,
      moves: [
      ],
      isCheck: false,
      isCheckmate: false,
      status: game.status,
      whitePlayer: {
        username: game.whitePlayerName,
      },
      blackPlayer: {
        username: game.blackPlayerName,
      },
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
    let currentBoard = {...this.initialBoard};
    const moves = await Move.findAll({
      where: { game_id },
      order: [['id', 'ASC']]
    });

    for (const move of moves) {
      const from = move.from;
      const to = move.to;
      currentBoard[to] = currentBoard[from];
      currentBoard[from] = null;
    }

    return currentBoard;
  }

  async validateMove(board: ChessBoard, move: MakeMoveDTO): Promise<Boolean> {
    const piece = board[move.from];
    if (!piece) return false;
    
    return this.switchCaseTypePiece(piece.type, move, board, piece.color);
  }

  switchCaseTypePiece(type: string, move: MakeMoveDTO, board: ChessBoard, color: string): boolean {
    const isFirstMove = this.firstMovePawn(move.from, color);
    
    switch(type) {
      case 'PAWN':
        return this.validatePawnMove(board, move, isFirstMove, color);
      case 'KNIGHT':
        return this.validateKnightMove(board, move, color);
      case 'BISHOP':
        return this.validateBishopMove(board, move, color);
      case 'ROOK':
        return this.validateRookMove(board, move, color);
      case 'QUEEN':
        return this.validateQueenMove(board, move, color);
      case 'KING':
        return this.validateKingMove(board, move, color);
      default:
        return false;
    }
  }

  firstMovePawn(from: string, color: string): boolean {
    if (color === 'WHITE') {
      return from[1] === '2';
    } else {
      return from[1] === '7';
    }
  }

  validatePawnMove(board: ChessBoard, move: MakeMoveDTO, isFirstMove: boolean, color: string): boolean {
    const fromCol = this.COLUMNS.indexOf(move.from[0]);
    const fromRow = parseInt(move.from[1]);
    const toCol = this.COLUMNS.indexOf(move.to[0]);
    const toRow = parseInt(move.to[1]);
    
    const direction = color === 'WHITE' ? 1 : -1;
    const targetPiece = board[move.to];

    // Mouvement standard d'une case
    if (fromCol === toCol && toRow === fromRow + direction && !targetPiece) {
      return true;
    }

    // Premier mouvement de deux cases
    if (isFirstMove && fromCol === toCol && toRow === fromRow + (2 * direction) && !targetPiece) {
      const intermediateSquare = `${move.from[0]}${fromRow + direction}`;
      return !board[intermediateSquare];
    }

    // Prise en diagonale
    if (Math.abs(toCol - fromCol) === 1 && toRow === fromRow + direction) {
      return targetPiece !== null && targetPiece.color !== color;
    }

    return false;
  }

  validateKnightMove(board: ChessBoard, move: MakeMoveDTO, color: string): boolean {
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

  validateBishopMove(board: ChessBoard, move: MakeMoveDTO, color: string): boolean {
    const fromCol = this.COLUMNS.indexOf(move.from[0]);
    const fromRow = parseInt(move.from[1]);
    const toCol = this.COLUMNS.indexOf(move.to[0]);
    const toRow = parseInt(move.to[1]);
    
    const colDiff = Math.abs(toCol - fromCol);
    const rowDiff = Math.abs(toRow - fromRow);

    if (colDiff !== rowDiff) return false;

    const colStep = toCol > fromCol ? 1 : -1;
    const rowStep = toRow > fromRow ? 1 : -1;

    // Vérifier le chemin
    for (let i = 1; i < colDiff; i++) {
      const square = `${this.COLUMNS[fromCol + (i * colStep)]}${fromRow + (i * rowStep)}`;
      if (board[square]) return false;
    }

    const targetPiece = board[move.to];
    return !targetPiece || targetPiece.color !== color;
  }

  validateRookMove(board: ChessBoard, move: MakeMoveDTO, color: string): boolean {
    const fromCol = this.COLUMNS.indexOf(move.from[0]);
    const fromRow = parseInt(move.from[1]);
    const toCol = this.COLUMNS.indexOf(move.to[0]);
    const toRow = parseInt(move.to[1]);

    if (fromCol !== toCol && fromRow !== toRow) return false;

    const isVertical = fromCol === toCol;
    const start = isVertical ? Math.min(fromRow, toRow) : Math.min(fromCol, toCol);
    const end = isVertical ? Math.max(fromRow, toRow) : Math.max(fromCol, toCol);

    for (let i = start + 1; i < end; i++) {
      const square = isVertical ? 
        `${move.from[0]}${i}` : 
        `${this.COLUMNS[i]}${fromRow}`;
      if (board[square]) return false;
    }

    const targetPiece = board[move.to];
    return !targetPiece || targetPiece.color !== color;
  }

  validateQueenMove(board: ChessBoard, move: MakeMoveDTO, color: string): boolean {
    return this.validateBishopMove(board, move, color) || this.validateRookMove(board, move, color);
  }

  validateKingMove(board: ChessBoard, move: MakeMoveDTO, color: string): boolean {
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

  async getCurrentPlayer(game_id: number): Promise<string> {
    const lastMove = await Move.findOne({
      where: { game_id },
      order: [['id', 'DESC']]
    });

    return lastMove ? (lastMove.turn === 'WHITE' ? 'BLACK' : 'WHITE') : 'WHITE';
  }

  async getNextPlayer(game_id: number): Promise<string> {
    const currentPlayer = await this.getCurrentPlayer(game_id);
    return currentPlayer === 'WHITE' ? 'BLACK' : 'WHITE';
  }

  isKingInCheck(board: ChessBoard, playerColor: string): boolean {
    // Trouver la position du roi
    let kingPosition: string | null = null;
    for (const [square, piece] of Object.entries(board)) {
      if (piece && piece.type === 'KING' && piece.color === playerColor) {
        kingPosition = square;
        break;
      }
    }

    if (!kingPosition) return false;

    // Vérifier si une pièce adverse peut atteindre le roi
    for (const [square, piece] of Object.entries(board)) {
      if (piece && piece.color !== playerColor) {
        const move: MakeMoveDTO = {
          from: square,
          to: kingPosition
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

    // Pour chaque pièce du joueur
    for (const [fromSquare, piece] of Object.entries(board)) {
      if (!piece || piece.color !== playerColor) continue;

      // Pour chaque case possible
      for (const toCol of this.COLUMNS) {
        for (const toRow of this.ROWS) {
          const toSquare = `${toCol}${toRow}`;
          const move: MakeMoveDTO = { from: fromSquare, to: toSquare };

          // Si le mouvement est valide
          if (this.switchCaseTypePiece(piece.type, move, board, piece.color)) {
            // Simuler le mouvement
            const tempBoard = {...board};
            tempBoard[toSquare] = tempBoard[fromSquare];
            tempBoard[fromSquare] = null;

            // Si ce mouvement sort de l'échec
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
          const pieceChar = piece.type.charAt(0);
          rowString += piece.color === 'WHITE' ? pieceChar.toUpperCase() : pieceChar.toLowerCase();
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
      //(this.getNextPlayerColor(board) === "WHITE" ? "w" : "b") +
      " - - 0 1";
    return fen;
  }


  async makeMove(game_id: number, move: MakeMoveDTO) {
    const game = await Game.findByPk(game_id);
    if (!game) {
      throw new Error("Game not found");
    }

    const currentBoard = await this.currentMoveOfGame(game_id);
    const currentPlayer = await this.getCurrentPlayer(game_id);
    const piece = currentBoard[move.from];

    // Vérifier si c'est la bonne pièce du bon joueur
    if (!piece || piece.color !== currentPlayer) {
      throw new Error("403: Not your turn or piece");
    }

    if (await this.validateMove(currentBoard, move)) {
      // Appliquer le mouvement
      const newBoard = {...currentBoard};
      const targetPiece = newBoard[move.to];
      newBoard[move.to] = newBoard[move.from];
      newBoard[move.from] = null;

      // Déterminer le type de mouvement
      let type = 'normal';
      if (targetPiece) {
        type = 'capture';
      }

      // Vérifier l'état du jeu après le mouvement
      const nextPlayer = currentPlayer === 'WHITE' ? 'BLACK' : 'WHITE';
      const isCheck = this.isKingInCheck(newBoard, nextPlayer);
      const isCheckmate = this.isCheckmate(newBoard, nextPlayer);

      if (isCheckmate) {
        game.status = "checkmate";
        game.winner = currentPlayer;
        await game.save();
      } else if (isCheck) {
        game.status = "checkmate"; //TODO : check
        await game.save();
      }

      // Créer le mouvement dans la base de données
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
      
      await this.createMove(moveCreate);
      
      // Récupérer tous les mouvements de la partie
      const allMoves = await Move.findAll({
        where: { game_id },
        order: [['id', 'ASC']]
      });

      const fen = await this.getFenFromBoard(newBoard, game_id);

      // Préparer la réponse
      const moveReturn: MoveReturnDTO = {
        id: game_id.toString(),
        fen: fen,
        moves: allMoves.map(m => ({
          from: m.from,
          to: m.to,
          piece: m.piece,
          color: m.turn
        })),
        isCheck: isCheck,
        isCheckmate: isCheckmate,
        status: game.status,
        whitePlayer: {
          username: game.whitePlayerName,
        },
        blackPlayer: {
          username: game.blackPlayerName,
        },
      };

      return moveReturn;
    } else {
      throw new Error("403: Invalid move");
    }
  }


  async getState(game_id: number): Promise<MoveReturnDTO> {
    const game = await Game.findByPk(game_id);
    if (!game) {
      throw new Error("Game not found");
    }

    const currentBoard = await this.currentMoveOfGame(game_id);
    const currentPlayer = await this.getCurrentPlayer(game_id);
    const isCheck = this.isKingInCheck(currentBoard, currentPlayer);
    const isCheckmate = this.isCheckmate(currentBoard, currentPlayer);

    const allMoves = await Move.findAll({
      where: { game_id },
      order: [['id', 'ASC']]
    });

    const fen = await this.getFenFromBoard(currentBoard, game_id);

    // Préparer la réponse
    const moveReturn: MoveReturnDTO = {
      id: game_id.toString(),
      fen: fen,
      moves: allMoves.map(m => ({
        from: m.from,
        to: m.to,
        piece: m.piece,
        color: m.turn
      })),
      isCheck: isCheck,
      isCheckmate: isCheckmate,
      status: game.status,
      whitePlayer: {
        username: game.whitePlayerName,
      },
      blackPlayer: {
        username: game.blackPlayerName,
      },
    };

    return moveReturn;
  }
}

export default new MoveService();
