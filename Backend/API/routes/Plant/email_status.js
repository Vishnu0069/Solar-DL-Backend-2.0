// const express = require("express");
// const pool = require("../../db"); // Database connection
// const router = express.Router();

// router.post("/checkEmailStatus", async (req, res) => {
//   const { PlantType, Email, EntityID, LoginEntityID } = req.body;

//   // Validate input
//   if (!Email || !EntityID || !LoginEntityID) {
//     return res.status(400).json({ message: "Missing required fields." });
//   }

//   try {
//     // Query to find the user by email
//     const [users] = await pool.query(
//       `
//         SELECT entityid, user_role
//         FROM gsai_user
//         WHERE LOWER(email) = LOWER(?)
//       `,
//       [Email]
//     );

//     // Debug: Log users fetched
//     console.log("Users fetched for email:", users);

//     // Check if email exists in the user table
//     if (users.length > 0) {
//       const user = users[0];

//       // Debug: Log user entity details
//       console.log(
//         "EntityID in DB:",
//         user.entityid,
//         "Selected EntityID:",
//         EntityID,
//         "Login EntityID:",
//         LoginEntityID,
//         "User Role:",
//         user.user_role
//       );

//       // Condition 1: SelectedEntityID = LoginEntityID and user_role = individual
//       if (user.entityid === LoginEntityID && user.user_role === "individual") {
//         return res.status(200).json({ email_status: 1, mail: 2 });
//       }

//       // Condition 2: LoginEntityID ≠ SelectedEntityID and user_role = individual
//       if (user.entityid !== LoginEntityID && user.user_role === "individual") {
//         // Nested Condition 3: Email exists but EntityID in DB ≠ SelectedEntityID
//         if (user.entityid !== EntityID) {
//           return res.status(200).json({ message: "Email already exists" });
//         }
//         return res.status(200).json({ email_status: 2, mail: 3 });
//       }
//     } else {
//       // Email does not exist in the user table
//       // Debug: Log non-existence case
//       console.log(
//         "Email not found. SelectedEntityID:",
//         EntityID,
//         "LoginEntityID:",
//         LoginEntityID
//       );

//       // Condition 4: Email not exists, LoginEntityID ≠ SelectedEntityID
//       if (LoginEntityID !== EntityID) {
//         return res.status(200).json({ email_status: 3, mail: 3 });
//       }

//       // Condition 5: Email not exists, LoginEntityID = SelectedEntityID
//       if (LoginEntityID === EntityID) {
//         return res.status(200).json({ email_status: 4, mail: 2 });
//       }
//     }

//     // Default case: No condition matches
//     res.status(400).json({ message: "Conditions not met for email status." });
//   } catch (error) {
//     console.error("Error checking email status:", error);
//     res
//       .status(500)
//       .json({ message: "Error checking email status.", error: error.message });
//   }
// });

// module.exports = router;

//emailStatus
// with added conditions
const express = require("express");
const pool = require("../../db"); // Database connection
const router = express.Router();

router.post("/checkEmailStatus", async (req, res) => {
  const { PlantType, Email, EntityID, LoginEntityID } = req.body;

  // Validate input
  if (!PlantType || !Email || !EntityID || !LoginEntityID) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    // Query to find the user by email
    const [users] = await pool.query(
      `
        SELECT entityid, user_role
        FROM gsai_user
        WHERE LOWER(email) = LOWER(?)
      `,
      [Email]
    );

    console.log("Users fetched for email:", users);

    if (PlantType.toLowerCase() === "individual") {
      // Handle Individual Plant
      if (users.length > 0) {
        const user = users[0];

        // Debug: Log user entity details
        console.log(
          "EntityID in DB:",
          user.entityid,
          "Selected EntityID:",
          EntityID,
          "Login EntityID:",
          LoginEntityID,
          "User Role:",
          user.user_role
        );

        // Condition 1: Email exists, Selected EntityID === entityid in DB, and role === individual
        if (
          LoginEntityID === EntityID &&
          user.entityid === EntityID &&
          user.user_role === "individual"
        ) {
          return res
            .status(200)
            .json({ email_status: 1, mail: 2, condition: 1 });
        }

        // Condition 2: Email exists, Selected EntityID !== entityid in DB, and role === individual
        if (LoginEntityID !== EntityID && user.user_role === "individual") {
          return res
            .status(200)
            .json({ email_status: 2, mail: 3, condition: 2 });
        }

        // Condition 3: Email exists, Selected EntityID === entityid, Selected EntityID !== LoginEntityID, and role !== individual
        if (
          user.entityid === EntityID &&
          EntityID !== LoginEntityID &&
          user.user_role !== "individual"
        ) {
          return res
            .status(200)
            .json({ message: "User already exists", condition: 3 });
        }

        // Condition 4: Email exists, but entityid in DB !== Selected EntityID
        if (user.entityid !== EntityID) {
          return res
            .status(200)
            .json({ message: "User already exists", condition: 4 });
        }
      } else {
        // Email does not exist in the user table
        console.log("Email not found for individual plant type.");

        // Condition 5: Email does not exist, Selected EntityID === LoginEntityID
        if (LoginEntityID === EntityID) {
          return res
            .status(200)
            .json({ email_status: 3, mail: 2, condition: 5 });
        }

        // Condition 6: Email does not exist, Selected EntityID !== LoginEntityID
        if (LoginEntityID !== EntityID) {
          return res
            .status(200)
            .json({ email_status: 4, mail: 3, condition: 6 });
        }
      }
    } else {
      // Non-Individual Logic (No Changes)
      if (users.length > 0) {
        const user = users[0];

        console.log(
          "EntityID in DB:",
          user.entityid,
          "Selected EntityID:",
          EntityID,
          "Login EntityID:",
          LoginEntityID,
          "User Role:",
          user.user_role
        );

        if (user.entityid !== EntityID || user.user_role !== "sys admin") {
          return res
            .status(200)
            .json({ message: "User already exists", condition: 1 });
        }

        if (
          LoginEntityID === EntityID &&
          user.entityid === EntityID &&
          user.user_role === "sys admin"
        ) {
          return res
            .status(200)
            .json({ email_status: 5, mail: 2, condition: 2 });
        }

        if (
          LoginEntityID !== EntityID &&
          user.entityid === EntityID &&
          user.user_role === "sys admin"
        ) {
          return res
            .status(200)
            .json({ email_status: 6, mail: 3, condition: 3 });
        }
      } else {
        console.log("Email not found for non-individual case.");
        return res.status(200).json({ email_status: 7, mail: 3, condition: 4 });
      }
    }

    return res
      .status(400)
      .json({ message: "Conditions not met for email status." });
  } catch (error) {
    console.error("Error checking email status:", error);
    res
      .status(500)
      .json({ message: "Error checking email status.", error: error.message });
  }
});

module.exports = router;
