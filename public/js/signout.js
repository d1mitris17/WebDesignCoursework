$(document).ready(function () {
    console.log("Frontend JavaScript loaded.");
  
    $("#signOutButton").on("click", async function (e) {
        e.preventDefault();
  
        const username = $("#loginUsername").val();
        const password = $("#loginPassword").val();
  
        $.ajax({
        url: `api/auth/logout`,
        method: "POST",
        success: function (xhr) {
          alert("Log out successful!");
          window.location.href = "/log-in"; // Redirect to homepage after login
        },
        error: function (xhr) {
            alert("Can not log user out");
        },
      });
    });
  });