const AppUser = require("../../models/user_models/AppUsers");
const UserGameDetails = require("../../models/user_models/UserGameDetails");
const UserSocial = require("../../models/user_models/UserSocial");
const GymCommunityPost = require("../../models/admin_models/GymCommunityPost");

const getCommunityUsers = async (req,res) => {
    try{

        const userId = req.user.id;

        const social = await UserSocial.findOne({userId});

        const friends = social?.friends.map(f => f.email) || [];
        const sent = social?.invitationsSent.map(i => i.email) || [];

        const users = await AppUser.find({}, "username email");
        const gameDetails = await UserGameDetails.find({});

        let result = [];

        for(let user of users){

            if(user._id.toString() === userId) continue;
            if(friends.includes(user.email)) continue;

            const game = gameDetails.find(
                g => g.userId.toString() === user._id.toString()
            );

            result.push({
                username:user.username,
                email:user.email,
                level:game?.level || 1,
                requestSent: sent.includes(user.email)
            });

        }

        res.json(result);

    }catch(err){
        res.status(500).json({message:err.message})
    }
}

const addFriendRequest = async (req,res) => {

    try{
        const senderId = req.user.id;
        const {email} = req.body;

        const receiver = await AppUser.findOne({email});
        if(!receiver) return res.status(404).json({message:"User not found"});
        const receiverSocial = await UserSocial.findOne({userId:receiver._id});
        const senderSocial = await UserSocial.findOne({userId:senderId});
        const sender = await AppUser.findById(senderId);

        receiverSocial.friendRequests.push({
            userId:senderId,
            username:sender.username,
            email:sender.email
        });

        senderSocial.invitationsSent.push({
            userId:receiver._id,
            username:receiver.username,
            email:receiver.email
        });

        await receiverSocial.save();
        await senderSocial.save();

        res.json({message:"Friend request sent"});

    }catch(err){
    res.status(500).json({message:err.message})
    }

}



const cancelFriendRequest = async (req,res)=>{

    try{

        const senderId = req.user.id;
        const {email} = req.body;

        const receiver = await AppUser.findOne({email});

        const receiverSocial = await UserSocial.findOne({userId:receiver._id});
        const senderSocial = await UserSocial.findOne({userId:senderId});

        receiverSocial.friendRequests =
        receiverSocial.friendRequests.filter(
        r => r.userId.toString() !== senderId
        );

        senderSocial.invitationsSent =
            senderSocial.invitationsSent.filter(
                r => r.email !== email
            );

        await receiverSocial.save();
        await senderSocial.save();

        res.json({message:"Request cancelled"})

    }catch(err){
    res.status(500).json({message:err.message})
    }

}


const getAnnouncements = async (req,res)=>{

    try{

        const posts = await GymCommunityPost.find();

        let result=[];

        posts.forEach(user=>{
            user.post.forEach(p=>{
                result.push({
                    title:p.title,
                    date:p.date,
                    time:p.time,
                    contents:p.contents,
                    email:user.email
                })
            })
        })

        res.json(result);

    }catch(err){
    res.status(500).json({message:err.message})
    }

}

module.exports = { getCommunityUsers, getAnnouncements, addFriendRequest, cancelFriendRequest };