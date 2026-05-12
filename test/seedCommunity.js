require("dotenv").config();
const mongoose = require("mongoose");
const GymCommunityPost = require("../models/admin_models/GymCommunityPost");

mongoose.connect(process.env.DATABASE_URI)
    .then(()=>console.log("MongoDB Connected"))
    .catch(err=>console.log(err));

const seedCommunityPosts = async () => {

    try{
        await GymCommunityPost.deleteMany({});
        await GymCommunityPost.create({
            email: "admin@armztronggym.com",
            post: [
            {
            title: "Welcome to Armztrong Gym Community",
            time: "09:00 AM",
            contents: "We are excited to welcome all new members to the Armztrong Gym community! Train hard and stay consistent."
            },
            {
            title: "New Strength Training Program",
            time: "02:00 PM",
            contents: "A brand new strength training routine is now available in the workout section. Try it out and gain more EXP!"
            },
            {
            title: "Community Fitness Challenge",
            time: "06:00 PM",
            contents: "Join the weekly fitness challenge and compete with other members. Top performers will earn bonus experience points!"
            },
            {
            title: "Trainer Availability",
            time: "08:30 PM",
            contents: "Coach Leo will be available for live coaching sessions this Friday. Book your slot early!"
            }
            ]
        });
        console.log("Community posts seeded successfully!");
        mongoose.connection.close();

    }catch(err){
        console.error(err);
        mongoose.connection.close();
    }
}

seedCommunityPosts();