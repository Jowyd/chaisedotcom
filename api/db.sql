-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    whitePlayerName VARCHAR(50) NOT NULL,
    blackPlayerName VARCHAR(50) NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    status ENUM(
        'in_progress',
        'checkmate',
        'stalemate',
        'draw',
        'surrender'
    ) NOT NULL DEFAULT 'in_progress',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create moves table
CREATE TABLE IF NOT EXISTS moves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id INT NOT NULL,
    piece VARCHAR(10) NOT NULL,
    from_pos VARCHAR(5) NOT NULL,
    to_pos VARCHAR(5) NOT NULL,
    turn INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games (id)
);

-- Insert test users
INSERT INTO
    users (username, password)
VALUES (
        'john_doe',
        '$2b$10$xJwK3GUNnxJ3Hl5Qz8Rq9O5X5Z5Y5Z5Y5Z5Y5Z5Y5Z5Y5Z5Y5Z'
    ),
    (
        'alice_smith',
        '$2b$10$aB1C2D3E4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9U0V1W2X3Y4Z'
    ),
    (
        'bob_jones',
        '$2b$10$1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y'
    );

-- Insert test games using existing usernames
INSERT INTO
    games (
        user_id,
        whitePlayerName,
        blackPlayerName,
        is_public,
        status
    )
VALUES (
        1,
        'root',
        'magnus_carlsen',
        true,
        'in_progress'
    ),
    (
        1,
        'jowyd',
        'root',
        false,
        'checkmate'
    ),
    (
        3,
        'bob_jones',
        'bobby_fischer',
        true,
        'draw'
    );

-- Insert test moves
INSERT INTO
    moves (
        game_id,
        piece,
        from_pos,
        to_pos,
        turn
    )
VALUES (1, 'P', 'e2', 'e4', 1),
    (1, 'P', 'e7', 'e5', 2),
    (1, 'N', 'g1', 'f3', 3),
    (2, 'P', 'd2', 'd4', 1),
    (2, 'N', 'b8', 'c6', 2),
    (2, 'B', 'c1', 'f4', 3),
    (3, 'P', 'e2', 'e4', 1),
    (3, 'P', 'c7', 'c5', 2),
    (3, 'N', 'b1', 'c3', 3);

ALTER TABLE games
CHANGE COLUMN is_public isPublic BOOLEAN NOT NULL DEFAULT FALSE;