const Users = require("../../models/admin_models/Users");

const addMember = async (req, res) => {
  try {
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

    if (membershipStatus && membershipStatus.length > 0) {

      const start = new Date(membershipStatus[0].startDate)
      const expiry = new Date(membershipStatus[0].expiryDate)

      const diffTime = expiry - start
      const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      membershipStatus[0].remainingDays = remainingDays
    }


    const newMember = new Users({
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
    })
    const savedMember = await newMember.save()

    res.status(201).json({
      success: true,
      message: "Member successfully added",
      member: savedMember
    })

  } catch (error) {

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate email, gymId, or RFID already exists"
      })
    }

    res.status(500).json({
      message: "Server error",
      error: error.message
    })
  }
}

module.exports = { addMember };