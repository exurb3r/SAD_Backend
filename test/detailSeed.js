const mongoose = require('mongoose');
const UserGameDetails = require('../models/user_models/UserGameDetails');
const UserProgress = require('../models/user_models/UserProgress');
const UserPrefAndMisc = require('../models/user_models/UserPreferenceAndMisc');
const UserRoutine = require('../models/user_models/UserRoutine');
const UserSocial = require('../models/user_models/UserSocial');
const Users = require('../models/admin_models/Users'); 

mongoose.connect('mongodb://127.0.0.1:27017/armztrongGym')
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

const seedAngelaRelated = async () => {
    try {
        const user = await Users.findOne({ email: 'juan.delacruz@gmail.com' });
        if (!user) return console.log("User not found!");
        const userId = user._id;

        await UserGameDetails.findOneAndUpdate(
            { userId },
            {
                userId,
                achievements: [
                    { title: "Joined Gym", description: "Registered account", exp_gained: 69 }
                ],
                level: 67,
                exp_points: 69,
                highestStreak: 15,
                currentStreak: 3,
                acceptedInvites: []
            },
            { upsert: true, returnDocument: 'after' }
        );

        await UserPrefAndMisc.findOneAndUpdate(
            { userId },
            {
                userId,
                pfp: "default-avatar.png",
                theme: "light",
                sharing: true,
                motto: "Train Hard, Live Strong",
                notifications: [
                    { title: "Welcome!", description: "Thanks for joining the gym." }
                ]
            },
            { upsert: true, returnDocument: 'after' }
        );

        await UserProgress.findOneAndUpdate(
            { userId },
            {
                userId,
                progress: [
                    {
                        date: new Date(),
                        hoursSpent: 2.5,
                        totalWorkouts: 1,
                        totalExpGained: 69,
                        distribution: [
                            { workoutType: "Cardio", numberofWorkouts: 1, timeSpent: 1.5 }
                        ]
                    },
                        {
                        date: new Date(),
                        hoursSpent: 1.5,
                        totalWorkouts: 1,
                        totalExpGained: 50,
                        distribution: [
                            { workoutType: "Arms", numberofWorkouts: 1, timeSpent: 1.5 }
                        ]
                    },
                        {
                        date: new Date(),
                        hoursSpent: 1.5,
                        totalWorkouts: 1,
                        totalExpGained: 50,
                        distribution: [
                            { workoutType: "Legs", numberofWorkouts: 1, timeSpent: 1.5 }
                        ]
                    }
                ]
            },
            { upsert: true, returnDocument: 'after' }
        );

        await UserRoutine.findOneAndUpdate(
            { userId },
            {
                userId,
                routines: [
                    {
                        routineName: "Full Body Beginner",
                        exercises: [
                            { nameOfexercise: "Push-ups", category: "Arms", reps: 10, dayAssigned: "Monday" },
                            { nameOfexercise: "Squats", category: "Legs", reps: 15, dayAssigned: "Monday" }
                        ]
                    }
                ],
                sharedRoutines: [],
                routineHistory: []
            },
            { upsert: true, returnDocument: 'after' }
        );

        await UserSocial.findOneAndUpdate(
            { userId },
            {
                userId,
                friends: [],
                friendRequests: [],
                trainerAssigned: "Coach Leo",
                invitationsSent: []
            },
            { upsert: true, returnDocument: 'after' }
        );

        console.log("Angela Lopez's related data seeded successfully!");
        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        mongoose.connection.close();
    }
};

seedAngelaRelated();