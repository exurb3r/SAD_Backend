const AppUser = require("../../models/user_models/AppUsers");
const UserGameDetails = require("../../models/user_models/UserGameDetails");
const UserProgress = require("../../models/user_models/UserProgress");
const UserPreferenceAndMisc = require("../../models/user_models/UserPreferenceAndMisc");
const UserRoutine = require("../../models/user_models/UserRoutine");
const UserSocial = require("../../models/user_models/UserSocial");


const bcrypt = require('bcrypt');

const getProfileData = async (req,res)=>{
    try{
        const userId = req.user.id;

        const user = await AppUser.findOne({userId});
        const game = await UserGameDetails.findOne({userId});
        const pref = await UserPreferenceAndMisc.findOne({userId});
        const social = await UserSocial.findOne({userId});
        const routine = await UserRoutine.findOne({userId});
        const progress = await UserProgress.findOne({userId});

        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        const friends = social?.friends || [];
        const achievements = game?.achievements || [];
        const sharedRoutines = routine?.sharedRoutines || [];

        const level = game?.level || 1;
        const exp = game?.exp_points || 0;
        const currentStreak = game?.currentStreak || 0;

        const expNext = Math.floor(100 * Math.pow(level,1.5));

        const weeklyWorkouts = new Array(7).fill(0);

        const now = new Date();
        const day = now.getDay();

        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate()-day);
        startOfWeek.setHours(0,0,0,0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate()+6);
        endOfWeek.setHours(23,59,59,999);

        if(progress?.progress){
            progress.progress.forEach(p=>{
                const date = new Date(p.date);
                if(date < startOfWeek || date > endOfWeek) return;
                const index = date.getDay();
                weeklyWorkouts[index]+=p.totalWorkouts;
            });
        }

        const workoutDistributionMap = {
            Chest:0,
            Back:0,
            Shoulders:0,
            Arms:0,
            Abs:0,
            Legs:0
        };

        if(routine?.routineHistory){
            routine.routineHistory.forEach(w=>{
                w.exercises.forEach(ex=>{
                    if(workoutDistributionMap.hasOwnProperty(ex.category)){
                        workoutDistributionMap[ex.category]+=1;
                    }
                });
            });
        }

        const workoutDistribution = Object.values(workoutDistributionMap);

        res.status(200).json({
            username:user.username,
            email:user.email,
            joined:user.joinDate,
            level,
            exp,
            expNext,
            motto:pref?.motto || "",
            streak:currentStreak,
            friends,
            achievements,
            sharedRoutines,
            weeklyWorkouts,
            workoutDistribution
        });

    }catch(err){
        res.status(500).json({message:err.message});
    }
};


const editProfile = async(req,res)=>{
    try{
        const userId = req.user.id;
        const {username,email,password,motto} = req.body;

        if(username){
            await AppUser.updateOne({userId},{username});
        }
        if(email){
            await AppUser.updateOne({userId},{email});
        }
        if(password){
            const hashedPassword = await bcrypt.hash(password, 10);
            await AppUser.updateOne({userId},{password: hashedPassword});
        }
        if(motto){
            await UserPreferenceAndMisc.updateOne(
                {userId},
                {$set:{motto}}
            );
        }
        res.status(200).json({message:"Profile updated"});

    }catch(err){
        res.status(500).json({message:err.message});
    }
};

const sendInvite = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { friendId, date, time, message } = req.body;

        const sender         = await AppUser.findOne({ userId: senderId });
        const receiverSocial = await UserSocial.findOne({ userId: friendId });
        const senderSocial   = await UserSocial.findOne({ userId: senderId });

        if (!receiverSocial) return res.status(404).json({ message: "Friend not found" });

        const invitePayload = {
            userId:        senderId,
            username:      sender.username,
            email:         sender.email,
            friendMessage: message,
            date,
            time
        };

        receiverSocial.invitationsReceived.push(invitePayload);

        senderSocial.invitationsSent.push({
            ...invitePayload,
            userId: friendId 
        });

        await receiverSocial.save();
        await senderSocial.save();

        res.status(200).json({ message: "Invite sent" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const unfriend = async(req,res)=>{
    try{

        const userId = req.user.id;
        const {friendId} = req.params;

        await UserSocial.updateOne(
            {userId},
            {
                $pull:{
                    friends:{userId:friendId}
                }
            }
        );

        await UserSocial.updateOne(
            {userId:friendId},
            {
                $pull:{
                    friends:{userId}
                }
            }
        );
        res.status(200).json({message:"Friend removed"});

    }catch(err){
    res.status(500).json({message:err.message});
    }
};
const getFriendProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const viewerId = req.user.id; 

        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const objectId = new mongoose.Types.ObjectId(userId);

        const user = await AppUser.findOne({
            $or: [{ _id: objectId }, { userId: objectId }]
        });
        if (!user) return res.status(404).json({ message: "User not found" });

        const resolvedId = user.userId;

        const game     = await UserGameDetails.findOne({ userId: resolvedId });
        const pref     = await UserPreferenceAndMisc.findOne({ userId: resolvedId });
        const social   = await UserSocial.findOne({ userId: resolvedId });
        const routine  = await UserRoutine.findOne({ userId: resolvedId });
        const progress = await UserProgress.findOne({ userId: resolvedId });

        const viewerSocial = await UserSocial.findOne({ userId: viewerId });
        const isFriend    = viewerSocial?.friends.some(f => f.userId.toString() === resolvedId?.toString()) ?? false;
        const requestSent = viewerSocial?.invitationsSent.some(i => i.userId.toString() === resolvedId?.toString()) ?? false;

        const friends        = social?.friends        || [];
        const achievements   = game?.achievements     || [];
        const sharedRoutines = routine?.sharedRoutines || [];
        const level          = game?.level            || 1;
        const exp            = game?.exp_points       || 0;
        const expNext        = Math.floor(100 * Math.pow(level, 1.5));
        const currentStreak  = game?.currentStreak    || 0;

        const weeklyWorkouts = new Array(7).fill(0);
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        if (progress?.progress) {
            progress.progress.forEach(p => {
                const date = new Date(p.date);
                if (date < startOfWeek || date > endOfWeek) return;
                weeklyWorkouts[date.getDay()] += p.totalWorkouts;
            });
        }

        const distMap = { Chest: 0, Back: 0, Shoulders: 0, Arms: 0, Abs: 0, Legs: 0 };
        if (routine?.routineHistory) {
            routine.routineHistory.forEach(w => {
                w.exercises.forEach(ex => {
                    if (distMap.hasOwnProperty(ex.category)) distMap[ex.category]++;
                });
            });
        }

        res.status(200).json({
            username: user.username,
            email:    user.email,
            joined:   user.joinDate,
            level, exp, expNext,
            motto:   pref?.motto || "",
            streak:  currentStreak,
            friends, achievements, sharedRoutines,
            weeklyWorkouts,
            workoutDistribution: Object.values(distMap),
            isFriend,   
            requestSent,  
        });

    } catch (err) {
        console.log("getFriendProfile error:", err.message);
        res.status(500).json({ message: err.message });
    }
};
module.exports = { getProfileData, editProfile, sendInvite, unfriend, getFriendProfile };
