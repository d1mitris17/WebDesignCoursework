$(document).ready(function () {
  let offset = 0;
  const limit = 25;
  let searchTerm = "";

  // Function to load cards with optional search
  function loadCards() {
    $.ajax({
      url: `/api/cards?limit=${limit}&offset=${offset}&search=${encodeURIComponent(searchTerm)}`,
      method: "GET",
      dataType: "json",
      success: function (cards) {
        if (offset === 0) $("#allCardsContainer").empty(); // Clear previous results if starting fresh
        displayCards(cards);
        offset += limit;

        // Show or hide the "Load More" button based on the results count
        if (cards.length == 0) {
          console.log("No more cards to load.");
          $("#loadMoreButton").hide();
        } else {
          $("#loadMoreButton").show();
        }
      },
      error: function () {
        $("#allCardsContainer").html("<p>Failed to load cards.</p>");
      },
    });
  }

  // Function to display the fetched cards
  function displayCards(cards) {
    const cardContainer = $("#allCardsContainer");

    cards.forEach((card) => {
      const cardElement = $(`
        <div class="card">
          <h2>${card.name}</h2>
          <p><strong>Type:</strong> ${card.card_type}</p>
          <p><strong>Set:</strong> ${card.set_name}</p>
          <p><strong>Number:</strong> ${card.card_number}</p>
          <p><strong>Rarity:</strong> ${card.rarity}</p>
          <p><strong>Release Date:</strong> ${card.release_date || 'Unknown'}</p>
          <button class="addButton" data-id="${card.id}">Add</button> <!-- Add button for each card -->
        </div>
      `);

      cardContainer.append(cardElement);
    });
  }

  // Load more button click event
  $("#loadMoreButton").on("click", function () {
    loadCards();
  });

  // Search functionality
  $("#searchBar").on("input", function () {
    searchTerm = $(this).val();
    offset = 0; // Reset offset to start fresh for new search term
    loadCards(); // Call loadCards with new search term
  });

  // Show the add card modal with form when "Add" button is clicked
  $(document).on("click", ".addButton", function () {
    const cardId = $(this).data("id");
    console.log("button clicked on: ", cardId);
    $("#selectedCardId").val(cardId); // Store the selected card ID in the hidden input
    $("#addCardModal").show(); // Display the modal
  });

  // Submit the form to add card to collection
  $("#addCardForm").on("submit", function (e) {
    e.preventDefault();

    const cardId = $("#selectedCardId").val();
    const condition = $("#cardCondition").val();
    const dateAcquired = $("#cardDateAcquired").val();
    const quantity = $("#cardQuantity").val();

    $.ajax({
      url: `/api/cards/collections/${cardId}`,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ condition, date_acquired: dateAcquired, quantity }),
      success: function () {
        alert("Card added to your collection!");
        $("#addCardModal").hide();
      },
      error: function () {
        alert("Failed to add card to collection.");
      }
    });
  });

  // Close modal on background click
  $(window).on("click", function (event) {
    if ($(event.target).is("#addCardModal")) {
      $("#addCardModal").hide();
    }
  });

  // Initial load
  loadCards();
});
