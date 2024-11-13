$(document).ready(function () {
  console.log("Frontend JavaScript loaded.");

  $("#loginForm").on("submit", async function (e) {
      e.preventDefault();

      const username = $("#loginUsername").val();
      const password = $("#loginPassword").val();

      $.ajax({
      url: `api/auth/login`,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ username, password }),
      success: function () {
        alert("Login successful!");

        loadUserDetails();

        window.location.href = "/"; // Redirect to homepage after login
      },
      error: function (xhr) {
          $("#loginMessage").text(xhr.responseJSON.message).css("color", "red");
      },
    });
  });

  function loadUserDetails() {
    $.ajax({
      url: "api/auth/me",
      method: "GET",
      success: function (user) {
        console.log("Logged-in user:", user)

        sessionStorage.setItem("userId", user.id);
        sessionStorage.setItem("username", user.username);
        
      },
      error: function () {
        console.error("Faled to get information");
      },
    });
  }
});
