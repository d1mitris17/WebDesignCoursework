CREATE TABLE IF NOT EXISTS card_attributes (
    card_id INT,
    attribute VARCHAR(50) NOT NULL,
    value VARCHAR(100),
    PRIMARY KEY (card_id, attribute),
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);