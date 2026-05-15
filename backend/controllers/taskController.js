const Task = require('../models/Task');

const getTasks = async (req,res)=>{
    try {
        const tasks = await Task.find();
        res.status(200).json(tasks);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            errorMessage:"Something went wrong with server"
        });
    }
}

const createTasks = async (req,res)=>{
    try{
        const title = req.body.title?.trim();
        if(!title){
            return res.status(400).json({errorMessage:"Can't create an empty task"});
        }
        const addTask = await Task.create({title});
        res.status(201).json({successMessage:"Task created.",newTask:addTask});
    }catch(error){
        console.log(error);
        res.status(500).json({errorMessage:"Can't create a new task"});
    }
}    

const updateTask = async (req,res) => {
    try {
        const modifiedTitle = req.body.title?.trim();
        const selectedId = req.params.id;
        if(!modifiedTitle){
            return res.status(400).json({errorMessage:"Task can't be blank or empty."});
        }
        const taskFound = await Task.findByIdAndUpdate(selectedId,{"title":modifiedTitle},{returnDocument:"after"});
        if(!taskFound){
            return res.status(404).json({errorMessage:"Task not found."});
        }
        res.status(200).json({successMessage:"Task Updated",updatedTask:taskFound})
    } catch (error) {
        console.log(error);
        res.status(500).json({errorMessage:"Something went wrong"});
    }
}

const toggleTaskStatus = async (req, res) => {
    try {
        const selectedId = req.params.id;
        const foundTask = await Task.findById(selectedId);
        if (!foundTask) {
            return res.status(404).json({errorMessage:"Task not found in the database!"})
        }
        foundTask.completed = !foundTask.completed;
        await foundTask.save();
        res.status(200).json({ successMessage: "Task Status changed successfully!" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ errorMessage: "Unable to change task status from backend." });
    }
}

const deleteTask = async (req,res)=>{
    try{
        const selectedId = req.params.id;
        const deleteTask = await Task.findByIdAndDelete(selectedId);
        if(!deleteTask){
            return res.status(404).json({errorMessage:"Can't find the task to delete"});
        }
        res.status(200).json({successMessage:"Task removed",deletedTask:deleteTask});
    }catch(error){
        console.log(error)
        res.status(500).json({errorMessage:"Something went wrong!"})
    }

}

module.exports = {
    getTasks,
    createTasks,
    updateTask,
    deleteTask,
    toggleTaskStatus
}