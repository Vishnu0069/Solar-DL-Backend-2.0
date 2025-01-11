// const jwt = require("jsonwebtoken");

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
  console.log("Headers:", req.headers); // Debugging

  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(403).send("Authorization header is required.");
  }

  // Trim the header to remove extra spaces
  const token = authHeader.replace("Bearer", "").trim();
  if (!token) {
    return res.status(403).send("Token is missing.");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT verification error:", err);
      return res.status(401).send("Invalid token.");
    }
    req.user = decoded; // Attach user data from token to request
    next();
  });
}

module.exports = verifyToken;
