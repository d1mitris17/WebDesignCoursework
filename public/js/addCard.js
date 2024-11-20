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

      cardElement.on("click", function (event) {
        if (!$(event.target).is(".addButton")) {
          showCardDetails(card);
        }
      });

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
    if ($(event.target).is("#addCardModal")) {
      $("#addCardModal").fadeOut(); // Hide the modal with a fade-out effect
    }

    if ($(event.target).is("#cardDetailsModal")) {
      $("#cardDetailsModal").fadeOut(function () {
        $(this).remove(); // Remove modal from DOM
      });
    }
  });

  // Event: Add card to user's collection
  $("#addCardForm").on("submit", function (event) {
    event.preventDefault();

    const cardId = $("#selectedCardId").val();
    const cardCondition = $("#cardCondition").val();
    const dateAcquired = $("#cardDateAcquired").val();
    const quantity = $("#cardQuantity").val();

    // Validate inputs
    if (!cardId || !cardCondition || !dateAcquired || quantity <= 0) {
      alert("Please fill out all fields correctly.");
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateAcquired)) {
      alert("Please provide a valid date in the format YYYY-MM-DD.");
      return;
    }

    $.ajax({
      url: "/api/cards/collection/add",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        cardId: cardId,
        quantity: quantity,
        condition: cardCondition,
        dateAcquired: dateAcquired,
      }),
      success: function (response) {
        alert("Card added successfully!");
        $("#addCardModal").fadeOut(); // Hide the modal
        // Optionally reset the form
        $("#addCardForm")[0].reset();
      },
      error: function (xhr) {
        const errorMessage = xhr.responseJSON?.message || "Failed to add card. Please try again.";
        alert(errorMessage);
      },
    });
  });

  function showCardDetails(card) {
    // Build modal content dynamically
    const modalContent = `
    <div class="modal" id="cardDetailsModal">
      <div class="modal-content" style="background-image: url('${card.image_url}'); background-size: cover; background-position: center;">
        <span class="close">&times;</span>
        <div class="modal-overlay">
          <h2>${card.name}</h2>
          <p><strong>Type:</strong> ${card.card_type}</p>
          <p><strong>Set:</strong> ${card.set_name}</p>
          <p><strong>Number:</strong> ${card.card_number}</p>
          <p><strong>Rarity:</strong> ${card.rarity}</p>
          <p><strong>Release Date:</strong> ${card.release_date || 'Unknown'}</p>
          <p><strong>Quantity:</strong> ${card.quantity || 'N/A'}</p>
          <p><strong>Condition:</strong> ${card.condition || 'N/A'}</p>
          <p><strong>Date Acquired:</strong> ${card.date_acquired || 'N/A'}</p>
          <p><strong>Attributes:</strong></p>
          <ul>
            ${card.attributes
        .map((attr) => `<li>${attr.attribute}: ${attr.value}</li>`)
        .join("")}
          </ul>
        </div>
      </div>
    </div>
  `;

    // Append modal to body and display
    $("body").append(modalContent);
    $("#cardDetailsModal").fadeIn();

    // Close modal
    $(".close").on("click", function () {
      $("#cardDetailsModal").fadeOut(function () {
        $(this).remove(); // Remove modal from DOM
      });
    });
  }
  // Initial load
  loadCards();
});
