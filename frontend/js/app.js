import CONFIG from './config.js';
const BASE_URL = CONFIG.BASE_URL;
const taskContainer =
    document.querySelector('#task-container');
const taskInput =
    document.querySelector('#task-input');
const addTaskBtn =
    document.querySelector('#add-task-btn');
let editingTaskId = null;
let isEditing = false;
let allTasks = [];
let currentFilter = "all";
let filterBtns = [...document.querySelectorAll('.filter-btn')];

function showAlerts(message = "No Proper alert", type = "warning") {
    console.log("Entered alert function");
    return;
    const alertPlaceholder = document.getElementById('liveAlertPlaceholder')
    const appendAlert = (message, type) => {
        const wrapper = document.createElement('div')
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible" role="alert">`,
            `   <div>${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('')

        alertPlaceholder.append(wrapper)
    }

    // const alertTrigger = document.getElementById('liveAlertBtn')
    // if (alertTrigger) {
    //     alertTrigger.addEventListener('click', () => {
    //         appendAlert('Nice, you triggered this alert message!', 'success')
    //     })
    // }
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
            Loading tasks...
        </div>
    `;
    try {
        const response =
            await fetch(`${BASE_URL}/tasks`);
        allTasks = await response.json();
        if(allTasks.length === 0){
            taskContainer.innerHTML = `
                <div class="alert alert-secondary">
                    No tasks yet.
                    Add your first task 🚀
                </div>
            `;
            return;
        }
        applyFilter();
    } catch(error){
        console.log(error);
        taskContainer.innerHTML = `
            <div class="alert alert-danger">
                Unable to fetch tasks
            </div>
        `;
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
    if(!title){
        alert('No empty input is allowed');
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
            if(!response.ok){
                const errorData =
                    await response.json();
                // alert(errorData.errorMessage);
                showAlerts(errorData.errorMessage,"warning")
                addTaskBtn.textContent = "Update Task";
                addTaskBtn.disabled = false;
                return;
            }
            editingTaskId = null;
            isEditing = false;
            addTaskBtn.innerHTML = "Add Task";
            taskInput.value = "";
            showAlerts(response.json(), "success");
            await getData();
        } catch(error){
            console.log(error);
            alert("Unable to update task");
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
            if(!addTaskResponse.ok){
                const errorData =
                    await addTaskResponse.json();
                alert(errorData.errorMessage);
                showAlerts(errorData.errorMessage, "warning");
                addTaskBtn.textContent = "Add Task";
                addTaskBtn.disabled = false;
                return;
            }
            taskInput.value = "";
            showAlerts(addTaskResponse.json(), "success");
            await getData();
        } catch(error){
            console.log(error);
            alert("Unable to create task");
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
            if (!deleteTaskResponse.ok) {
                alert('Something went wrong!')
                console.log(deleteTaskResponse.json().errorMessage);
                deleteBtn.textContent = "Delete";
                deleteBtn.disabled = false;
            }
            await getData();
        } catch(error){
            console.log(error);
            alert("Unable to delete task");
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
                if(!response.ok){
                    const errorData =
                    await response.json();
                    alert(errorData.errorMessage);
                    togglingBtn.textContent = ogToggleBtnText;
                    togglingBtn.disabled = false;
                return;
            }
            await getData();
        } catch(error){
            console.log(error);
            alert("Unable to toggle task");
            togglingBtn.textContent = ogToggleBtnText;
            togglingBtn.disabled = false;
        }
    }
});
// =========================
// INITIAL LOAD
// =========================
getData();