$(document).ready(function () {
  let offset = 0;
  const limit = 25;
  let searchTerm = "";

  // Get card type from the URL query parameter (default to "all")
  const urlParams = new URLSearchParams(window.location.search);
  let selectedCardType = urlParams.get("card_type") || "all";

  // Function to load cards with current filters
  function loadCards() {
    const queryParams = new URLSearchParams({
      limit: limit,
      offset: offset,
    });

    // Add search term if provided
    if (searchTerm) {
      queryParams.append("search", searchTerm);
    }

    // Add card type filter if not "all"
    if (selectedCardType !== "all") {
      queryParams.append("card_type", selectedCardType);
    }

    $.ajax({
      url: `/api/cards?${queryParams.toString()}`,
      method: "GET",
      dataType: "json",
      success: function (cards) {
        if (offset === 0) {
          $("#allCardsContainer").empty(); // Clear previous results if starting fresh
        }

        // Render the fetched cards
        displayCards(cards);

        // Show or hide the "Load More" button
        if (cards.length === 0) {
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

  // Function to render cards
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
          <button class="addButton" data-id="${card.id}">Add</button>
        </div>
      `);

      cardContainer.append(cardElement);
    });
  }

  // Event: Search bar input
  $("#searchBar").on("input", function () {
    searchTerm = $(this).val();
    offset = 0; // Reset offset for new search
    loadCards();
  });

  // Event: Filter by card type
  $("#cardTypeFilter").on("change", function () {
    selectedCardType = $(this).val();
    offset = 0; // Reset offset for new filter
    loadCards();
  });

  // Event: Load more cards
  $("#loadMoreButton").on("click", function () {
    offset += limit; // Increment offset for pagination
    loadCards();
  });

  // Event: Show modal when "Add" button is clicked
  $(document).on("click", ".addButton", function () {
    const cardId = $(this).data("id");
    $("#selectedCardId").val(cardId); // Store the selected card ID in the hidden input
    $("#addCardModal").fadeIn(); // Show the modal with a fade-in effect
  });

  // Event: Hide modal when clicking outside or on close button
  $(window).on("click", function (event) {
    if ($(event.target).is("#addCardModal") || $(event.target).is("#closeModalButton")) {
      $("#addCardModal").fadeOut(); // Hide the modal with a fade-out effect
    }
  });

  // Initial load
  loadCards();
});