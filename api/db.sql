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
  player_one_id INT NOT NULL,
  player_two_id INT,
  status ENUM('ongoing', 'finished') NOT NULL DEFAULT 'ongoing',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_one_id) REFERENCES users(id),
  FOREIGN KEY (player_two_id) REFERENCES users(id)
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
  FOREIGN KEY (game_id) REFERENCES games(id)
);