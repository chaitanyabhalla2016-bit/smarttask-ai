require('dotenv').config();
const Task = require('./models/Task');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require('./routes/taskRoutes');
const app = express();
app.use(cors({
    origin: [
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "https://cbhallamudi.com"
    ]
}));
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;

mongoose.connect(MONGO_URI).then(()=>console.log('Mongoose connected')).catch((err)=>console.log(err));

// Routes
app.use(routes);

app.listen(PORT,()=>{
    console.log(`App is running on the PORT:${PORT}`);
});
