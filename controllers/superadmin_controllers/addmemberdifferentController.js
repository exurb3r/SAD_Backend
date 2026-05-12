const AppUsers        = require("../../models/user_models/AppUsers");
const Members         = require("../../models/admin_models/Users");
const UserPrefAndMisc = require("../../models/user_models/UserPreferenceAndMisc");

const getUsersForEnrollment = async (req, res) => {
  try {
    const adminBranch = req.admin?.branch || req.user?.branch;

    if (!adminBranch) {
      return res.status(401).json({ message: "Unable to determine admin branch." });
    }

    const appUsers   = await AppUsers.find().select("-password");
    const allMembers = await Members.find().select("email firstname lastname membershipStatus gymId");
    const memberMap  = new Map(allMembers.map(m => [m.email, m]));

    const result = appUsers
      .map(u => {
        const memberRecord = memberMap.get(u.email);

        const firstname = memberRecord?.firstname || u.username;
        const lastname  = memberRecord?.lastname  || "";

        const alreadyAtThisBranch = memberRecord?.membershipStatus?.some(
          ms => ms.branch === adminBranch && ms.isActive === true
        ) ?? false;

        const branch = memberRecord?.membershipStatus?.at(-1)?.branch || "Walk-in";

        let status = "Walk-in";
        if (branch === "General Luna")  status = "General Luna";
        else if (branch === "Rimando Road") status = "Rimando Road";

        return {
          _id:                u._id,
          memberId:           memberRecord?._id || null,
          firstname,
          lastname,
          email:              u.email,
          branch,
          status,
          isMember:           !!memberRecord,
          alreadyAtThisBranch 
        };
      })
      .filter(u => !u.alreadyAtThisBranch);

    res.status(200).json({ success: true, users: result });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const enrollMember = async (req, res) => {
  try {
    const {
      firstname, lastname, email,
      contactNum, contactPerson, contactPersonNum,
      address, gymId, rfid, assignedTrainer,
      membershipStatus
    } = req.body;

    if (!membershipStatus || membershipStatus.length === 0) {
      return res.status(400).json({ message: "At least one membership entry is required." });
    }
    const newEntry = membershipStatus[0]; 

    const appUser = await AppUsers.findOne({ email });

    const existingMember = await Members.findOne({ email });

    if (existingMember) {
      existingMember.membershipStatus.push(...membershipStatus);
      const saved = await existingMember.save();

      if (appUser) {
        appUser.membershipStatus.push({
          category:      newEntry.category,
          branch:        newEntry.branch,
          startDate:     newEntry.startDate,
          expiryDate:    newEntry.expiryDate,
          remainingDays: newEntry.remainingDays || null
        });
        await appUser.save();

        await sendMembershipNotification(appUser._id, newEntry, false);
      }

      return res.status(200).json({ success: true, member: saved });
    }

    if (!firstname || !lastname || !email || !contactNum ||
        !contactPerson || !contactPersonNum || !address || !gymId) {
      return res.status(400).json({ message: "All fields are required for new members." });
    }

    const gymIdExists = await Members.findOne({ gymId });
    if (gymIdExists) {
      return res.status(400).json({ message: "Gym ID is already taken." });
    }

    const newMember = new Members({
      firstname, lastname, email,
      contactNum, contactPerson, contactPersonNum,
      address, gymId,
      rfid:            rfid            || undefined,
      assignedTrainer: assignedTrainer || undefined,
      membershipStatus
    });

    const saved = await newMember.save();

    if (appUser) {
      appUser.membershipStatus.push({
        category:      newEntry.category,
        branch:        newEntry.branch,
        startDate:     newEntry.startDate,
        expiryDate:    newEntry.expiryDate,
        remainingDays: newEntry.remainingDays || null
      });
      await appUser.save();

      await sendMembershipNotification(appUser._id, newEntry, true);
    }

    res.status(201).json({ success: true, member: saved });

  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({ message: `${field} already exists.` });
    }
    res.status(500).json({ message: err.message });
  }
};

async function sendMembershipNotification(appUserId, membership, isNew) {
  try {
    const title = isNew
      ? "Welcome! Your membership is active."
      : "Your membership has been updated.";

    const description = isNew
      ? `You have been enrolled as a ${membership.category} member at ${membership.branch}. ` +
        `Your membership runs from ${formatDate(membership.startDate)} to ${formatDate(membership.expiryDate)}.`
      : `A new ${membership.category} membership has been added for ${membership.branch}. ` +
        `Valid from ${formatDate(membership.startDate)} to ${formatDate(membership.expiryDate)}.`;

    await UserPrefAndMisc.findOneAndUpdate(
      { userId: appUserId },
      {
        $push: {
          notifications: {
            $each: [{ title, description }],
            $position: 0  
          }
        }
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error("Failed to send membership notification:", err.message);
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-PH", {
    year: "numeric", month: "long", day: "numeric"
  });
}

module.exports = { getUsersForEnrollment, enrollMember };