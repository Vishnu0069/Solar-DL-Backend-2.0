// const express = require("express");
// const pool = require("../../db");
// const router = express.Router();

// router.get("/fetchEntityNames", async (req, res) => {
//   const { entityid } = req.query;

//   if (!entityid) {
//     return res.status(400).json({ message: "entityid parameter is required" });
//   }

//   try {
//     // Fetch the masterentityid and entityname for the given entityid
//     const [entityCheck] = await pool.query(
//       `
//       SELECT masterentityid, entityname
//       FROM EntityMaster
//       WHERE entityid = ?
//     `,
//       [entityid]
//     );

//     if (entityCheck.length === 0) {
//       return res.status(404).json({ message: "Entity not found" });
//     }

//     const { masterentityid: masterEntityId, entityname: currentEntityName } =
//       entityCheck[0];

//     // Check if the entity's masterentityid is '1111'
//     if (masterEntityId === "1111") {
//       // If masterentityid is '1111', get all entities with the same prefix as the provided entityid
//       const [entities] = await pool.query(
//         `
//         SELECT entityid, entityname
//         FROM EntityMaster
//         WHERE entityid LIKE CONCAT(?, '-%') AND mark_deletion = 0
//       `,
//         [entityid]
//       );

//       res.status(200).json({
//         currentEntity: { entityid, entityname: currentEntityName },
//         entities: entities,
//       });
//     } else {
//       // If masterentityid is not '1111', return only the current entity information
//       res.status(200).json({
//         currentEntity: { entityid, entityname: currentEntityName },
//       });
//     }
//   } catch (error) {
//     console.error("Error fetching entity names:", error);
//     res
//       .status(500)
//       .json({ message: "Error fetching entity names", error: error.message });
//   }
// });

// module.exports = router;

const express = require("express");
const pool = require("../../db");
const router = express.Router();
require("dotenv").config();

router.get("/fetchEntityNames", async (req, res) => {
  const { entityid } = req.query;

  if (!entityid) {
    return res.status(400).json({ message: "entityid parameter is required" });
  }

  try {
    // Fetch the namespace and entity name for the given entityid
    const [entityData] = await pool.query(
      `SELECT namespace, entityname FROM EntityMaster WHERE entityid = ?`,
      [entityid]
    );

    if (entityData.length === 0) {
      return res.status(404).json({ message: "Entity not found" });
    }

    const { namespace, entityname } = entityData[0];
    const namespaceParts = namespace.split("-");
    let query;
    let params;

    if (namespaceParts.length === 1) {
      // L0: Fetch all L1 entity names
      query = `
        SELECT entityid, entityname
        FROM EntityMaster
        WHERE namespace LIKE CONCAT(?, '-%') AND namespace NOT LIKE CONCAT(?, '-%-') AND mark_deletion = 0
      `;
      params = [namespace, namespace];
    } else if (namespaceParts.length === 2) {
      // L1: Fetch all L2 entity names
      query = `
        SELECT entityid, entityname
        FROM EntityMaster
        WHERE namespace LIKE CONCAT(?, '-%') AND namespace NOT LIKE CONCAT(?, '-%-') AND mark_deletion = 0
      `;
      params = [namespace, namespace];
    } else {
      // L2 or deeper: Fetch entities at this level
      query = `
        SELECT entityid, entityname
        FROM EntityMaster
        WHERE namespace LIKE CONCAT(?, '-%') AND mark_deletion = 0
      `;
      params = [namespace];
    }

    const [linkedEntities] = await pool.query(query, params);

    // Prepare the response
    const response = {
      currentEntity: {
        entityid,
        entityname,
      },
      entities: linkedEntities.map((entity) => ({
        entityid: entity.entityid,
        entityname: entity.entityname,
      })),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching entity names:", error);
    res
      .status(500)
      .json({ message: "Error fetching entity names", error: error.message });
  }
});

module.exports = router;
