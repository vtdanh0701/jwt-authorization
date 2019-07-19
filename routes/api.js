const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({type: 'Success', message: "You access the protected API routes"})
})

module.exports = router;