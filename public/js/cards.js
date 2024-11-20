$(document).ready(function () {
  let selectedCardId = null; // To track the card being deleted
  let deleteMode = false; // To track if delete mode is enabled

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
          <button class="deleteCardButton" data-id="${card.id}" style="display: none;">&times;</button>
          <h2>${card.name}</h2>
          <p><strong>Type:</strong> ${card.card_type}</p>
          <p><strong>Set:</strong> ${card.set_name}</p>
          <p><strong>Number:</strong> ${card.card_number}</p>
          <p><strong>Rarity:</strong> ${card.rarity}</p>
          <p><strong>Release Date:</strong> ${card.release_date}</p>
        </div>
      `);

      // Add click event to show details or handle delete
      cardElement.on("click", function () {
        if (!deleteMode) {
          showCardDetails(card); // Pass the full card object
        }
      });

      // Append card element
      cardContainer.append(cardElement);
    });
  }

  // Enable delete mode and show delete buttons
  $("#removeCard").on("click", function () {
    deleteMode = true;
    $(".deleteCardButton").fadeIn(); // Show delete buttons
  });

    // Event: Hide modal when clicking outside or on close button
    $(window).on("click", function (event) {
      if ($(event.target).is("#cardDetailsModal")) {
        $("#cardDetailsModal").fadeOut(function () {
          $(this).remove(); // Remove modal from DOM
        });
      }
    });

  // Show confirmation modal for delete
  $(document).on("click", ".deleteCardButton", function (event) {
    event.stopPropagation(); // Prevent triggering the card click event
    selectedCardId = $(this).data("id");
    $("#deleteCard").fadeIn();
  });

  // Cancel delete
  $("#no").on("click", function (event) {
    event.preventDefault();
    deleteMode = false; // Exit delete mode
    $("#deleteCard").fadeOut();
    $(".deleteCardButton").fadeOut(); // Hide delete buttons
  });

  // Confirm delete
  $("#yes").on("click", function (event) {
    event.preventDefault();
    $("#deleteCard").fadeOut();
    $(".deleteCardButton").fadeOut(); // Hide delete buttons
    deleteMode = false; // Exit delete mode

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

  function showCardDetails(card) {
    // Populate modal with card details
    const modalContent = `
      <div class="modal" id="cardDetailsModal">
        <div class="modal-content">
          <h2>${card.name}</h2>
          <p><strong>Type:</strong> ${card.card_type}</p>
          <p><strong>Set:</strong> ${card.set_name}</p>
          <p><strong>Number:</strong> ${card.card_number}</p>
          <p><strong>Rarity:</strong> ${card.rarity}</p>
          <p><strong>Release Date:</strong> ${card.release_date}</p>
          <p><strong>Quantity:</strong> ${card.quantity}</p>
          <p><strong>Condition:</strong> ${card.condition}</p>
          <p><strong>Date Acquired:</strong> ${card.date_acquired}</p>
          <h4>Attributes:</h4>
          <ul>
            ${card.attributes
        .map((attr) => `<li>${attr.attribute}: ${attr.value}</li>`)
        .join("")}
          </ul>
        </div>
      </div>
    `;

    // Append modal to body and show it
    $("body").append(modalContent);
    $("#cardDetailsModal").fadeIn();

    // Close the modal
    $(".close").on("click", function () {
      $("#cardDetailsModal").fadeOut(function () {
        $(this).remove(); // Remove modal from DOM
      });
    });
  }

  // Initial fetch
  fetchCards();
});
