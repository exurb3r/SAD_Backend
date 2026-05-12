const UserGameDetails = require("../../models/user_models/UserGameDetails");
const UserProgress = require("../../models/user_models/UserProgress");
const AppUsers = require("../../models/user_models/AppUsers");

const getLeaderboards = async (req,res)=>{
    try{

        const game = await UserGameDetails.find();
        const progress = await UserProgress.find();
        const users = await AppUsers.find({}, "userId username email");

        let userMap = {};
        users.forEach(u=>{
            userMap[u.userId.toString()] = {
                username: u.username,
                email: u.email
            };
        });

        let workoutsMap = {};
        progress.forEach(p=>{
            let total = 0;

            p.progress.forEach(day=>{
                total += day.totalWorkouts || 0;
                });

            workoutsMap[p.userId.toString()] = total;
        });


        
        let result = game.map(g=>{
            const user = userMap[g.userId.toString()] || {};
                    return{
                        username: user.username || "Unknown",
                        email: user.email || "",
                        level: g.level || 0,
                        exp: g.exp_points || 0,
                        streak: g.currentStreak || 0,
                        workouts: workoutsMap[g.userId.toString()] || 0
                    };
        });

        const leaderboard = {
            topLevel:[...result].sort((a,b)=>b.level-a.level).slice(0,10),
            topExp:[...result].sort((a,b)=>b.exp-a.exp).slice(0,10),
            topStreak:[...result].sort((a,b)=>b.streak-a.streak).slice(0,10),
            topWorkouts:[...result].sort((a,b)=>b.workouts-a.workouts).slice(0,10)
        };

        res.json(leaderboard);

    }catch(err){
        res.status(500).json({message:err.message});
    }
};

module.exports = { getLeaderboards };