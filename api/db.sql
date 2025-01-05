-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    public_profile BOOLEAN DEFAULT true,
    show_game_history BOOLEAN DEFAULT true
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    opponentName VARCHAR(50) NOT NULL,
    opponentColor VARCHAR(50) NOT NULL,
    isPublic BOOLEAN NOT NULL DEFAULT FALSE,
    result INT DEFAULT NULL,
    status ENUM(
        'in_progress',
        'checkmate',
        'stalemate',
        'draw',
        'surrender'
    ) NOT NULL DEFAULT 'in_progress',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create moves table
CREATE TABLE IF NOT EXISTS moves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id INT NOT NULL,
    piece VARCHAR(10) NOT NULL,
    `from` VARCHAR(5) NOT NULL,
    `to` VARCHAR(5) NOT NULL,
    `type` VARCHAR(255) DEFAULT 'normal',
    isCheck BOOLEAN DEFAULT FALSE,
    isCheckmate BOOLEAN DEFAULT FALSE,
    turn VARCHAR(25) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games (id) ON DELETE CASCADE
);

