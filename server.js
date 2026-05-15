require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const connectDB = require('./config/dbNotes');
const mongoose = require('mongoose');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const cookieParser = require('cookie-parser');

connectDB();

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use('/admins', require('./routes/admins'));
app.use('/users', require('./routes/users'));
app.use('/system', require('./routes/system'));
app.use('/superadmin', require('./routes/superadmin'));

mongoose.connection.once('open', () => {
    console.log('Connected to Database');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    });
});