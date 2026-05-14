import CONFIG from './config.js';
const BASE_URL = CONFIG.BASE_URL;
const taskContainer = document.querySelector('#task-container');
const taskInput = document.querySelector('#task-input');
const addTaskBtn = document.querySelector('#add-task-btn');
let editingTaskId = null;
let isEditing = false;

async function getData(){
    taskContainer.innerHTML = "";
    taskContainer.innerHTML = `
    <div class="alert alert-info">
    Loading tasks...
    </div>
    `;
    const response = await fetch(`${BASE_URL}/tasks`);
    const data = await response.json();
    if (data.length === 0) {
        taskContainer.innerHTML = `
        <div class="alert alert-secondary">
        "No tasks yet. Add your first task 🚀"
        </div>
        `;
        return;
    }
    console.log(data);
    taskContainer.innerHTML = "";
    data.forEach(task => {
        taskContainer.innerHTML += `
        <div class="card mb-3 p-3">
            <div class="d-flex justify-content-between align-items-center">
                <p class="m-0">${task.title}</p>
                <div>
                    <button
                    class="btn btn-warning edit-btn me-2"
                    data-id="${task._id}"
                    data-title="${task.title}"
                    >
                    Edit
                    </button>

                    <button
                    class="btn btn-danger delete-btn"
                    data-id="${task._id}"
                    >
                    Delete
                    </button>
                </div>
            </div>
        </div>
        `;
    });
}

getData();

addTaskBtn.addEventListener("click",async () => {
    const title = taskInput.value.trim();
    if(!title){
        alert('No empty input is allowed');
        return;
    }
    if(isEditing){
        try{
            const response = await fetch(`${BASE_URL}/tasks/${editingTaskId}`,{
                method: "PUT",
                headers:{
                    "Content-Type":"application/json",
                },
                body: JSON.stringify({
                    "title":title
                })
            });
            if(!response.ok){
                const errorData = await response.json();
                alert(errorData.message);
                return;
            }
            editingTaskId = null;
            isEditing = false;
            addTaskBtn.innerHTML = "Add Task";
            await getData();
            taskInput.value = "";
        }catch(err){
            alert("Update failed!");
            console.log(err);
        }
    }else{
        try{
            const addTaskResponse = await fetch(`${BASE_URL}/tasks`,{
                method: "POST",
                headers: {
                    "content-type":"application/json"
                },
                body: JSON.stringify({
                    "title":title
                })
            });
            if(!addTaskResponse.ok){
                const errorData = await addTaskResponse.json();
                alert(errorData.message);
                return;
            }
            await getData();
            taskInput.value = "";
        }catch(err){
            alert("Could not create a note");
            console.log(err);
        }
    }
});

// Delete query from the frontend
taskContainer.addEventListener('click',async (event) => {
    if(event.target.classList.contains("delete-btn")){
        const taskId = event.target.dataset.id;
        await fetch(`${BASE_URL}/tasks/${taskId}`, {
            method: "DELETE"
        });
        getData();
    }
});

// Updating/Editing a task
taskContainer.addEventListener('click',async (event) => {
    if(event.target.classList.contains("edit-btn")){
        editingTaskId = event.target.dataset.id;
        const existingTaskContent = event.target.dataset.title;
        addTaskBtn.innerHTML = "Update Task"
        taskInput.value = existingTaskContent;
        isEditing = true;
    }
});