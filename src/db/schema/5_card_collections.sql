CREATE TABLE IF NOT EXISTS card_collections (
    user_id INT,
    card_id INT,
    quantity INT DEFAULT 1,
    `condition` VARCHAR(50),
    date_acquired DATE,
    PRIMARY KEY (user_id, card_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);