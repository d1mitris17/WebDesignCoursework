$(document).ready(function () {
  let selectedCardId = null; // To track the card being deleted

  // Function to fetch cards
  function fetchCards() {
    $.ajax({
      url: `/api/cards/collections`,
      method: "GET",
      dataType: "json",
      success: function (cards) {
        displayCards(cards);
      },
      error: function () {
        $("#cardContainer").html("<p>Unable to load cards. Please try again later.</p>");
      },
    });
  }

  // Function to display cards
  function displayCards(cards) {
    const cardContainer = $("#cardContainer");
    cardContainer.empty();

    if (cards.length === 0) {
      cardContainer.html("<p>No cards available in this collection.</p>");
      return;
    }

    cards.forEach((card) => {
      const cardElement = $(`
        <div class="card">
          <button class="deleteButton" data-id="${card.id}" style="display: none;">&times;</button>
        <img src="${card.image_url || '../images//default-image.jpeg'}" alt="${card.name || 'Card'}" />
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

  // Show delete buttons
  $("#removeCard").on("click", function () {
    $(".deleteButton").fadeIn();
  });

  // Show confirmation modal
  $(document).on("click", ".deleteButton", function () {
    selectedCardId = $(this).data("id");
    $("#deleteCard").fadeIn();
  });

  // Cancel delete
  $("#no").on("click", function (event) {
    event.preventDefault();
    $("#deleteCard").fadeOut();
  });

  // Confirm delete
  $("#yes").on("click", function (event) {
    event.preventDefault();
    $("#deleteCard").fadeOut();

    // Call API to delete card
    $.ajax({
      url: `/api/cards/delete`,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ cardid: selectedCardId }),
      success: function () {
        alert(`Card deleted successfully!`);
        fetchCards(); // Reload cards
      },
      error: function () {
        alert(`Failed to delete the card. Please try again.`);
      },
    });
  });

  // Initial fetch
  fetchCards();
});
