$(document).ready(function () {
  let isPasswordVisible = false;

  // Fetch user data on page load
  function fetchUserData() {
    $.ajax({
      url: "/api/auth/me",
      method: "GET",
      success: function (data) {
        $("#username").val(data.username);
        $("#email").val(data.email);
        $("#password").val("********"); // Placeholder for password
      },
      error: function () {
        alert("Failed to fetch user details. Please try again later.");
      },
    });
  }

  // Toggle password visibility
  $("#togglePassword").on("click", function () {
    isPasswordVisible = !isPasswordVisible;
    const passwordField = $("#password");
    passwordField.attr("type", isPasswordVisible ? "text" : "password");
    $(this).text(isPasswordVisible ? "Hide" : "Show");
  });

  // Enable editing for user details
  $("#editDetailsButton").on("click", function () {
    $("#username, #email").prop("disabled", false);
    $("#saveDetailsButton, #cancelDetailsButton").show();
    $(this).hide();
  });

  // Cancel editing for user details
  $("#cancelDetailsButton").on("click", function () {
    $("#username, #email").prop("disabled", true);
    $("#saveDetailsButton, #cancelDetailsButton").hide();
    $("#editDetailsButton").show();
    fetchUserData(); // Reset fields to original values
  });

  // Save updated user details
  $("#userDetailsForm").on("submit", function (event) {
    event.preventDefault();
    const updatedUsername = $("#username").val();
    const updatedEmail = $("#email").val();

    $.ajax({
      url: "/api/auth/me",
      method: "PUT",
      contentType: "application/json",
      data: JSON.stringify({
        username: updatedUsername,
        email: updatedEmail,
      }),
      success: function () {
        alert("User details updated successfully!");
        $("#username, #email").prop("disabled", true);
        $("#saveDetailsButton, #cancelDetailsButton").hide();
        $("#editDetailsButton").show();
      },
      error: function () {
        alert("Failed to update user details. Please try again.");
      },
    });
  });

  // Enable editing for password
  $("#editPasswordButton").on("click", function () {
    $("#password").prop("disabled", false).val(""); // Clear password field
    $("#savePasswordButton, #cancelPasswordButton").show();
    $("#togglePassword").show();
    $(this).hide();
  });

  // Cancel editing for password
  $("#cancelPasswordButton").on("click", function () {
    $("#password").prop("disabled", true).val("********"); // Reset to placeholder
    $("#savePasswordButton, #cancelPasswordButton").hide();
    $("#editPasswordButton").show();
    $("#togglePassword").hide();
  });

  // Save updated password
  $("#passwordForm").on("submit", function (event) {
    event.preventDefault();
    const newPassword = $("#password").val();

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    $.ajax({
      url: "/api/auth/me",
      method: "PUT",
      contentType: "application/json",
      data: JSON.stringify({
        password: newPassword,
      }),
      success: function () {
        alert("Password updated successfully!");
        $("#password").prop("disabled", true).val("********");
        $("#savePasswordButton, #cancelPasswordButton").hide();
        $("#editPasswordButton").show();
      },
      error: function () {
        alert("Failed to update password. Please try again.");
      },
    });
  });

  // Initial fetch
  fetchUserData();
});
