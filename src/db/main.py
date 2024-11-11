import csv
import mysql.connector # type: ignore

# Database connection
def connect_to_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="card_collector"
    )

# Function to read and parse the file
def readFile(file_path):
    # Open the CSV file
    with open(file_path, mode="r", encoding="utf-8") as file:
        csv_reader = csv.reader(file)
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
                card_name = row[4]  # Card Name
                set_name = row[1]  # Set
                card_number = row[2]  # Card Number
                rarity = row[6]  # Rarity / Variant
                card_type = "Pokémon"  # Adjust this if you want to use different types

                # Insert into cards table
                card_values = (card_name, card_type, set_name, card_number, rarity)
                cursor.execute(insert_card_query, card_values)
                card_id = cursor.lastrowid  # Retrieve the last inserted card ID

                # Insert attributes if they exist
                pokedex_id = row[3]  # PokéDex ID
                card_element_type = row[5]  # Elemental Type
                if pokedex_id:
                    attribute_values = (card_id, 'PokéDex ID', pokedex_id)
                    cursor.execute(insert_attribute_query, attribute_values)
                if card_element_type:
                    attribute_values2 = (card_id, 'Type', card_element_type)
                    cursor.execute(insert_attribute_query, attribute_values2)

                print(f"Inserted card {i}: {card_name}")

            except Exception as e:
                print(f"Error processing row {i}: {e}")

        # Commit the changes to the database
        db_connection.commit()

        # Close the cursor and database connection
        cursor.close()
        db_connection.close()
        print("Done")

# Call the function with the path to your CSV file
readFile('ALL English Pokémon Cards - Sheet1.csv')
