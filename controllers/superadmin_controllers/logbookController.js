const UserGymLog = require("../../models/admin_models/GymLogbook");

const getLogs = async (req, res) => {
  try {
    const logs = await UserGymLog.find().sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateLog = async (req, res) => {
  try {
    const log = await UserGymLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: "Log not found." });

    log.timeIn  = req.body.timeIn  ?? log.timeIn;
    log.timeOut = req.body.timeOut ?? log.timeOut;

    const updated = await log.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteLog = async (req, res) => {
  try {
    const log = await UserGymLog.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ message: "Log not found." });
    res.json({ message: "Log deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getLogs, updateLog, deleteLog };