$(document).ready(function () {
  console.log("Frontend JavaScript loaded.");

  $("#signupForm").submit(function (event) {
      event.preventDefault(); // Prevent form from submitting the traditional way

      const username = $("#username").val();
      const email = $("#email").val();
      const password = $("#password").val();

      $.ajax({
      url: "api/auth/signup",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ username, email, password }),
      success: function (xhr) {
          $("#signupMessage").text(xhr.message).css("color", "green");
          window.location.href = "/"; // Redirect to homepage after login
      },
      error: function (xhr) {
          $("#signupMessage").text(xhr.responseJSON.message).css("color", "red");
      },
      });
  });
});