const Members = require("../../models/admin_models/Users")

const getAllMembers = async (req, res) => {
  try {
    const members = await Members.find().sort({ createdAt: -1 })
    res.status(200).json({ success: true, members })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const editMember = async (req, res) => {
  try {
    const updated = await Members.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
    if (!updated) return res.status(404).json({ message: "Member not found." })
    res.status(200).json({ success: true, member: updated })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const deleteMember = async (req, res) => {
  try {
    const deleted = await Members.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: "Member not found." })
    res.status(200).json({ success: true, message: "Member deleted." })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getAllMembers, editMember, deleteMember }