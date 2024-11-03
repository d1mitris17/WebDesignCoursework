const jwt = require("jsonwebtoken");

const restrictAuth = (req, res, next) => {
  const token = req.cookies.token; // Assumes token is stored in cookies
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return res.redirect("/"); // Redirect to home page if the user is already logged in
    } catch (error) {
      // Invalid token; clear the token if needed or proceed
      res.clearCookie("token"); // Optional: Clear invalid token from cookies
    }
  }
  next(); // Continue to login or signup page if no valid token is present
};

const requireAuth = (req, res, next) => {
  const token = req.cookies.token; // Assumes token is stored in cookies
  if (!token) {
    return res.redirect("/log-in"); // Redirect to login if no token is found
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to request object
    next(); // Proceed to the requested page
  } catch (error) {
    res.clearCookie("token"); // Optional: Clear invalid token from cookies
    return res.status(401).redirect("/log-in"); // Redirect to login on invalid token
  }
};

module.exports = { restrictAuth, requireAuth };
