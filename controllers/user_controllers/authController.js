const User = require('../../models/admin_models/Users');
const AppUser = require('../../models/user_models/AppUsers');
const UserProgress = require('../../models/user_models/UserProgress');
const UserPrefAndMisc = require('../../models/user_models/UserPreferenceAndMisc');
const UserGameDetails = require('../../models/user_models/UserGameDetails');
const UserSocial = require('../../models/user_models/UserSocial');
const Task = require('../../models/user_models/UserNotes');

const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
    try{
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({message: "Email and Password are required"});
        
        const userFound = await AppUser.findOne({email});
        if (!userFound) return res.status(401).json({'message': 'User does not exists'});

        const match = await bcrypt.compare(password, userFound.password);
        if (!match) return res.status(401).json({'message': 'Invalid Password'});

        const token = jwt.sign(
            { id: userFound._id, role: userFound.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            token,
            user: {
                userId: userFound.userId,
                username: userFound.username,
                email: userFound.email,
                role: userFound.role
            } 
        }
        );

    } catch (err) {
        res.status(500).json({ message: err.message});
    }
}

const signup = async(req, res) => {
    try{
        const {username, email, password} = req.body;    
        if(!username ||!email || !password) return res.status(400).json({message: "All credentials are required"});
        const newUser = await AppUser.findOne({email});

        if(newUser) return res.status(400).json({message: "Email is already in use"});

        const registeredUser = await User.findOne({email});
        if (!registeredUser) return res.status(400).json({message: "No corresponding user found in the system. Please contact support."});



        const hashedPassword = await bcrypt.hash(password, 10);

        const addNewUser = await AppUser.create({
            _id: registeredUser._id,
            userId: registeredUser._id,
            username: username,
            email: email,
            password: hashedPassword,
            membershipStatus: registeredUser.membershipStatus,
            role: 452,
            joinDate: new Date()
        });

        

        const [progress, gameDetails, preferences, social, task] = await Promise.all([
            UserProgress.create({ userId: registeredUser._id, progress: [] }),
            UserGameDetails.create({ userId: registeredUser._id, achievements: [], acceptedInvites: [] }),
            UserPrefAndMisc.create({ userId: registeredUser._id, notifications: [] }),
            UserSocial.create({ userId: registeredUser._id, friends: [], friendRequests: [], invitationsSent: [] }),
            Task.create({ userId: registeredUser._id, notes: [] })
        ]);


        res.status(200).json({
            user: {
                id: addNewUser._id,
                username: addNewUser.username,
                email: addNewUser.email
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message});
        console.error(err);
    }
}

module.exports = {login, signup};