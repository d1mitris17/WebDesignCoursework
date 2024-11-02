// Wait for the document to be fully loaded
$(document).ready(function () {
    console.log("Frontend JavaScript loaded.");
  
    // Base URL for API requests
    const API_BASE_URL = "/api";
  
    /**
     * Login function
     */
    $("#loginForm").on("submit", async function (e) {
      e.preventDefault();
  
      const username = $("#loginUsername").val();
      const password = $("#loginPassword").val();
  
      try {
        const response = await $.ajax({
          url: `${API_BASE_URL}/auth/login`,
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({ username, password })
        });
        
        // Store the token (for simplicity, localStorage is used here)
        localStorage.setItem("token", response.token);
        alert("Login successful!");
        window.location.href = "/dashboard.html"; // Redirect to dashboard after login
      } catch (error) {
        console.error("Login failed:", error);
        alert("Invalid credentials, please try again.");
      }
    });
  
    /**
     * Signup function
     */
    $("#signupForm").on("submit", async function (e) {
      e.preventDefault();
  
      const username = $("#signupUsername").val();
      const password = $("#signupPassword").val();
  
      try {
        await $.ajax({
          url: `${API_BASE_URL}/auth/signup`,
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({ username, password })
        });
  
        alert("Signup successful! Please login.");
        window.location.href = "/login.html";
      } catch (error) {
        console.error("Signup failed:", error);
        alert("Signup failed, please try again.");
      }
    });
  
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
          url: `${API_BASE_URL}/cards`,
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