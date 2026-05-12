const AppUser = require("../../models/user_models/AppUser");
const UserGameDetails = require("../../models/user_models/UserGameDetails");
const UserProgress = require("../../models/user_models/UserProgress");
const UserPreferenceAndMisc = require("../../models/user_models/UserPreferenceAndMisc");
const UserRoutine = require("../../models/user_models/UserRoutine");

const settingsData = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await AppUser.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const gameDetails = await UserGameDetails.findOne({ userId });
        const progress = await UserProgress.findOne({ userId });
        const preferences = await UserPreferenceAndMisc.findOne({ userId });
        const routines = await UserRoutine.findOne({ userId });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
module.exports = { settingsData };