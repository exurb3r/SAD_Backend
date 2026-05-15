const AppUser = require("../../models/user_models/AppUsers");
const UserGameDetails = require("../../models/user_models/UserGameDetails");
const UserProgress = require("../../models/user_models/UserProgress");
const UserPreferenceAndMisc = require("../../models/user_models/UserPreferenceAndMisc");
const UserRoutine = require("../../models/user_models/UserRoutine");

const dashboardData = async (req, res) => {
    try {
        const userId = req.user.id;
        const [gameDetails, progressDoc, preferences, routines] = await Promise.all([
            UserGameDetails.findOne({ userId }),
            UserProgress.findOne({ userId }),
            UserPreferenceAndMisc.findOne({ userId }),
            UserRoutine.findOne({ userId })
        ]);

        const recentAchievements = gameDetails?.achievements
            ?.slice(-3)
            .map(a => a.title) || [];

        const notifications = preferences?.notifications?.map((n, index) => ({
            id: index + 1,
            message: `${n.title} - ${n.description}`
        })) || [];

        const weeklyWorkouts = new Array(7).fill(0);
        const weeklyHours = new Array(7).fill(0);
        const workoutDistributionMap = {
            Chest: 0, Back: 0, Shoulders: 0,
            Arms: 0, "Core/Abs": 0, Legs: 0
        };

        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        progressDoc?.progress?.forEach(entry => {
            const date = new Date(entry.date);
            if (date < startOfWeek || date > endOfWeek) return;
            const dayIndex = date.getDay();
            weeklyWorkouts[dayIndex] += entry.totalWorkouts || 0;
            weeklyHours[dayIndex] += entry.hoursSpent || 0;
        });

        routines?.routineHistory?.forEach(workout => {
            workout.exercises.forEach(ex => {
                if (workoutDistributionMap.hasOwnProperty(ex.category)) {
                    workoutDistributionMap[ex.category] += 1;
                }
            });
        });

        const workoutDistribution = ["Chest", "Back", "Shoulders", "Arms", "Core/Abs", "Legs"]
            .map(type => workoutDistributionMap[type] || 0);

        let numberOfWorkouts = 0, duration = 0, focus = [], expGained = 0;
        if (routines?.routineHistory?.length > 0) {
            const lastWorkout = routines.routineHistory[routines.routineHistory.length - 1];
            numberOfWorkouts = lastWorkout.exercises.length;
            duration = lastWorkout.duration || 0;
            expGained = lastWorkout.expGained || 0;
            focus = [...new Set(lastWorkout.exercises.map(ex => ex.category).filter(Boolean))];
        }

        res.status(200).json({
            recentAchievements,
            notifications,
            weeklyWorkouts,
            weeklyHours,
            workoutDistribution,
            numberOfWorkouts,
            duration,
            focus,
            expGained
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
module.exports = { dashboardData };