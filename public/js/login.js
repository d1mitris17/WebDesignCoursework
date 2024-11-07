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
      success: function (xhr) {
        alert("Login successful!");
        window.location.href = "/"; // Redirect to homepage after login
      },
      error: function (xhr) {
          $("#loginMessage").text(xhr.responseJSON.message).css("color", "red");
      },
    });
  });
});