const Users = require("../../models/admin_models/Users");

const getBranchMembers = async (req, res) => {
  try {
    const { branch } = req.user

    const members = await Users.find({
      "membershipStatus.branch": branch
    })

    res.status(200).json({
      success: true,
      members
    })

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}


const editMember = async (req, res) => {
  try {
    const { id } = req.params
    const { branch } = req.user

    const {
      firstname,
      lastname,
      email,
      contactNum,
      contactPerson,
      contactPersonNum,
      address,
      gymId,
      rfid,
      assignedTrainer,
      membershipStatus
    } = req.body

    const member = await Users.findById(id)
    if (!member) return res.status(404).json({ message: "Member not found." })

    const belongsToBranch = member.membershipStatus.some(ms => ms.branch === branch)
    if (!belongsToBranch) {
      return res.status(403).json({ message: "Access denied. Member is not in your branch." })
    }

    if (membershipStatus && membershipStatus.length > 0) {
      const { startDate, expiryDate } = membershipStatus[0]
      if (startDate && expiryDate) {
        const diffTime = new Date(expiryDate) - new Date(startDate)
        membershipStatus[0].remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      }
    }

    member.firstname        = firstname        ?? member.firstname
    member.lastname         = lastname         ?? member.lastname
    member.email            = email            ?? member.email
    member.contactNum       = contactNum       ?? member.contactNum
    member.contactPerson    = contactPerson    ?? member.contactPerson
    member.contactPersonNum = contactPersonNum ?? member.contactPersonNum
    member.address          = address          ?? member.address
    member.gymId            = gymId            ?? member.gymId
    member.rfid             = rfid             ?? member.rfid
    member.assignedTrainer  = assignedTrainer  ?? member.assignedTrainer

    if (membershipStatus && membershipStatus.length > 0) {
      member.membershipStatus = membershipStatus
    }

    const updatedMember = await member.save()

    res.status(200).json({
      success: true,
      message: "Member updated successfully.",
      member: updatedMember
    })

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Duplicate email, gymId, or RFID already exists." })
    }
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

const deleteMember = async (req, res) => {
  try {
    const { id } = req.params
    const { branch } = req.user

    const member = await Users.findById(id)
    if (!member) return res.status(404).json({ message: "Member not found." })

    const belongsToBranch = member.membershipStatus.some(ms => ms.branch === branch)
    if (!belongsToBranch) {
      return res.status(403).json({ message: "Access denied. Member is not in your branch." })
    }

    await Users.findByIdAndDelete(id)

    res.status(200).json({
      success: true,
      message: "Member deleted successfully."
    })

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

module.exports = {
  getBranchMembers,
  editMember,
  deleteMember
}