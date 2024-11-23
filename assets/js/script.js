document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('new-task');
    const taskDateInput = document.getElementById('task-date');
    const taskCostInput = document.getElementById('task-cost');
    const addTaskButton = document.getElementById('add-task');
    const taskList = document.getElementById('task-list');
    const completedTaskList = document.getElementById('completed-task-list');
    const messageDiv = document.getElementById('message');

    // Selecionar elementos do modal
    const confirmationModal = document.getElementById('confirmation-modal');
    const confirmDeleteButton = document.getElementById('confirm-delete');
    const cancelDeleteButton = document.getElementById('cancel-delete');

    let tasks = [];
    let completedTasks = [];
    let currentTaskToDelete = null; // Variável para armazenar a tarefa a ser excluída

    // Adicionar evento para formatar o custo enquanto digita
    taskCostInput.addEventListener('input', formatCostInput);

    // Eventos dos botões do modal
    confirmDeleteButton.addEventListener('click', confirmDeletion);
    cancelDeleteButton.addEventListener('click', hideConfirmationModal);

    // Carregar tarefas ao iniciar
    loadTasks();

    // Eventos
    addTaskButton.addEventListener('click', addTask);

    taskInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Função para adicionar uma nova tarefa
    function addTask() {
        const taskName = taskInput.value.trim();
        const taskDate = taskDateInput.value;
        const taskCostFormatted = taskCostInput.value;
        const taskCost = parseCost(taskCostFormatted);

        // Validações
        if (taskName === '') {
            messageDiv.textContent = 'Por favor, insira o nome da tarefa.';
            return;
        }

        if (tasks.some(t => t.name.toLowerCase() === taskName.toLowerCase()) ||
            completedTasks.some(t => t.name.toLowerCase() === taskName.toLowerCase())) {
            messageDiv.textContent = 'Já existe uma tarefa com esse nome.';
            return;
        }

        // Limpar mensagens de erro
        messageDiv.textContent = '';

        // Criar objeto de tarefa
        const task = {
            id: Date.now(),
            name: taskName,
            date: taskDate,
            cost: taskCost
        };

        // Adicionar à lista de tarefas pendentes
        tasks.push(task);
        renderTasks();

        // Limpar campos de entrada
        taskInput.value = '';
        taskDateInput.value = '';
        taskCostInput.value = '';
        taskInput.focus();
    }

    // Função para renderizar todas as tarefas
    function renderTasks() {
        // Limpar listas atuais
        taskList.innerHTML = '';
        completedTaskList.innerHTML = '';

        // Renderizar tarefas pendentes
        tasks.forEach(task => {
            const li = createTaskElement(task, false);
            taskList.appendChild(li);
        });

        // Renderizar tarefas concluídas
        completedTasks.forEach(task => {
            const li = createTaskElement(task, true);
            completedTaskList.appendChild(li);
        });

        // Salvar no Local Storage
        saveTasks();
    }

    // Função para criar elementos de tarefa
    function createTaskElement(task, isCompleted) {
        const li = document.createElement('li');
        li.className = 'task-item';

        // Destacar tarefas com custo >= R$1.000,00
        if (task.cost >= 1000) {
            li.style.backgroundColor = '#fff4e5'; // Fundo amarelo claro
        }

        // Checkbox para marcar como concluída/restaurar
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = isCompleted;
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                // Mover para tarefas concluídas
                tasks = tasks.filter(t => t.id !== task.id);
                completedTasks.push(task);
            } else {
                // Restaurar para tarefas pendentes
                completedTasks = completedTasks.filter(t => t.id !== task.id);
                tasks.push(task);
            }
            renderTasks();
        });

        // Elementos de texto
        const nameElement = document.createElement('span');
        nameElement.textContent = task.name;

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'task-details';

        if (task.date) {
            const dateSpan = document.createElement('span');
            dateSpan.textContent = 'Data Limite: ' + formatDate(task.date);
            detailsDiv.appendChild(dateSpan);
        }

        if (task.cost) {
            const costSpan = document.createElement('span');
            costSpan.textContent = 'Custo: R$ ' + formatCostToDisplay(task.cost);
            detailsDiv.appendChild(costSpan);
        }

        // Div para botões de ação
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

        // Botão de editar (somente para tarefas pendentes)
        if (!isCompleted) {
            const editButton = document.createElement('button');
            const editIcon = document.createElement('img');
            editIcon.src = 'assets/icons/edit.svg';
            editIcon.alt = 'Editar';
            editButton.appendChild(editIcon);
            editButton.addEventListener('click', () => {
                enterEditMode(li, task);
            });
            actionsDiv.appendChild(editButton);
        }

        // Botão de excluir
        const deleteButton = document.createElement('button');
        const deleteIcon = document.createElement('img');
        deleteIcon.src = 'assets/icons/delete.svg';
        deleteIcon.alt = 'Excluir';
        deleteButton.appendChild(deleteIcon);
        deleteButton.addEventListener('click', () => {
            excluirTarefa(task, isCompleted);
        });
        actionsDiv.appendChild(deleteButton);

        // Adicionar elementos ao li
        li.appendChild(checkbox);
        li.appendChild(nameElement);
        li.appendChild(detailsDiv);
        li.appendChild(actionsDiv);

        // Tornar o item arrastável apenas se não for concluído
        if (!isCompleted) {
            li.setAttribute('draggable', true);
            // Eventos de drag and drop
            li.addEventListener('dragstart', dragStart);
            li.addEventListener('dragover', dragOver);
            li.addEventListener('drop', drop);
        } else {
            // Estilizar tarefa concluída
            li.classList.add('completed');
        }

        return li;
    }

    // Função para entrar no modo de edição
    function enterEditMode(li, task) {
        // Desabilitar arrastar durante a edição
        li.setAttribute('draggable', false);

        // Limpar conteúdo atual
        li.innerHTML = '';

        // Contêiner para os campos de entrada
        const inputsContainer = document.createElement('div');
        inputsContainer.className = 'edit-inputs';

        // Campo de entrada para o nome
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = task.name;
        nameInput.className = 'edit-input name-input';
        nameInput.placeholder = 'Nome da Tarefa';
        inputsContainer.appendChild(nameInput);

        // Campo de entrada para a data
        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.value = task.date;
        dateInput.className = 'edit-input date-input';
        inputsContainer.appendChild(dateInput);

        // Campo de entrada para o custo
        const costInput = document.createElement('input');
        costInput.type = 'text';
        costInput.value = formatCostToDisplay(task.cost);
        costInput.className = 'edit-input cost-input';
        costInput.placeholder = 'Custo (R$)';
        // Adicionar evento para formatar enquanto digita
        costInput.addEventListener('input', formatCostInput);

        inputsContainer.appendChild(costInput);

        // Adicionar o contêiner de inputs ao li
        li.appendChild(inputsContainer);

        // Div para botões de ação
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Salvar';
        saveButton.className = 'save-button';
        saveButton.addEventListener('click', () => {
            saveEdit(li, task, nameInput.value.trim(), dateInput.value, costInput.value);
        });

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancelar';
        cancelButton.className = 'cancel-button';
        cancelButton.addEventListener('click', () => {
            renderTasks();
        });

        actionsDiv.appendChild(saveButton);
        actionsDiv.appendChild(cancelButton);

        li.appendChild(actionsDiv);
    }

    // Função para salvar as alterações da edição
    function saveEdit(li, task, newName, newDate, newCostFormatted) {
        // Converter o custo formatado para número
        const newCost = parseCost(newCostFormatted);

        // Verificar duplicação de nome
        if (tasks.some(t => t.name.toLowerCase() === newName.toLowerCase() && t.id !== task.id) ||
            completedTasks.some(t => t.name.toLowerCase() === newName.toLowerCase())) {
            alert('Já existe uma tarefa com esse nome.');
            return;
        }

        // Atualizar os valores da tarefa
        task.name = newName;
        task.date = newDate || '';
        task.cost = newCost;

        // Re-renderizar as tarefas
        renderTasks();
    }

    // Função para excluir uma tarefa
    function excluirTarefa(task, isCompleted) {
        // Armazenar a tarefa e seu estado atual
        currentTaskToDelete = { task, isCompleted };
        // Exibir o modal de confirmação
        showConfirmationModal();
    }

    // Função para exibir o modal de confirmação
    function showConfirmationModal() {
        confirmationModal.style.display = 'block';
    }

    // Função para ocultar o modal de confirmação
    function hideConfirmationModal() {
        confirmationModal.style.display = 'none';
        currentTaskToDelete = null;
    }

    // Função para confirmar a exclusão
    function confirmDeletion() {
        const { task, isCompleted } = currentTaskToDelete;

        if (isCompleted) {
            completedTasks = completedTasks.filter(t => t.id !== task.id);
        } else {
            tasks = tasks.filter(t => t.id !== task.id);
        }

        hideConfirmationModal();
        renderTasks();
    }

    // Funções de formatação

    function formatCostInput(e) {
        let value = e.target.value;

        // Remover todos os caracteres que não sejam dígitos
        value = value.replace(/\D/g, '');

        // Remover zeros à esquerda
        value = value.replace(/^0+/, '');

        // Se não houver valor, não formatar
        if (value.length === 0) {
            e.target.value = '';
            return;
        }

        // Garantir que o valor tenha pelo menos 4 dígitos
        value = value.padStart(4, '0');

        // Separar parte inteira e decimal
        let integerPart = value.slice(0, -2);
        let decimalPart = value.slice(-2);

        // Adicionar pontos como separadores de milhar
        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        // Combinar partes e adicionar vírgula como separador decimal
        let formattedValue = integerPart + ',' + decimalPart;

        // Atualizar o valor do campo de entrada
        e.target.value = formattedValue;
    }

    function parseCost(formattedValue) {
        // Remover pontos (separadores de milhar)
        let value = formattedValue.replace(/\./g, '');
        // Substituir vírgula por ponto para usar parseFloat corretamente
        value = value.replace(',', '.');
        // Converter para número
        let numberValue = parseFloat(value);
        return isNaN(numberValue) ? 0 : numberValue;
    }

    function formatCostToDisplay(value) {
        // Converter o número para string com duas casas decimais
        let valueString = value.toFixed(2);

        // Substituir ponto por vírgula para separador decimal
        valueString = valueString.replace('.', ',');

        // Adicionar pontos como separadores de milhar
        let parts = valueString.split(',');
        let integerPart = parts[0];
        let decimalPart = parts[1];

        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        return integerPart + ',' + decimalPart;
    }

    // Funções de drag and drop
    let draggedItem = null;

    function dragStart(e) {
        draggedItem = this;
        e.dataTransfer.effectAllowed = 'move';
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function drop(e) {
        e.preventDefault();
        if (draggedItem !== this) {
            const items = Array.from(taskList.children);
            const draggedIndex = items.indexOf(draggedItem);
            const targetIndex = items.indexOf(this);

            // Reordenar o array de tarefas
            tasks.splice(targetIndex, 0, tasks.splice(draggedIndex, 1)[0]);

            renderTasks();
        }
    }

    // Funções de persistência no Local Storage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
    }

    function loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        const savedCompletedTasks = localStorage.getItem('completedTasks');

        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        }

        if (savedCompletedTasks) {
            completedTasks = JSON.parse(savedCompletedTasks);
        }

        renderTasks();
    }

    // Função para formatar a data no formato DD/MM/AAAA
    function formatDate(dateStr) {
        const parts = dateStr.split('-');
        return parts[2] + '/' + parts[1] + '/' + parts[0];
    }
});
