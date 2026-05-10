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
    deleteTask
}