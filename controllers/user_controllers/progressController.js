const AppUser = require("../../models/user_models/AppUsers");
const UserGameDetails = require("../../models/user_models/UserGameDetails");
const UserProgress = require("../../models/user_models/UserProgress");
const UserPreferenceAndMisc = require("../../models/user_models/UserPreferenceAndMisc");
const UserRoutine = require("../../models/user_models/UserRoutine");

const getProgressData = async (req, res) => {
    try {
        const userId = req.user.id;
        const { period } = req.params; 

        const user = await AppUser.findOne({ userId });
        if (!user) return res.status(404).json({ message: "User not found" });

        const gameDetails = await UserGameDetails.findOne({ userId });
        const progressDoc = await UserProgress.findOne({ userId });
        const preferences = await UserPreferenceAndMisc.findOne({ userId });
        const routines = await UserRoutine.findOne({ userId });

        const level = gameDetails?.level || 1;
        const exp = gameDetails?.exp_points || 0;
        const currentStreak = gameDetails?.currentStreak || 0;

        const recentAchievements =
            gameDetails?.achievements?.slice(-3).map(a => a.title) || [];

        const notifications =
            preferences?.notifications?.map((n, i) => ({
                id: i + 1,
                message: `${n.title} - ${n.description}`
            })) || [];

        const now = new Date();
        let startDate, endDate;

        if (period === "week") {
            const day = now.getDay();

            startDate = new Date(now);
            startDate.setDate(now.getDate() - day);
            startDate.setHours(0, 0, 0, 0);

            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
        }

        if (period === "month") {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        }

        if (period === "year") {
            startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
            endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

        }


        let workoutCounts, hourCounts;

        if (period === "week") {
            workoutCounts = new Array(7).fill(0);
            hourCounts = new Array(7).fill(0);

        } else if (period === "month") {
            workoutCounts = new Array(31).fill(0);
            hourCounts = new Array(31).fill(0);

        } else {
            workoutCounts = new Array(12).fill(0);
            hourCounts = new Array(12).fill(0);

        }

        if (progressDoc?.progress) {
            progressDoc.progress.forEach(entry => {
                const entryDate = new Date(entry.date);
                if (entryDate < startDate || entryDate > endDate) return;
                let index;

                if (period === "week") index = entryDate.getDay();
                if (period === "month") index = entryDate.getDate() - 1;
                if (period === "year") index = entryDate.getMonth();

                workoutCounts[index] += entry.totalWorkouts || 0;
                hourCounts[index] += entry.hoursSpent || 0;

            });
        }

        const distributionMap = {
            Chest: 0,
            Back: 0,
            Shoulders: 0,
            Arms: 0,
            "Core/Abs": 0,
            Legs: 0
        };

        const routineHistory = [];

        if (routines?.routineHistory?.length) {
            routines.routineHistory.forEach(workout => {
                const date = new Date(workout.dateCompleted);
                if (date >= startDate && date <= endDate) {
                    routineHistory.push(workout);
                    workout.exercises.forEach(ex => {
                        if (distributionMap.hasOwnProperty(ex.category)) {
                            distributionMap[ex.category] += 1;
                        }
                    });
                }
            });
        }

        const workoutDistribution = Object.values(distributionMap);

        let numberOfWorkouts = 0;
        let duration = 0;
        let focus = [];
        let expGained = 0;

        if (routineHistory.length > 0) {
            const lastWorkout = routineHistory[routineHistory.length - 1];
            numberOfWorkouts = lastWorkout.exercises.length;
            duration = lastWorkout.duration || 0;
            expGained = lastWorkout.expGained || 0;
            const focusSet = new Set();

            lastWorkout.exercises.forEach(ex => {
                if (ex.category) focusSet.add(ex.category);
            });
            focus = Array.from(focusSet);
        }

        res.json({
            username: user.username,
            currentStreak,
            recentAchievements,
            exp,
            level,
            notifications,
            workoutCounts,
            hourCounts,
            workoutDistribution,
            numberOfWorkouts,
            duration,
            focus,
            expGained,
            routineHistory
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getProgressData };