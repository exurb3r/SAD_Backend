const Admin = require('../../models/admin_models/Admins');
const bcrypt = require('bcrypt');

const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find({}, { password: 0 }); 
        res.status(200).json({ admins });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const createAdmin = async (req, res) => {
    try {
        const { firstname, lastname, username, email, password, contactNum, address, branch } = req.body;
 
        if (!firstname || !lastname || !username || !email || !password || !contactNum || !address || !branch) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
 
        const emailExists = await Admin.findOne({ email });
        if (emailExists) return res.status(400).json({ message: 'Email is already in use.' });
 
        const usernameExists = await Admin.findOne({ username });
        if (usernameExists) return res.status(400).json({ message: 'Username is already taken.' });
 
        const hashedPassword = await bcrypt.hash(password, 10);
 
        const newAdmin = await Admin.create({
            firstname,
            lastname,
            username,
            email,
            password: hashedPassword,
            contactNum,
            address,
            branch,
            role: 765
        });
 
        const adminObj = newAdmin.toObject();
        delete adminObj.password;
 
        res.status(201).json({ message: 'Admin created successfully.', admin: adminObj });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
 
// PUT update admin
const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstname, lastname, username, email, contactNum, address, branch, newPassword } = req.body;
 
        const admin = await Admin.findById(id);
        if (!admin) return res.status(404).json({ message: 'Admin not found.' });
 
        // Check unique email/username conflict with other admins
        if (email && email !== admin.email) {
            const emailExists = await Admin.findOne({ email, _id: { $ne: id } });
            if (emailExists) return res.status(400).json({ message: 'Email is already in use.' });
        }
        if (username && username !== admin.username) {
            const usernameExists = await Admin.findOne({ username, _id: { $ne: id } });
            if (usernameExists) return res.status(400).json({ message: 'Username is already taken.' });
        }
 
        const updateFields = { firstname, lastname, username, email, contactNum, address, branch };
 
        if (newPassword && newPassword.trim() !== '') {
            updateFields.password = await bcrypt.hash(newPassword, 10);
        }
 
        const updatedAdmin = await Admin.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true, select: '-password' }
        );
 
        res.status(200).json({ message: 'Admin updated successfully.', admin: updatedAdmin });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
 
        const admin = await Admin.findById(id);
        if (!admin) return res.status(404).json({ message: 'Admin not found.' });
 
        await Admin.findByIdAndDelete(id);
 
        res.status(200).json({ message: 'Admin deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
 
module.exports = { getAllAdmins, createAdmin, updateAdmin, deleteAdmin };