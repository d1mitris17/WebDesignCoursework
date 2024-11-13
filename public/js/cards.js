$(document).ready(function () {
  console.log("Loaded cards JS");
  // Function to fetch cards for a specific collection
  function fetchCards() {
    $.ajax({
      url: `/api/cards/collections`, // Adjust collectionId as needed
      method: "GET",
      dataType: "json",
      success: function (cards) {
        displayCards(cards);
      },
      error: function (xhr, status, error) {
        console.error("Error fetching cards:", error);
        $("#cardContainer").html("<p>Unable to load cards. Please try again later.</p>");
      }
    });
  }

  // Function to display the fetched cards
  function displayCards(cards) {
    const cardContainer = $("#cardContainer");
    cardContainer.empty(); // Clear any existing content

    // Check if there are any cards to display
    if (cards.length === 0) {
      cardContainer.html("<p>No cards available in this collection.</p>");
      return;
    }

    // Iterate through each card and create HTML elements
    cards.forEach(card => {
      const cardElement = $(`
        <div class="card">
          <img src="${card.image_url}" alt="${card.name}" />
          <h2>${card.name}</h2>
          <p><strong>Type:</strong> ${card.card_type}</p>
          <p><strong>Set:</strong> ${card.set_name}</p>
          <p><strong>Number:</strong> ${card.card_number}</p>
          <p><strong>Rarity:</strong> ${card.rarity}</p>
          <p><strong>Release Date:</strong> ${card.release_date}</p>
        </div>
      `);

      cardContainer.append(cardElement);
    });
  }

  fetchCards();
});

