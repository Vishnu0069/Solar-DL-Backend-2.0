//const jwt = require("jsonwebtoken");

// // Middleware to verify JWT token
// function verifyToken(req, res, next) {
//   const token = req.headers["authorization"];
//   if (!token) {
//     return res.status(403).send("Token is required.");
//   }

//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(401).send("Invalid token.");
//     }
//     req.user = decoded; // Attach user data from token to request
//     next(); // Proceed to the next middleware or route handler
//   });
// }

// module.exports = verifyToken;

const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).send("Token is required.");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send("Invalid token.");
    }
    req.user = decoded; // Attach user data from token to request
    next(); // Proceed to the next middleware or route handler
  });
}

module.exports = verifyToken;
