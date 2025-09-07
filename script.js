// DOM Elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const pendingList = document.getElementById('pendingList');
const completedList = document.getElementById('completedList');
const dateElement = document.getElementById('date');
const timeElement = document.getElementById('time');

function init() {
    loadTasks();
    
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    updateDateTime();
    setInterval(updateDateTime, 1000);
}
function updateDateTime() {
    const now = new Date();
    
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    dateElement.textContent = now.toLocaleDateString('en-US', options);
    
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    timeElement.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
}
  
function addTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        showNotification('Please enter a task', 'warning');
        return;
    }
    
    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    const taskElement = createTaskElement(task);
    pendingList.appendChild(taskElement);
    
    saveTasks();
    
    taskInput.value = '';
    
    showNotification('Task added successfully!', 'success');
}

function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;
    
    const createdAt = new Date(task.createdAt);
    const timeString = createdAt.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    
    li.innerHTML = `
        <div class="task-content">
            <div class="task-text">${escapeHtml(task.text)}</div>
            <div class="task-time">Added: ${timeString}</div>
        </div>
        <div class="task-actions">
            <button class="complete-btn" title="Mark as ${task.completed ? 'pending' : 'complete'}">
                <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
            </button>
            <button class="edit-btn" title="Edit task">
                <i class="fas fa-edit"></i>
            </button>
            <button class="delete-btn" title="Delete task">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    const completeBtn = li.querySelector('.complete-btn');
    const editBtn = li.querySelector('.edit-btn');
    const deleteBtn = li.querySelector('.delete-btn');
    
    completeBtn.addEventListener('click', () => toggleTaskStatus(li, task));
    editBtn.addEventListener('click', () => editTask(li, task));
    deleteBtn.addEventListener('click', () => deleteTask(li, task.id));
    
    return li;
}

function toggleTaskStatus(taskElement, task) {
    task.completed = !task.completed;
    
    if (task.completed) {
        task.completedAt = new Date().toISOString();
        completedList.appendChild(taskElement);
        showNotification('Task completed!', 'success');
    } else {
        pendingList.appendChild(taskElement);
        showNotification('Task marked as pending', 'info');
    }
    
    const completeBtn = taskElement.querySelector('.complete-btn');
    const icon = completeBtn.querySelector('i');
    icon.className = task.completed ? 'fas fa-undo' : 'fas fa-check';
    completeBtn.title = `Mark as ${task.completed ? 'pending' : 'complete'}`;
    
    taskElement.classList.toggle('completed');
    
    saveTasks();
}

function editTask(taskElement, task) {
    const taskText = taskElement.querySelector('.task-text');
    const currentText = taskText.textContent.trim();
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'edit-input';
    
    taskText.textContent = '';
    taskText.appendChild(input);
    input.focus();
    
    const saveEdit = () => {
        const newText = input.value.trim();
        
        if (newText && newText !== currentText) {
            task.text = newText;
            taskText.textContent = newText;
            saveTasks();
            showNotification('Task updated!', 'success');
        } else {
            taskText.textContent = currentText;
        }
    };
    
    input.addEventListener('blur', saveEdit);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        }
    });
}

function deleteTask(taskElement, taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        taskElement.remove();
        
        saveTasks();
        showNotification('Task deleted', 'info');
    }
}

function saveTasks() {
    const tasks = [];
    
    document.querySelectorAll('#pendingList .task-item').forEach(taskElement => {
        tasks.push({
            id: taskElement.dataset.id,
            text: taskElement.querySelector('.task-text').textContent,
            completed: false,
            createdAt: new Date().toISOString() 
        });
    });
    
    document.querySelectorAll('#completedList .task-item').forEach(taskElement => {
        tasks.push({
            id: taskElement.dataset.id,
            text: taskElement.querySelector('.task-text').textContent,
            completed: true,
            createdAt: new Date().toISOString(), 
            completedAt: new Date().toISOString()
        });
    });
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    
    if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        
        tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            
            if (task.completed) {
                completedList.appendChild(taskElement);
            } else {
                pendingList.appendChild(taskElement);
            }
        });
    } else {

        const sampleTasks = [
            { id: 1, text: 'Create a new task', completed: false, createdAt: new Date().toISOString() },
            { id: 2, text: 'Mark a task as complete', completed: true, createdAt: new Date().toISOString(), completedAt: new Date().toISOString() },
            { id: 3, text: 'Edit or delete a task', completed: false, createdAt: new Date().toISOString() }
        ];
        
        sampleTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            
            if (task.completed) {
                completedList.appendChild(taskElement);
            } else {
                pendingList.appendChild(taskElement);
            }
        });
        
        saveTasks();
    }
    
    updateEmptyState();
}

function showNotification(message, type) {

    console.log(`[${type.toUpperCase()}] ${message}`);
}


function updateEmptyState() {
    const pendingEmpty = pendingList.children.length === 0;
    const completedEmpty = completedList.children.length === 0;
    
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

document.addEventListener('DOMContentLoaded', init);
