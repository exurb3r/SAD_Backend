const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Users = require('../models/admin_models/Users'); 

mongoose.connect('mongodb://127.0.0.1:27017/armztrongGym')
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

const seedUsers = async () => {
    try {
        await Users.deleteMany();

        const hashedPassword = await bcrypt.hash("Password123!", 10);

        const users = [
            {
                firstname: "Juan",
                lastname: "Dela Cruz",
                email: "juan.delacruz@gmail.com",
                password: hashedPassword,
                contactNum: "09123456789",
                address: "Santa Ana, Manila",
                membershipStatus: [
                    {
                        category: "Premium",
                        branch: "Main Branch",
                        startDate: new Date("2026-01-01"),
                        expiryDate: new Date("2026-12-31"),
                        remainingDays: 300
                    }
                ],
                assignedTrainer: "Coach Mark",
                gymId: "GYM1001",
                rfid: "RFID1001"
            },
            {
                firstname: "Maria",
                lastname: "Santos",
                email: "maria.santos@gmail.com",
                password: hashedPassword,
                contactNum: "09987654321",
                address: "Quezon City",
                membershipStatus: [
                    {
                        category: "Standard",
                        branch: "North Branch",
                        startDate: new Date("2025-12-01"),
                        expiryDate: new Date("2026-03-01"),
                        remainingDays: 90
                    }
                ],
                assignedTrainer: "Coach Anna",
                gymId: "GYM1002",
                rfid: "RFID1002"
            },
            {
                firstname: "Carlos",
                lastname: "Reyes",
                email: "carlos.reyes@gmail.com",
                password: hashedPassword,
                contactNum: "09112223344",
                address: "Makati City",
                membershipStatus: [
                    {
                        category: "Basic",
                        branch: "South Branch",
                        startDate: new Date("2025-06-01"),
                        expiryDate: new Date("2025-09-01"),
                        remainingDays: 0
                    }
                ],
                assignedTrainer: null,
                gymId: "GYM1003"
            },
            {
                firstname: "Angela",
                lastname: "Lopez",
                email: "angela.lopez@gmail.com",
                password: hashedPassword,
                contactNum: "09223334455",
                address: "Pasig City",
                membershipStatus: [
                    {
                        category: "Premium",
                        branch: "Main Branch",
                        startDate: new Date("2026-02-01"),
                        expiryDate: new Date("2027-02-01"),
                        remainingDays: 365
                    }
                ],
                assignedTrainer: "Coach Leo",
                gymId: "GYM1004",
                rfid: "RFID1004"
            }
        ];

        await Users.insertMany(users);

        console.log("Users Seeded Successfully");
        mongoose.connection.close();
    } catch (error) {
        console.log(error);
        mongoose.connection.close();
    }
};
seedUsers();