const Admin = require('../../models/admin_models/Admins');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
    try{
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({message: "Email and Password are required"});
        
        const adminFound = await Admin.findOne({email});
        if (!adminFound) return res.status(401).json({'message': 'User does not exists'});

        const match = await bcrypt.compare(password, adminFound.password);
        if (!match) return res.status(401).json({'message': 'Invalid Password'});

        const token = jwt.sign(
            { id: adminFound._id, role: adminFound.role, branch: adminFound.branch, email: adminFound.email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: 60 * 60 * 24 } 
        );
        res.json({
            token,
            user: {
                id: adminFound._id,
                username: adminFound.username,
                email: adminFound.email,
                role: adminFound.role,
                branch: adminFound.branch
            } 
        });

        console.log("Admin logged in successfully");

    } catch (err) {
        res.status(500).json({ message: err.message});
    }
}

module.exports = {login};