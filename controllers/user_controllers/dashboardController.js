const AppUser = require("../../models/user_models/AppUsers");
const UserGameDetails = require("../../models/user_models/UserGameDetails");
const UserProgress = require("../../models/user_models/UserProgress");
const UserPreferenceAndMisc = require("../../models/user_models/UserPreferenceAndMisc");
const UserRoutine = require("../../models/user_models/UserRoutine");

const dashboardData = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await AppUser.findOne({ userId: userId } );
        if (!user) return res.status(404).json({ message: "User not found" });

        const gameDetails = await UserGameDetails.findOne( { userId: userId } );
        const progressDoc = await UserProgress.findOne( { userId: userId } );
        const preferences = await UserPreferenceAndMisc.findOne( { userId: userId });
        const routines = await UserRoutine.findOne( { userId: userId } );


        const membershipData = user.membershipStatus[0] || {};
        const membership = membershipData.category || "No Membership";
        const membershipDuration = membershipData.remainingDays || 0;

        const level = gameDetails?.level || 1;
        const exp = gameDetails?.exp_points || 0;
        const currentStreak = gameDetails?.currentStreak || 0;

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
            Chest: 0,
            Back: 0,
            Shoulders: 0,
            Arms: 0,
            "Core/Abs": 0,
            Legs: 0
        };
        const now = new Date();
        const day = now.getDay();

        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - day);
        startOfWeek.setHours(0,0,0,0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23,59,59,999);

        if (progressDoc?.progress) {
            progressDoc.progress.forEach(entry => {

                const date = new Date(entry.date);
                if (date < startOfWeek || date > endOfWeek) return;

                const dayIndex = date.getDay();

                weeklyWorkouts[dayIndex] += entry.totalWorkouts || 0;
                weeklyHours[dayIndex] += entry.hoursSpent || 0;

            });
        }
        if (routines?.routineHistory?.length > 0) {
            routines.routineHistory.forEach(workout => {
                workout.exercises.forEach(ex => {
                    if (workoutDistributionMap.hasOwnProperty(ex.category)) {
                        workoutDistributionMap[ex.category] += 1;
                    }
                });
            });
        }

        const workoutTypes = ["Chest", "Back", "Shoulders", "Arms", "Core/Abs", "Legs"];
        
        const workoutDistribution = workoutTypes.map(type =>
            workoutDistributionMap[type] || 0
        );

        let numberOfWorkouts = 0;
        let duration = 0;
        let focus = [];
        let expGained = 0;

        if (routines?.routineHistory?.length > 0) {
            const lastWorkout = routines.routineHistory[
                routines.routineHistory.length - 1
            ];

            numberOfWorkouts = lastWorkout.exercises.length;
            duration = lastWorkout.duration || 0;
            expGained = lastWorkout.expGained || 0;

            const focusSet = new Set();
            lastWorkout.exercises.forEach(ex => {
                if (ex.category) focusSet.add(ex.category);
            });

            focus = Array.from(focusSet);
        }

        res.status(200).json({
            username: user.username,
            membership,
            membershipDuration,
            currentStreak,
            recentAchievements,
            exp,
            level,
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