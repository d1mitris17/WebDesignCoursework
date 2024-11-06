// Wait for the document to be fully loaded
$(document).ready(function () {
    console.log("Frontend JavaScript loaded.");
  
    /**
     * Fetch and display cards (example for a dashboard or cards page)
     */
    async function loadCards() {
      try {
        const token = localStorage.getItem("token");
  
        if (!token) {
          alert("Please log in first.");
          window.location.href = "/login.html";
          return;
        }
  
        const cards = await $.ajax({
          url: `api/cards`,
          method: "GET",
          headers: { Authorization: `Bearer ${token}` }
        });
  
        // Display cards
        const cardList = $("#cardList");
        cardList.empty();
        cards.forEach((card) => {
          cardList.append(`<li>${card.name} - ${card.description}</li>`);
        });
      } catch (error) {
        console.error("Failed to load cards:", error);
        alert("Could not load cards.");
      }
    }
  
    // Call loadCards if on the dashboard page
    if (window.location.pathname === "/dashboard.html") {
      loadCards();
    }
  });