const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const token = req.cookies.token; // Access token from cookies

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.redirect("/"); // Redirect to login if token is invalid
      }
      req.user = decoded;
      next();
    });
  } else {
    return res.redirect("/");
  }
}

function restrictAuth(req, res, next) {
  const token = req.cookies.token;


  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        next();
      } else {
        return res.redirect("/homepage"); // Redirect to homepage if already logged in
      }
    });
  } else {
    next();
  }
}

module.exports = { requireAuth, restrictAuth };