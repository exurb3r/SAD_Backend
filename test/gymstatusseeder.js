const mongoose = require('mongoose');
const UserSideGymLog = require('../models/user_models/UserGymLog');
const Users = require('../models/admin_models/Users');

mongoose.connect('mongodb://127.0.0.1:27017/armztrongGym')
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

const seedUserGymLog = async () => {
    try {
        const user = await Users.findOne({ email: 'juan.delacruz@gmail.com' });
    if (!user) {
        console.log("User not found!");
        mongoose.connection.close();
        return;
    }
    const userId = user._id;
    await UserSideGymLog.findOneAndUpdate(
        { userId },
        {
            userId,
            email: user.email,
            userlog: [

                {
                    date: new Date("2026-02-01"),
                    timeIn: "06:30 AM",
                    timeOut: "08:00 AM",
                    branch: "Armztrong Gym - Taguig"
                },

                {
                    date: new Date("2026-02-03"),
                    timeIn: "07:10 AM",
                    timeOut: "08:45 AM",
                    branch: "Armztrong Gym - Taguig"
                },

                {
                    date: new Date("2026-02-05"),
                    timeIn: "05:30 PM",
                    timeOut: "07:00 PM",
                    branch: "Armztrong Gym - BGC"
                },

                {
                    date: new Date("2026-02-07"),
                    timeIn: "06:20 AM",
                    timeOut: "08:05 AM",
                    branch: "Armztrong Gym - Taguig"
                },

                {
                    date: new Date("2026-02-10"),
                    timeIn: "07:00 PM",
                    timeOut: "08:30 PM",
                    branch: "Armztrong Gym - Makati"
                }

            ]
        },
        { upsert: true, returnDocument: 'after' }
    );
        console.log("User gym logs seeded successfully!");
        mongoose.connection.close();

    } catch (err) {
        console.error(err);
        mongoose.connection.close();
    }
};

seedUserGymLog();