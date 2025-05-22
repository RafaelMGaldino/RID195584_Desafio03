const renderTaskProgressData = (tasks) => {
    const doneTask = tasks.filter(({completed}) => completed).length;
    const totalTask = tasks.length;
    
    const taskProgressDom = document.getElementById('task-progress') || 
                          document.createElement('div');
    taskProgressDom.id = 'task-progress';
    taskProgressDom.textContent = `${doneTask} tarefas concluídas`;
    
    if(!document.getElementById('task-progress')) {
        document.getElementById('todo-footer').appendChild(taskProgressDom);
    }
};

const getTasksFromLocalStorage = () => { // Função para obter as tarefas do localStorage
    const localTasks = JSON.parse(window.localStorage.getItem('tasks'));
    return localTasks ? localTasks : [];
};

const setTasksInLocalStorage = (tasks) => { // Função para armazenar as tarefas no localStorage
    window.localStorage.setItem('tasks', JSON.stringify(tasks)); // Armazena as tarefas no localStorage como uma string JSON
};

const removeTask = (taskId) => {
    const tasks = getTasksFromLocalStorage();
    const updatedTasks = tasks.filter(({id}) => parseInt(id, 10) !== parseInt(taskId)); // Filtra as tarefas para remover a tarefa com o id correspondente  
    setTasksInLocalStorage(updatedTasks)
    renderTaskProgressData(updatedTasks) // Atualiza os dados de progresso das tarefas após a remoção

    const taskElement = document.getElementById(taskId);
    if (taskElement) {
        document.getElementById('todo-list').removeChild(taskElement);
    }
};

const removeDoneTasks = () => {
    const tasks = getTasksFromLocalStorage();
    const updatedTasks = tasks.filter(({completed}) => !completed);
    setTasksInLocalStorage(updatedTasks);
    renderTaskProgressData(updatedTasks);

    // Recarrega a lista
    document.getElementById('todo-list').innerHTML = '';
    updatedTasks.forEach(task => createTaskListItem(task));
};


const createTaskListItem = (task) => {
    const list = document.getElementById('todo-list');
    const toDo = document.createElement('li');
    toDo.id = task.id;
    
    if(task.completed) {
        toDo.classList.add('task-completed');
    }

    const taskContainer = document.createElement('div');
    taskContainer.className = 'task-container';
    
    const descriptionElement = document.createElement('span');
    descriptionElement.className = 'task-description';
    descriptionElement.textContent = task.description;
    taskContainer.appendChild(descriptionElement);
    
    if(task.tag) {
        const tagElement = document.createElement('span');
        tagElement.className = 'task-tag';
        tagElement.textContent = task.tag;
        taskContainer.appendChild(tagElement);
    }

    const completeButton = document.createElement('button');
    
    // Cria o ícone SVG
    const checkIcon = document.createElement('img');
    checkIcon.src = 'img/concluido.svg';
    checkIcon.alt = 'Concluído';
    checkIcon.className = 'check-icon';
    
    // Texto do botão (só visível quando não concluído)
    const buttonText = document.createElement('span');
    buttonText.textContent = 'Concluir';
    
    if(task.completed) {
        completeButton.className = 'complete-btn';
        completeButton.appendChild(checkIcon);
        completeButton.ariaLabel = 'Desfazer conclusão';
    } else {
        completeButton.appendChild(buttonText);
        completeButton.ariaLabel = 'Marcar como concluído';
    }
    
    completeButton.onclick = () => {
        const newCompletedState = !task.completed;
        
        toDo.classList.toggle('task-completed', newCompletedState);
        
        // Limpa o botão
        completeButton.innerHTML = '';
        
        if(newCompletedState) {
            completeButton.className = 'complete-btn';
            const icon = document.createElement('img');
            icon.src = 'img/concluido.svg';
            icon.className = 'check-icon';
            icon.alt = 'Concluído';
            completeButton.appendChild(icon);
            completeButton.ariaLabel = 'Desfazer conclusão';
        } else {
            completeButton.className = '';
            completeButton.textContent = 'Concluir';
            completeButton.ariaLabel = 'Marcar como concluído';
        }
        
        const tasks = getTasksFromLocalStorage();
        const updatedTasks = tasks.map(t => 
            t.id === task.id ? {...t, completed: newCompletedState} : t
        );
        setTasksInLocalStorage(updatedTasks);
        renderTaskProgressData(updatedTasks);
    };

    toDo.appendChild(taskContainer);
    toDo.appendChild(completeButton);
    list.appendChild(toDo);

    return toDo;
};

const getCheckboxInput = ({id, description, checked}) => {
    
    const label = document.createElement('span');
    const wrapper = document.createElement('div');
    const checkboxId = `${id}-checkbox`;

    label.textContent = description;
    label.htmlFor = checkboxId;

  
    wrapper.appendChild(label);

    return label;
};

const getNewTaskId = () => {
    const tasks = getTasksFromLocalStorage();
    const lastId = tasks[tasks.length - 1]?.id;
    return lastId ? lastId + 1 : 1;
};

const getNewTaskData = (event) => {
    const description = event.target.elements.description.value;
    const tag = event.target.elements['task-tag'].value;
    const id = getNewTaskId(); 
    return { description, tag, id };
};

const getCreatedTaskInfo = (event) => new Promise((resolve) => {
    setTimeout(() => {
        resolve(getNewTaskData(event));

    },3000); // Simula um atraso de 3 segundos
});
    


const createTask = async (event) => {
    event.preventDefault();
    document.getElementById('save-task').setAttribute('disabled', true);
    const newTaskData = await getCreatedTaskInfo(event);

    

    const tasks = getTasksFromLocalStorage();
    const updatedTasks = [
        ...tasks,
        { id: newTaskData.id,
         description: newTaskData.description, 
         tag: newTaskData.tag,
        completed: false }
    ];

    setTasksInLocalStorage(updatedTasks);
    createTaskListItem(updatedTasks[updatedTasks.length - 1]);
    renderTaskProgressData(updatedTasks);


     document.getElementById("task-tag").value = '';
    document.getElementById("description").value = '';
    document.getElementById("save-task").removeAttribute('disabled');
};

window.onload = function() {
    const form = document.getElementById('create-todo-form');
    form.addEventListener('submit', createTask);

    const tasks = getTasksFromLocalStorage();
    tasks.forEach((task) => {
        createTaskListItem(task); // Chamada simplificada
    })

    renderTaskProgressData(tasks);
}