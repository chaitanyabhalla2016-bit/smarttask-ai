import CONFIG from './config.js';
const BASE_URL = CONFIG.BASE_URL;
const taskContainer =
    document.querySelector('#task-container');
const taskInput =
    document.querySelector('#task-input');
const addTaskBtn =
    document.querySelector('#add-task-btn');
const alertContainer = document.querySelector('#liveAlertPlaceholder');
let editingTaskId = null;
let isEditing = false;
let allTasks = [];
let currentFilter = "all";
let filterBtns = [...document.querySelectorAll('.filter-btn')];
let alertTimeout;
const warningMark = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-triangle-fill" viewBox="0 0 16 16"> <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/></svg>';
const infoMark = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle-fill" viewBox="0 0 16 16"><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/></svg>';
const dangerMark = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-radioactive" viewBox="0 0 16 16"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8"/><path d="M9.653 5.496A3 3 0 0 0 8 5c-.61 0-1.179.183-1.653.496L4.694 2.992A5.97 5.97 0 0 1 8 2c1.222 0 2.358.365 3.306.992zm1.342 2.324a3 3 0 0 1-.884 2.312 3 3 0 0 1-.769.552l1.342 2.683c.57-.286 1.09-.66 1.538-1.103a6 6 0 0 0 1.767-4.624zm-5.679 5.548 1.342-2.684A3 3 0 0 1 5.005 7.82l-2.994-.18a6 6 0 0 0 3.306 5.728ZM10 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0"/></svg>';
const successMark = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check2-circle" viewBox="0 0 16 16"><path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0"/><path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0z"/></svg>';

function showAlerts(message = "No Proper alert", type = "warning") {
    alertContainer.classList.remove(`opacity-0`);
    alertContainer.classList.add(`alert`, `alert-${type}`,`opacity-100`);
    alertContainer.innerHTML = `${message}`;
    clearTimeout(alertTimeout);
    alertTimeout = setTimeout(function () {
        alertContainer.classList.remove(`alert`, `alert-${type}`,`opacity-100`);
        alertContainer.classList.add(`opacity-0`);
        alertContainer.innerHTML = "";
    }, 4000);
}

