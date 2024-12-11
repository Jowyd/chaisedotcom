enum PieceType {
  PAWN = "p",
  KNIGHT = "n",
  BISHOP = "b",
  ROOK = "r",
  QUEEN = "q",
  KING = "k",
}

enum Color {
  WHITE = "white",
  BLACK = "black",
}

interface CastlingRights {
  whiteKingside: boolean;
  whiteQueenside: boolean;
  blackKingside: boolean;
  blackQueenside: boolean;
}

interface ChessPieceInterface {
  type: PieceType;
  color: Color;
  position: string;
}

class ChessPiece implements ChessPieceInterface {
  constructor(
    public type: PieceType,
    public color: Color,
    public position: string
  ) {}

  // Méthode pour créer une nouvelle pièce (utile pour la promotion)
  clone(): ChessPiece {
    return new ChessPiece(this.type, this.color, this.position);
  }
}

class ChessBoard {
  private board: { [key: string]: ChessPiece } = {};
  private activeColor: Color = Color.WHITE;
  private castlingRights: CastlingRights = {
    whiteKingside: true,
    whiteQueenside: true,
    blackKingside: true,
    blackQueenside: true,
  };
  private enPassantTarget: string | null = null;
  private halfmoveClock: number = 0;
  private fullmoveNumber: number = 1;

  constructor(
    fen: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  ) {
    this.parseFen(fen);
  }

  private parseFen(fen: string): void {
    const parts = fen.split(" ");
    if (parts.length !== 6) {
      throw new Error("Invalid FEN string");
    }

    // Reset board
    this.board = {};

    // Parse piece placement
    const rows = parts[0].split("/");
    rows.forEach((row, rowIndex) => {
      let fileIndex = 0;
      for (const char of row) {
        if (/\d/.test(char)) {
          fileIndex += parseInt(char);
        } else {
          const color = /[A-Z]/.test(char) ? Color.WHITE : Color.BLACK;
          const pieceType = this.getPieceType(char.toLowerCase());
          const position = `${String.fromCharCode(fileIndex + 97)}${8 - rowIndex}`;

          this.board[position] = new ChessPiece(pieceType, color, position);
          fileIndex++;
        }
      }
    });

    // Parse active color
    this.activeColor = parts[1] === "w" ? Color.WHITE : Color.BLACK;

    // Parse castling rights
    this.castlingRights = {
      whiteKingside: parts[2].includes("K"),
      whiteQueenside: parts[2].includes("Q"),
      blackKingside: parts[2].includes("k"),
      blackQueenside: parts[2].includes("q"),
    };

    // Parse en passant target
    this.enPassantTarget = parts[3] === "-" ? null : parts[3];

    // Parse move clocks
    this.halfmoveClock = parseInt(parts[4]);
    this.fullmoveNumber = parseInt(parts[5]);
  }

  private getPieceType(char: string): PieceType {
    switch (char) {
      case "p":
        return PieceType.PAWN;
      case "n":
        return PieceType.KNIGHT;
      case "b":
        return PieceType.BISHOP;
      case "r":
        return PieceType.ROOK;
      case "q":
        return PieceType.QUEEN;
      case "k":
        return PieceType.KING;
      default:
        throw new Error(`Invalid piece character: ${char}`);
    }
  }

  generateFen(): string {
    // Generate piece placement
    const boardRows: string[] = [];
    for (let row = 0; row < 8; row++) {
      let rowString = "";
      let emptyCount = 0;

      for (let file = 0; file < 8; file++) {
        const position = `${String.fromCharCode(file + 97)}${8 - row}`;

        if (this.board[position]) {
          // Add any preceding empty squares
          if (emptyCount > 0) {
            rowString += emptyCount;
            emptyCount = 0;
          }

          const piece = this.board[position];
          const pieceChar =
            piece.color === Color.WHITE ? piece.type.toUpperCase() : piece.type;
          rowString += pieceChar;
        } else {
          emptyCount++;
        }
      }

      // Add any trailing empty squares
      if (emptyCount > 0) {
        rowString += emptyCount;
      }

      boardRows.push(rowString);
    }

    // Construct FEN parts
    const pieceReplacement = boardRows.join("/");
    const activeColor = this.activeColor === Color.WHITE ? "w" : "b";

    // Castling rights
    const castlingRights =
      (this.castlingRights.whiteKingside ? "K" : "") +
        (this.castlingRights.whiteQueenside ? "Q" : "") +
        (this.castlingRights.blackKingside ? "k" : "") +
        (this.castlingRights.blackQueenside ? "q" : "") || "-";

    const enPassant = this.enPassantTarget || "-";

    return `${pieceReplacement} ${activeColor} ${castlingRights} ${enPassant} ${this.halfmoveClock} ${this.fullmoveNumber}`;
  }

