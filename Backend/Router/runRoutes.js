// routes/runRoutes.js
const express = require('express');
const router = express.Router();
const runController = require('../Controller/runController');

router.post('/runs', runController.createRun);
router.get('/runs', runController.getAllRuns);
// ... Similar routes for updating and deleting runs

module.exports = router;
