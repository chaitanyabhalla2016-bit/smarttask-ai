const mongoose = require('mongoose');
// Create Schema
const taskSchema = mongoose.Schema({
    title:{
        type: String,
        required: true,
        trim: true
    }
});
// Create Model
const Task = mongoose.model('Task',taskSchema);
// export model
module.exports = Task;