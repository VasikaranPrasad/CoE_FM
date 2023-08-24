// controllers/runController.js
const Run = require('../Model/Run');

// Create a new run
exports.createRun = async (req, res) => {
  try {
    const run = new Run(req.body);
    await run.save();
    res.status(201).json(run);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Retrieve all runs
exports.getAllRuns = async (req, res) => {
  try {
    const runs = await Run.find();
    res.status(200).json(runs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ... Similar functions for updating and deleting runs
