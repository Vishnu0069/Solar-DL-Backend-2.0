// // In routes/Entity/markEntityAsDeleted.js
// const express = require('express');
// const pool = require('../../db');
// const router = express.Router();

// router.post('/disable', async (req, res) => {
//   const { entityid } = req.body;

//   if (!entityid) {
//     return res.status(400).json({ message: 'entityid is required' });
//   }

//   try {
//     const [result] = await pool.query(
//       `UPDATE EntityMaster 
//        SET mark_deletion = 1 
//        WHERE entityid = ?`, 
//        [entityid]
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: 'Entity not found or already marked as deleted' });
//     }

//     res.status(200).json({ message: 'Entity marked as deleted successfully' });
//   } catch (error) {
//     console.error('Error marking entity as deleted:', error);
//     res.status(500).json({ message: 'Error marking entity as deleted', error: error.message });
//   }
// });

// module.exports = router;
// In routes/Entity/markEntityAsDeleted.js
const express = require('express');
const pool = require('../../db');
const router = express.Router();

router.post('/disable', async (req, res) => {
  const { entityid } = req.body;

  if (!entityid) {
    return res.status(400).json({ message: 'entityid is required' });
  }

  try {
    // Check if the entity's masterentityid is 1111
    const [checkResult] = await pool.query(
      `SELECT masterentityid FROM EntityMaster WHERE entityid = ?`, 
      [entityid]
    );

    if (checkResult.length === 0) {
      return res.status(404).json({ message: 'Entity not found' });
    }

    const { masterentityid } = checkResult[0];
    if (masterentityid === '1111') {
      return res.status(403).json({ message: "Can't delete the Master Entity" });
    }

    // Proceed to mark the entity as deleted
    const [result] = await pool.query(
      `UPDATE EntityMaster 
       SET mark_deletion = 1 
       WHERE entityid = ?`, 
      [entityid]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Entity not found or already marked as deleted' });
    }

    res.status(200).json({ message: 'Entity marked as deleted successfully' });
  } catch (error) {
    console.error('Error marking entity as deleted:', error);
    res.status(500).json({ message: 'Error marking entity as deleted', error: error.message });
  }
});

module.exports = router;