// =========================
// RENDER TASKS
// =========================
function loopThroughTasks(filteredArray = []) {
    taskContainer.innerHTML = "";
    if(filteredArray.length === 0){
        taskContainer.innerHTML = `
            <div class="alert alert-secondary">
                No matching tasks found.
            </div>
        `;
        return;
    }
    filteredArray.forEach(task => {
        taskContainer.innerHTML += `
        <div class="card mb-3 px-2 py-1">
            <div
                class="d-flex justify-content-between align-items-center"
            >
                <p
                    class="
                    ${task.completed
                        ?
                        'text-decoration-line-through text-muted'
                        :
                        ''
                    }
                    m-0
                    "
                >
                    ${task.title}
                </p>
                <div>
                    <button
                        class="btn btn-info completed-toggle-btn me-2"
                        data-id="${task._id}"
                    >
                        ${task.completed ? "Undo" : "Mark Done"}
                    </button>
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
// =========================
// APPLY FILTER
// =========================
function applyFilter(){
    let filteredTasks = [];

    if (currentFilter === "completed") {
        filteredTasks =
        allTasks.filter(
            task => task.completed
        );
    } else if(currentFilter === "pending"){
        filteredTasks =
        allTasks.filter(
            task => !task.completed
        );
    } else {
        filteredTasks = allTasks;
    }
    loopThroughTasks(filteredTasks);
    filterBtns.forEach(btn => btn.classList.remove('active-filter'));
    document.querySelector(`#${currentFilter}-tasks-filter`).classList.add('active-filter');
}
// =========================
// FETCH TASKS
// =========================
async function getData(){
    taskContainer.innerHTML = `
        <div class="alert alert-info">
           ${infoMark}&nbsp;Loading tasks...
        </div>
    `;
    try {
        const response =
            await fetch(`${BASE_URL}/tasks`);
        const data = await response.json();
        if (!response.ok) {
            console.log(data.errorMessage);
            showAlerts(`${warningMark}&nbsp;${data.errorMessage}`, "warning");
            return;
        }
        allTasks = data;
        if(allTasks.length === 0){
            taskContainer.innerHTML = `
                <div class="alert alert-secondary">
                    ${warningMark}&nbsp;No tasks yet.
                    Add your first task 🚀
                </div>
            `;
            return;
        }
        applyFilter();
    } catch(error){
        taskContainer.innerHTML = `
            <div class="alert alert-danger">
                ${dangerMark}&nbsp;Unable to fetch tasks. ${error}
            </div>
        `;
        // showAlerts(error.errorMessage, "warning");
    }
}
// =========================
// FILTER BUTTONS
// =========================
document.addEventListener('click', (event) => {
    if(
        event.target.classList.contains(
            'filter-btn'
        )
    ){
        currentFilter =
            event.target.dataset.filter;
        applyFilter();
    }
});
// =========================
// CREATE + UPDATE TASK
// =========================
addTaskBtn.addEventListener("click", async () => {
    const title = taskInput.value.trim();
    if (!title) {
        showAlerts(`${warningMark} &nbsp; No empty input is allowed`, "warning");
        // alert('No empty input is allowed');
        return;
    }
    // =====================
    // UPDATE TASK
    // =====================
    if (isEditing) {
        addTaskBtn.textContent = "Updating Task...";
        addTaskBtn.disabled = true;
        try {
            const response =
            await fetch(
                `${BASE_URL}/tasks/${editingTaskId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":"application/json"
                    },
                    body: JSON.stringify({
                        title
                    })
                }
            );
            const data = await response.json();
            if(!response.ok){
                
                showAlerts(`${warningMark} &nbsp; ${data.errorMessage}`, "warning");
                addTaskBtn.textContent = "Update Task";
                addTaskBtn.disabled = false;
                return;
            }
            
            editingTaskId = null;
            isEditing = false;
            addTaskBtn.innerHTML = "Add Task";
            taskInput.value = "";

            showAlerts(`${successMark}&nbsp;${data.successMessage}`, "success");
            await getData();
        } catch(error){
            console.log(error);
            showAlerts(`${warningMark}&nbsp;${error}`, 'warning');
            // alert("Unable to update task");
        } finally {
            // editingTaskId = null;
            // isEditing = false;
            addTaskBtn.disabled = false;
            addTaskBtn.innerHTML = "Add Task";
            taskInput.value = "";
        }
    }
    // =====================
    // CREATE TASK
    // =====================
    else {
        addTaskBtn.textContent = "Adding task...";
        addTaskBtn.disabled = true;
        try {
            const addTaskResponse =
                await fetch(
                    `${BASE_URL}/tasks`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":"application/json"
                        },
                        body: JSON.stringify({
                            title
                        })
                    }
                );
            const data = await addTaskResponse.json();
            if(!addTaskResponse.ok){
                
                // alert(data.errorMessage);
                showAlerts(`${warningMark} &nbsp; ${data.errorMessage}`, "warning");
                addTaskBtn.textContent = "Add Task";
                addTaskBtn.disabled = false;
                return;
            }
            taskInput.value = "";
            showAlerts(`${successMark}&nbsp;${data.successMessage}`, "success");
            await getData();
        } catch(error){
            console.log(error);
            showAlerts(`${warningMark}&nbsp;${error}`, 'warning');
        } finally {
            addTaskBtn.textContent = "Add Task";
            addTaskBtn.disabled = false;
        }
    }
});
// =========================
// TASK ACTIONS
// =========================
taskContainer.addEventListener(
    'click',
    async (event) => {
    // =====================
    // DELETE
    // =====================
    if(
        event.target.classList.contains(
            "delete-btn"
        )
    ) {
        const deleteBtn = event.target;
        deleteBtn.textContent = "Deleting task...";
        deleteBtn.disabled = true;
        try {
            const taskId =
                deleteBtn.dataset.id;

            const deleteTaskResponse = await fetch(
                `${BASE_URL}/tasks/${taskId}`,
                {
                    method: "DELETE"
                }
            );
            const data = await deleteTaskResponse.json();
            if (!deleteTaskResponse.ok) {
                // alert('Something went wrong!')
                
                console.log(data.errorMessage);
                deleteBtn.textContent = "Delete";
                deleteBtn.disabled = false;
                return;
            }
            showAlerts(`${successMark}&nbsp;${data.successMessage}`, "success");
            await getData();
        } catch(error){
            console.log(error);
            // alert("Unable to delete task");
            showAlerts(`${warningMark}&nbsp;${error}`, 'warning');
            deleteBtn.textContent = "Delete";
            deleteBtn.disabled = false;
        }
    }
    // =====================
    // EDIT
    // =====================
    if(
        event.target.classList.contains(
            "edit-btn"
        )
    ){
        editingTaskId =
            event.target.dataset.id;
        const existingTaskContent =
            event.target.dataset.title;
        addTaskBtn.innerHTML =
            "Update Task";
        taskInput.value =
            existingTaskContent;
        isEditing = true;
    }
    // =====================
    // TOGGLE STATUS
    // =====================
    if(
        event.target.classList.contains(
            "completed-toggle-btn"
        )
    ) {
        const togglingBtn = event.target;
        let ogToggleBtnText = togglingBtn.textContent;
        if (ogToggleBtnText === "Mark Done") {
            togglingBtn.textContent = 'Marking Done...';
        } else {
            togglingBtn.textContent = 'Marking Undone...';
        }
        togglingBtn.disabled = true;
        try {
            const selectedId =
                event.target.dataset.id;
            const response =
                await fetch(
                    `${BASE_URL}/tasks/${selectedId}/toggle-status`,
                    {
                        method: "PATCH"
                    }
                );
            const data = await response.json();
            if(!response.ok){
                    
                    console.log(data.errorMessage);
                    showAlerts(`${warningMark} &nbsp; ${data.errorMessage}`, "warning");
                    // alert(data.errorMessage);
                    togglingBtn.textContent = ogToggleBtnText;
                    togglingBtn.disabled = false;
                return;
            }
            showAlerts(`${successMark}&nbsp;${data.successMessage}`, "success");
            await getData();
        } catch(error){
            console.log(error);
            // alert("Unable to toggle task");
            showAlerts(`${warningMark}&nbsp;${error}`, 'warning');
            togglingBtn.textContent = ogToggleBtnText;
            togglingBtn.disabled = false;
        }
    }
});
// =========================
// INITIAL LOAD
// =========================
getData();