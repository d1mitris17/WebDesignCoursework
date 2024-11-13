## db

Our database schema will reside here

Where possible, example/test data should be included when creating tables,
this means we can all work independently with some premade test data.

# Users Table
```
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,        -- Unique identifier for each user
    username VARCHAR(50) NOT NULL UNIQUE,    -- Unique username for each user
    email VARCHAR(100) NOT NULL UNIQUE,       -- Unique email address for each user
    password VARCHAR(255) NOT NULL,           -- Hashed password for user authentication
    created_at TIMESTAMP,  -- Timestamp for account creation
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  -- Timestamp for last profile update
);

-- Test data for users table
INSERT INTO users (username, email, password) VALUES
    ('testuser1', 'testuser1@example.com', 'hashedpassword1'),
    ('testuser2', 'testuser2@example.com', 'hashedpassword2');
```

## -- Cards table
```
CREATE TABLE cards (
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
```

## Card Attributes table
```
-- 2. card_attributes table
CREATE TABLE card_attributes (
    card_id INT,
    attribute VARCHAR(50) NOT NULL,
    value VARCHAR(100),
    PRIMARY KEY (card_id, attribute),
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);
```

## Card Collections Table
```
-- 3. card_collections table
CREATE TABLE card_collections (
    user_id INT,
    card_id INT,
    quantity INT DEFAULT 1,
    `condition` VARCHAR(50),
    date_acquired DATE,
    PRIMARY KEY (user_id, card_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES cards(id)
);
```

## Card Types
```
CREATE TABLE card_types (
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) UNIQUE NOT NULL
);
```
