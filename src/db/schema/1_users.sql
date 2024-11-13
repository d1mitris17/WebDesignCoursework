CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,        -- Unique identifier for each user
    username VARCHAR(50) NOT NULL UNIQUE,    -- Unique username for each user
    email VARCHAR(100) NOT NULL UNIQUE,       -- Unique email address for each user
    password VARCHAR(255) NOT NULL,           -- Hashed password for user authentication
    created_at TIMESTAMP,  -- Timestamp for account creation
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  -- Timestamp for last profile update
);