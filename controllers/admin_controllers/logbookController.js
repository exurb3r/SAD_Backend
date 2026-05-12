const UserGymLog = require("../../models/admin_models/GymLogbook");


const getLogs = async (req, res) => {
  try {

    const { branch } = req.user
    const logs = await UserGymLog.find({
      branch
    }).sort({ date: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createLog = async (req, res) => {
  try {
    const newLog = new UserGymLog({
      ...req.body,
      branch: req.admin.branch 
    });

    const saved = await newLog.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateLog = async (req, res) => {
  try {
    const { branch } = req.user  

    const log = await UserGymLog.findOne({
      _id: req.params.id,
      branch
    });

    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    log.timeIn = req.body.timeIn ?? log.timeIn;
    log.timeOut = req.body.timeOut ?? log.timeOut;

    const updated = await log.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteLog = async (req, res) => {
  try {
    const log = await UserGymLog.findOneAndDelete({
      _id: req.params.id,
      branch: req.user.branch 
    });

    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    res.json({ message: "Log deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getLogs, createLog, updateLog, deleteLog };