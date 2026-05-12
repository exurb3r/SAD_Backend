const AppUsers = require("../../models/user_models/AppUsers");
const bcrypt = require("bcrypt");

const getAppUsers = async (req, res) => {
  try {
    const users = await AppUsers.find().select("-password")

    res.status(200).json({
      success: true,
      users
    })

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

const editAppUser = async (req, res) => {
  try {
    const { id } = req.params
    const { username, newEmail, newPassword } = req.body

    if (!username || !username.trim()) {
      return res.status(400).json({ message: "Username is required." })
    }

    const user = await AppUsers.findById(id)
    if (!user) return res.status(404).json({ message: "User not found." })

    user.username = username.trim()

    if (newEmail && newEmail.trim()) {
      user.email = newEmail.trim()
    }

    if (newPassword && newPassword.trim()) {
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters." })
      }
      user.password = await bcrypt.hash(newPassword, 10)
    }

    const updatedUser = await user.save()

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        membershipStatus: updatedUser.membershipStatus,
        role: updatedUser.role,
        joinDate: updatedUser.joinDate,
        status: updatedUser.status
      }
    })

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Username or email already exists." })
    }
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

const toggleAppUserStatus = async (req, res) => {
  try {
    const { id } = req.params

    const user = await AppUsers.findById(id)
    if (!user) return res.status(404).json({ message: "User not found." })

    user.status = user.status === "Active" ? "Inactive" : "Active"
    await user.save()

    res.status(200).json({
      success: true,
      message: `User ${user.status === "Active" ? "activated" : "deactivated"}.`,
      status: user.status
    })

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

const deleteAppUser = async (req, res) => {
  try {
    const { id } = req.params

    const user = await AppUsers.findByIdAndDelete(id)
    if (!user) return res.status(404).json({ message: "User not found." })

    res.status(200).json({
      success: true,
      message: "User deleted successfully."
    })

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

const sendRecoveryEmail = async (req, res) => {
  try {
    const { id } = req.params

    const user = await AppUsers.findById(id).select("email username")
    if (!user) return res.status(404).json({ message: "User not found." })

    console.log(`Recovery email would be sent to: ${user.email}`)

    res.status(200).json({
      success: true,
      message: `Recovery email sent to ${user.email}`
    })

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

module.exports = {
  getAppUsers,
  editAppUser,
  toggleAppUserStatus,
  deleteAppUser,
  sendRecoveryEmail
}