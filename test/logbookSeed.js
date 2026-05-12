const mongoose = require("mongoose");
const UserGymLog = require("../models/admin_models/UserGymLog"); // adjust path if needed

mongoose.connect("mongodb://127.0.0.1:27017/armztrongGym")
.then(() => {
    console.log("Connected to MongoDB");
})
.catch(err => {
    console.log(err);
});

const logs = [
    {
        firstname: "John",
        lastname: "Doe",
        email: "john@example.com",
        timeIn: "07:10",
        timeOut: "08:30",
        branch: "General Luna"
    },
    {
        firstname: "Maria",
        lastname: "Santos",
        email: "maria@example.com",
        timeIn: "09:00",
        timeOut: "10:15",
        branch: "Rimando Road"
    },
    {
        firstname: "Kevin",
        lastname: "Reyes",
        email: "kevin@example.com",
        timeIn: "06:45",
        timeOut: "08:00",
        branch: "General Luna"
    },
    {
        firstname: "Angela",
        lastname: "Lopez",
        email: "angela@example.com",
        timeIn: "05:30",
        timeOut: "06:45",
        branch: "Rimando Road"
    },
    {
        firstname: "David",
        lastname: "Tan",
        email: "david@example.com",
        timeIn: "18:00",
        timeOut: "19:30",
        branch: "General Luna"
    }
];

async function seedDB(){
    try{
        await UserGymLog.insertMany(logs);
        console.log("Seed data inserted");
    }catch(err){
        console.log(err);
    }finally{
        mongoose.connection.close();
    }
}

seedDB();