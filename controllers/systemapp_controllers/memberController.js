const Users = require('../../models/admin_models/Users');
const GymLog = require('../../models/admin_models/GymLogbook');
const UserSideGymLog = require('../../models/user_models/UserGymLog'); 

const getTodayKey = () => new Date().toISOString().split("T")[0];

const getCurrentTime = () => new Date().toLocaleTimeString();

const isAfterClosing = () => {
    const now = new Date();
    return now.getHours() >= 20;
};

const getMembershipStatus = (user, currentBranch) => {
    if (!user.membershipStatus?.length) return "WALK-IN";

    const now = new Date();

    const activeMembership = user.membershipStatus.find(m => {
        const notExpired = !m.expiryDate || new Date(m.expiryDate) >= now;
        const branchMatch = m.branch === currentBranch || m.branch === "All";
        return notExpired && branchMatch;
    });

    if (!activeMembership) {
        const hasExpired = user.membershipStatus.some(m =>
            m.expiryDate && new Date(m.expiryDate) < now
        );
        return hasExpired ? "EXPIRED" : "WRONG BRANCH";
    }

    return "ACTIVE";
};

const getLoginStatus = (logDoc) => {
    if (!logDoc) return "NOT LOGGED IN";
    if (logDoc.timeIn && !logDoc.timeOut) return "LOGGED IN";
    return "NOT LOGGED IN";
};

const pushUserSideLog = async (user, branch, timeIn = null, timeOut = null) => {
    try {
        await UserSideGymLog.findOneAndUpdate(
            { userId: user._id },
            {
                $setOnInsert: { userId: user._id, email: user.email },
                $push: {
                    userlog: {
                        date: new Date(),
                        timeIn,
                        timeOut,
                        branch
                    }
                }
            },
            { upsert: true, new: true }
        );
    } catch (err) {
        console.error("[UserSideGymLog] Failed to push log:", err.message);
    }
};

const updateUserSideLogTimeOut = async (user) => {
    try {
        await UserSideGymLog.findOneAndUpdate(
            { userId: user._id, "userlog.timeOut": null },
            {
                $set: { "userlog.$.timeOut": getCurrentTime() }
            }
        );
    } catch (err) {
        console.error("[UserSideGymLog] Failed to update timeOut:", err.message);
    }
};

const getAllMembers = async (req, res) => {
    try {
        const users = await Users.find()
            .select('firstname lastname email gymId');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getMemberById = async (req, res) => {
    try {
        const currentBranch = req.user.branch;
        const today = getTodayKey();

        const user = await Users.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const logDoc = await GymLog.findOne({ email: user.email, dateKey: today });
        const membershipStatus = getMembershipStatus(user, currentBranch);
        const loginStatus = getLoginStatus(logDoc);

        res.json({ user, membershipStatus, loginStatus });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const timeIn = async (req, res) => {
    try {
        const currentBranch = req.user.branch;
        const { forceWalkIn } = req.body;
        const today = getTodayKey();

        const user = await Users.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const membershipStatus = getMembershipStatus(user, currentBranch);

        if (
            (membershipStatus === "EXPIRED" || membershipStatus === "WRONG BRANCH") &&
            !forceWalkIn
        ) {
            return res.status(403).json({ message: membershipStatus, allowWalkIn: true });
        }

        let logDoc = await GymLog.findOne({ email: user.email, dateKey: today });

        if (!logDoc) {
            logDoc = new GymLog({
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                dateKey: today,
                timeIn: null,
                timeOut: null,
                branch: currentBranch
            });
        }

        if (logDoc.timeIn && !logDoc.timeOut) {
            return res.status(400).json({ message: "Already logged in today" });
        }

        if (logDoc.timeIn && !logDoc.timeOut && isAfterClosing()) {
            logDoc.timeOut = "8:00 PM (AUTO CLOSED)";
        }

        const now = getCurrentTime();
        logDoc.timeIn = now;
        logDoc.timeOut = null;
        logDoc.branch = currentBranch;
        await logDoc.save();

        await pushUserSideLog(user, currentBranch, now, null);

        res.json({ message: forceWalkIn ? "Logged in as WALK-IN" : "Time In recorded" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const timeOut = async (req, res) => {
    try {
        const today = getTodayKey();

        const user = await Users.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const logDoc = await GymLog.findOne({ email: user.email, dateKey: today });

        if (!logDoc || !logDoc.timeIn || logDoc.timeOut) {
            return res.status(400).json({ message: "User not logged in today" });
        }

        const now = getCurrentTime();
        logDoc.timeOut = now;
        await logDoc.save();

        await updateUserSideLogTimeOut(user);

        res.json({ message: "Time Out recorded" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const rfidScan = async (req, res) => {
    try {
        console.log("[RFID] Body received:", req.body);

        const currentBranch = req.user.branch;
        const { rfid, forceWalkIn } = req.body;

        if (!rfid) {
            return res.status(400).json({ message: "RFID is required" });
        }

        const user = await Users.findOne({ rfid });

        console.log("[RFID] User found:", user);

        if (!user) {
            return res.status(404).json({
                message: "No member found for this RFID"
            });
        }

        const today = getTodayKey();
        const membershipStatus = getMembershipStatus(user, currentBranch);

        if (
            (membershipStatus === "EXPIRED" || membershipStatus === "WRONG BRANCH") &&
            !forceWalkIn
        ) {
            return res.status(403).json({
                message: membershipStatus,
                allowWalkIn: true,
                user: {
                    _id: user._id,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    gymId: user.gymId
                }
            });
        }

        let logDoc = await GymLog.findOne({
            email: user.email,
            dateKey: today
        });

        if (logDoc?.timeIn && !logDoc?.timeOut) {
            const now = getCurrentTime();

            logDoc.timeOut = now;
            await logDoc.save();

            await updateUserSideLogTimeOut(user);

            return res.json({
                action: "TIME_OUT",
                message: `Time Out recorded for ${user.firstname} ${user.lastname}`,
                user: {
                    _id: user._id,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    gymId: user.gymId
                }
            });
        }

        if (!logDoc) {
            logDoc = new GymLog({
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                dateKey: today,
                timeIn: null,
                timeOut: null,
                branch: currentBranch
            });
        }

        if (logDoc.timeIn && !logDoc.timeOut && isAfterClosing()) {
            logDoc.timeOut = "8:00 PM (AUTO CLOSED)";
        }

        const now = getCurrentTime();

        logDoc.timeIn = now;
        logDoc.timeOut = null;
        logDoc.branch = currentBranch;

        await logDoc.save();

        await pushUserSideLog(user, currentBranch, now, null);

        return res.json({
            action: "TIME_IN",
            message: forceWalkIn
                ? `Logged in as WALK-IN: ${user.firstname} ${user.lastname}`
                : `Time In recorded for ${user.firstname} ${user.lastname}`,
            membershipStatus,
            user: {
                _id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                gymId: user.gymId
            }
        });

    } catch (err) {
        console.error("[RFID ERROR]", err);
        return res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAllMembers,
    getMemberById,
    timeIn,
    timeOut,
    rfidScan
};