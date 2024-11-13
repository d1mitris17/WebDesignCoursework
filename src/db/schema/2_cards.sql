CREATE TABLE IF NOT EXISTS cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    card_type VARCHAR(50) NOT NULL,
    set_name VARCHAR(100) NOT NULL,
    card_number VARCHAR(20),
    rarity VARCHAR(50),
    release_date DATE,
    image_url VARCHAR(255),
    INDEX (name),
    INDEX (card_type),
    INDEX (set_name)
);