  movePiece(
    fromSquare: string,
    toSquare: string,
    promotionType?: PieceType
  ): void {
    // Validate squares
    this.validateSquare(fromSquare);
    this.validateSquare(toSquare);

    // Check if piece exists on from_square
    const piece = this.board[fromSquare];
    if (!piece) {
      throw new Error("No piece on the starting square");
    }

    // Basic color turn check
    if (piece.color !== this.activeColor) {
      throw new Error("It's not this color's turn");
    }

    // Check for pawn promotion
    const isPromotion = this.isPawnPromotion(piece, toSquare);
    if (isPromotion && !promotionType) {
      throw new Error("Promotion requires specifying a piece type");
    }

    // Remove piece from original square and place on new square
    delete this.board[fromSquare];

    // If a piece exists on the destination square, it is captured
    if (this.board[toSquare]) {
      delete this.board[toSquare];
    }

    // Handle promotion
    if (isPromotion) {
      if (
        !promotionType ||
        promotionType === PieceType.KING ||
        promotionType === PieceType.PAWN
      ) {
        throw new Error("Invalid promotion piece type");
      }

      // Create a new piece with the promotion type
      const promotedPiece = new ChessPiece(
        promotionType,
        piece.color,
        toSquare
      );
      this.board[toSquare] = promotedPiece;
    } else {
      // Update piece position
      piece.position = toSquare;
      this.board[toSquare] = piece;
    }

    // Update game state
    this.activeColor =
      this.activeColor === Color.WHITE ? Color.BLACK : Color.WHITE;

    // Increment fullmove number (only when white moves)
    if (this.activeColor === Color.BLACK) {
      this.fullmoveNumber++;
    }

    this.halfmoveClock++;
  }

  private isPawnPromotion(piece: ChessPiece, toSquare: string): boolean {
    if (piece.type !== PieceType.PAWN) return false;

    // Check if pawn reaches the opposite end of the board
    const rank = toSquare[1];
    return (
      (piece.color === Color.WHITE && rank === "8") ||
      (piece.color === Color.BLACK && rank === "1")
    );
  }

  private validateSquare(square: string): void {
    if (!/^[a-h][1-8]$/.test(square)) {
      throw new Error("Invalid square");
    }
  }

  getPieceAt(square: string): ChessPiece | undefined {
    return this.board[square];
  }
}

interface MoveRecord {
  from: string;
  to: string;
  preMovefen: string;
  postMoveFen: string;
  promotionType?: PieceType;
}

class ChessGame {
  private board: ChessBoard;
  private moveHistory: MoveRecord[] = [];

  constructor(
    initialFen: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  ) {
    this.board = new ChessBoard(initialFen);
  }

  makeMove(
    fromSquare: string,
    toSquare: string,
    promotionType?: PieceType
  ): void {
    // Store current FEN before the move
    const preMovefen = this.board.generateFen();

    // Make the move
    this.board.movePiece(fromSquare, toSquare, promotionType);

    // Store move and resulting FEN
    const moveRecord: MoveRecord = {
      from: fromSquare,
      to: toSquare,
      preMovefen,
      postMoveFen: this.board.generateFen(),
    };

    // Add promotion type if applicable
    if (promotionType) {
      moveRecord.promotionType = promotionType;
    }

    this.moveHistory.push(moveRecord);
  }

  getMoveHistory(): MoveRecord[] {
    return this.moveHistory;
  }

  getCurrentFen(): string {
    return this.board.generateFen();
  }
}

// Exemple d'utilisation
function main() {
  // Créer un nouveau jeu d'échecs
  const game = new ChessGame();

  // Afficher la position initiale
  console.log("Position initiale (FEN):", game.getCurrentFen());

  // Déplacements de pions et promotion
  game.makeMove("e2", "e4");
  game.makeMove("e7", "e5");

  // Exemple de promotion de pion (blanc promu en dame sur la ligne 8)
  game.makeMove("e4", "e5");
  game.makeMove("e5", "e6");
  game.makeMove("e6", "f7");

  // Promotion d'un pion en dame (ou autre pièce)
  game.makeMove("f7", "g8", PieceType.QUEEN);

  console.log("Après promotion (FEN):", game.getCurrentFen());

  // Afficher l'historique des mouvements
  console.log("\nHistorique des mouvements:");
  game.getMoveHistory().forEach((move) => {
    console.log(`De ${move.from} à ${move.to}`);
    if (move.promotionType) {
      console.log(`Promotion en ${move.promotionType}`);
    }
    console.log(`Avant le mouvement (FEN): ${move.preMovefen}`);
    console.log(`Après le mouvement (FEN): ${move.postMoveFen}\n`);
  });
}

// Décommenter pour exécuter l'exemple
// main();

export { ChessGame, ChessBoard, ChessPiece, PieceType, Color };
