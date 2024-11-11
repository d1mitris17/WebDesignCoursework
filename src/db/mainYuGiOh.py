import csv
import mysql.connector # type: ignore
import os

# Database connection
def connect_to_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="card_collector"
    )

# Function to read and parse each CSV file
def read_yugioh_file(file_path, set_name):
    # Open the CSV file with `$` as the delimiter
    with open(file_path, mode="r", encoding="utf-8") as file:
        csv_reader = csv.reader(file, delimiter='$')
        next(csv_reader)  # Skip the header

        # Establish DB connection
        db_connection = connect_to_db()
        cursor = db_connection.cursor()

        # Prepare SQL insert statements
        insert_card_query = """
        INSERT INTO cards (name, card_type, set_name, card_number, rarity)
        VALUES (%s, %s, %s, %s, %s)
        """
        insert_attribute_query = """
        INSERT INTO card_attributes (card_id, attribute, value)
        VALUES (%s, %s, %s)
        """

        # Iterate through each row and insert data
        for i, row in enumerate(csv_reader, start=1):
            try:
                # Map columns to respective values
                passcode = row[0]
                card_name = row[1]
                status = row[2]
                attribute = row[3]
                type_ = row[4]
                level = row[9]
                attack = row[10]
                defense = row[11]
                card_text = row[16]

                # Insert into cards table
                card_values = (card_name, "Yu-Gi-Oh", set_name, passcode, status)
                cursor.execute(insert_card_query, card_values)
                card_id = cursor.lastrowid  # Retrieve the last inserted card ID

                # Insert additional attributes
                if attribute:
                    attribute_values = (card_id, 'Attribute', attribute)
                    cursor.execute(insert_attribute_query, attribute_values)
                if type_:
                    attribute_values = (card_id, 'Type', type_)
                    cursor.execute(insert_attribute_query, attribute_values)
                if level:
                    attribute_values = (card_id, 'Level', level)
                    cursor.execute(insert_attribute_query, attribute_values)
                if attack:
                    attribute_values = (card_id, 'Attack', attack)
                    cursor.execute(insert_attribute_query, attribute_values)
                if defense:
                    attribute_values = (card_id, 'Defense', defense)
                    cursor.execute(insert_attribute_query, attribute_values)
                if card_text:
                    attribute_values = (card_id, 'Card Text', card_text)
                    cursor.execute(insert_attribute_query, attribute_values)

                print(f"Inserted card {i}: {card_name}")

            except Exception as e:
                print(f"Error processing row {i}: {e}")

        # Commit the changes to the database
        db_connection.commit()

        # Close the cursor and database connection
        cursor.close()
        db_connection.close()
        print(f"Finished processing {file_path}")

# Function to process all CSV files in a directory
def process_directory(directory_path):
    for filename in os.listdir(directory_path):
        if filename.endswith(".csv"):
            file_path = os.path.join(directory_path, filename)
            set_name = os.path.splitext(filename)[0]  # Use filename (without extension) as set_name
            print(f"Processing file: {filename} (Set Name: {set_name})")
            read_yugioh_file(file_path, set_name)
    print("All files processed")

# Call the function with the path to your directory
process_directory('en/')
