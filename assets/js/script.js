document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('new-task');
    const taskDateInput = document.getElementById('task-date');
    const taskCostInput = document.getElementById('task-cost');
    const addTaskButton = document.getElementById('add-task');
    const taskListPending = document.getElementById('task-list-pending');
    const taskListCompleted = document.getElementById('task-list-completed');
    const messageDiv = document.getElementById('message');
    const confirmationModal = document.getElementById('confirmation-modal');
    const confirmDeleteButton = document.getElementById('confirm-delete');
    const cancelDeleteButton = document.getElementById('cancel-delete');
    const toggleCompletedButton = document.getElementById('toggle-completed');
    const includeRecordDiv = document.getElementById('include-record');
    const includeRecordButton = document.getElementById('include-record-button');
    const taskInputForm = document.getElementById('task-input-form');
    let showCompleted = false;
    let tasks = [];
    let currentTaskToDelete = null;

    taskCostInput.addEventListener('input', formatCostInput);

    confirmDeleteButton.addEventListener('click', confirmDeletion);
    cancelDeleteButton.addEventListener('click', hideConfirmationModal);

    loadTasks();

    addTaskButton.addEventListener('click', addTask);

    taskInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    includeRecordButton.addEventListener('click', () => {
        taskInputForm.scrollIntoView({ behavior: 'smooth' });
        taskInput.focus();
    });

    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    function toggleIncludeRecordButton() {
        if (!isElementInViewport(taskInputForm)) {
            includeRecordDiv.style.display = 'block';
        } else {
            includeRecordDiv.style.display = 'none';
        }
    }

    window.addEventListener('scroll', toggleIncludeRecordButton);
    window.addEventListener('resize', toggleIncludeRecordButton);

    toggleIncludeRecordButton();

    // Adicionar evento ao botão para mostrar/ocultar tarefas concluídas
    toggleCompletedButton.addEventListener('click', () => {
        showCompleted = !showCompleted;
        toggleCompletedButton.textContent = showCompleted ? 'Ocultar Tarefas Concluídas' : 'Mostrar Tarefas Concluídas';
        toggleCompletedButton.classList.toggle('active', showCompleted);

        if (showCompleted) {
            taskListCompleted.classList.add('show');
            taskListCompleted.parentNode.insertBefore(includeRecordDiv, taskListCompleted.nextSibling);
        } else {
            taskListCompleted.classList.remove('show');
            toggleCompletedButton.parentNode.insertBefore(includeRecordDiv, toggleCompletedButton.nextSibling);
        }
    });

    // Função para adicionar uma nova tarefa
    function addTask() {
        const taskName = taskInput.value.trim();
        const taskDate = taskDateInput.value || null;
        const taskCostFormatted = taskCostInput.value;
        const taskCost = parseCost(taskCostFormatted);

        // Validações
        if (taskName === '') {
            messageDiv.textContent = 'Por favor, insira o nome da tarefa.';
            return;
        }

        // Limpar mensagens de erro
        messageDiv.textContent = '';

        // Dados a serem enviados
        const taskData = {
            nome: taskName,
            custo: taskCost,
            data_limite: taskDate
        };

        fetch('api.php?action=add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Limpar campos de entrada
                    taskInput.value = '';
                    taskDateInput.value = '';
                    taskCostInput.value = '';
                    taskInput.focus();

                    loadTasks();
                } else if (data.error) {
                    messageDiv.textContent = data.error;
                }
            })
            .catch(error => {
                if (error.error) {
                    messageDiv.textContent = error.error;
                } else {
                    messageDiv.textContent = 'Erro ao adicionar tarefa.';
                }
                console.error('Erro ao adicionar tarefa:', error);
            });
    }

    // Função para carregar as tarefas
    function loadTasks() {
        fetch('api.php?action=list')
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
            .then(data => {
                if (data.pendentes && data.concluidas) {
                    tasks = [...data.pendentes, ...data.concluidas.map(t => ({ ...t, concluida: true }))];
                    renderTasks(data.pendentes, data.concluidas);
                } else {
                    messageDiv.textContent = 'Dados de tarefas inválidos.';
                }
            })
            .catch(error => {
                if (error.error) {
                    messageDiv.textContent = error.error;
                } else {
                    messageDiv.textContent = 'Erro ao carregar tarefas.';
                }
                console.error('Erro ao carregar tarefas:', error);
            });
    }

    // Função para renderizar as tarefas
    function renderTasks(pendentes, concluidas) {
        taskListPending.innerHTML = '';
        taskListCompleted.innerHTML = '';
    
        // Renderizar tarefas pendentes
        pendentes.forEach(task => {
            const li = createTaskElement(task, false);
            li.setAttribute('draggable', 'true'); // Tornar arrastável
            li.addEventListener('dragstart', dragStart);
            li.addEventListener('dragover', dragOver);
            li.addEventListener('drop', drop);
            li.addEventListener('dragend', handleDragEnd);
            taskListPending.appendChild(li);
        });
    
        // Renderizar tarefas concluídas
        concluidas.forEach(task => {
            const li = createTaskElement(task, true);
            taskListCompleted.appendChild(li);
        });
    }    

    // Função para criar elementos de tarefa
    function createTaskElement(task, isCompleted) {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.dataset.id = task.id;
    
        // Destacar tarefas com custo >= R$1.000,00
        if (task.custo !== undefined && parseFloat(task.custo) >= 1000) {
            li.style.backgroundColor = '#fff4e5'; // Fundo amarelo claro
        }
    
        // Criar o checkbox apenas para tarefas pendentes
        if (!isCompleted) {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-checkbox';
            checkbox.checked = false;
            checkbox.addEventListener('change', () => {
                toggleTaskCompletion(task.id, checkbox.checked, checkbox);
            });
            li.appendChild(checkbox);
        }
    
        // Contêiner principal da tarefa
        const taskContent = document.createElement('div');
        taskContent.className = 'task-content';
    
        // Nome da tarefa
        const nameElement = document.createElement('div');
        nameElement.className = 'task-name';
        nameElement.textContent = task.nome;
        if (isCompleted) {
            nameElement.classList.add('completed');
        }
        taskContent.appendChild(nameElement);
    
        // Detalhes da tarefa
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'task-details';
    
        // Data Limite
        const dateRow = document.createElement('div');
        dateRow.className = 'task-detail-row';
    
        const dateLabel = document.createElement('span');
        dateLabel.className = 'task-label';
        dateLabel.textContent = 'Data Limite:';
    
        const dateValue = document.createElement('span');
        dateValue.className = 'task-value';
        if (task.data_limite && task.data_limite !== '0000-00-00') {
            dateValue.textContent = formatDate(task.data_limite);
        } else {
            dateValue.textContent = ''; // Valor vazio
        }
    
        dateRow.appendChild(dateLabel);
        dateRow.appendChild(dateValue);
        detailsDiv.appendChild(dateRow);
    
        // Custo
        const costRow = document.createElement('div');
        costRow.className = 'task-detail-row';
    
        const costLabel = document.createElement('span');
        costLabel.className = 'task-label';
        costLabel.textContent = 'Custo:';
    
        const costValue = document.createElement('span');
        costValue.className = 'task-value';
        if (task.custo !== undefined && task.custo !== null) {
            costValue.textContent = 'R$ ' + formatCostToDisplay(task.custo);
        } else {
            costValue.textContent = ''; // Valor vazio
        }
    
        costRow.appendChild(costLabel);
        costRow.appendChild(costValue);
        detailsDiv.appendChild(costRow);
    
        // Adicionar os detalhes ao conteúdo da tarefa
        taskContent.appendChild(detailsDiv);
    
        // Adicionar o conteúdo da tarefa ao elemento li
        li.appendChild(taskContent);
    
        // Div para botões de ação
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';
    
        // Botão de editar (apenas para tarefas pendentes)
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
    
        // Botão de excluir (para todas as tarefas)
        const deleteButton = document.createElement('button');
        const deleteIcon = document.createElement('img');
        deleteIcon.src = 'assets/icons/delete.svg';
        deleteIcon.alt = 'Excluir';
        deleteButton.appendChild(deleteIcon);
        deleteButton.addEventListener('click', () => {
            excluirTarefa(task);
        });
        actionsDiv.appendChild(deleteButton);
    
        // Adicionar os botões de ação ao elemento li
        li.appendChild(actionsDiv);
    
        // Aplicar classe 'completed' se a tarefa já estiver concluída
        if (isCompleted) {
            li.classList.add('completed');
        }
    
        return li;
    }          

    function toggleTaskCompletion(taskId, isCompleted, checkboxElement) {
        fetch('api.php?action=toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: taskId,
                concluida: isCompleted
            })
        })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(result => {
            if (result.status === 200 && result.body.success) {
                // Atualização bem-sucedida, recarregar as tarefas
                loadTasks(); // Atualiza todas as listas
                messageDiv.textContent = ''; // Limpar mensagens de erro
            } else {
                // Exibir erro e reverter o estado do checkbox
                messageDiv.textContent = result.body.error || 'Erro ao alternar status da tarefa.';
                checkboxElement.checked = !isCompleted; // Reverter o estado
            }
        })
        .catch(error => {
            console.error('Erro ao alternar status da tarefa:', error);
            messageDiv.textContent = 'Erro ao alternar status da tarefa.';
            checkboxElement.checked = !isCompleted; // Reverter o estado
        });
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
        nameInput.value = task.nome;
        nameInput.className = 'edit-input name-input';
        nameInput.placeholder = 'Nome da Tarefa';
        inputsContainer.appendChild(nameInput);

        // Campo de entrada para a data
        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.value = task.data_limite;
        dateInput.className = 'edit-input date-input';
        inputsContainer.appendChild(dateInput);

        // Campo de entrada para o custo
        const costInput = document.createElement('input');
        costInput.type = 'text';
        costInput.value = formatCostToDisplay(task.custo);
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
            loadTasks();
        });

        actionsDiv.appendChild(saveButton);
        actionsDiv.appendChild(cancelButton);

        li.appendChild(actionsDiv);
    }

    // Função para salvar as alterações da edição
    function saveEdit(li, task, newName, newDate, newCostFormatted) {
        const newCost = parseCost(newCostFormatted);

        // Validações básicas
        if (newName === '') {
            alert('O nome da tarefa não pode estar vazio.');
            return;
        }

        // Dados a serem enviados
        const taskData = {
            id: task.id,
            nome: newName,
            custo: newCost,
            data_limite: newDate || null
        };

        fetch('api.php?action=update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    loadTasks();
                } else if (data.error) {
                    alert(data.error);
                }
            })
            .catch(error => {
                if (error.error) {
                    alert(error.error);
                } else {
                    alert('Erro ao editar tarefa.');
                }
                console.error('Erro ao editar tarefa:', error);
            });
    }

    // Função para excluir uma tarefa
    function excluirTarefa(task) {
        currentTaskToDelete = task;
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
        if (!currentTaskToDelete) return;

        fetch('api.php?action=delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: currentTaskToDelete.id })
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    hideConfirmationModal();
                    loadTasks();
                } else if (data.error) {
                    alert(data.error);
                }
            })
            .catch(error => {
                if (error.error) {
                    alert(error.error);
                } else {
                    alert('Erro ao excluir tarefa.');
                }
                console.error('Erro ao excluir tarefa:', error);
            });
    }

    // Funções de formatação

    function formatCostInput(e) {
        let value = e.target.value;

        value = value.replace(/\D/g, '');
        value = value.replace(/^0+/, '');

        if (value.length === 0) {
            e.target.value = '';
            return;
        }

        value = value.padStart(3, '0');

        let integerPart = value.slice(0, -2);
        let decimalPart = value.slice(-2);

        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        let formattedValue = integerPart + ',' + decimalPart;

        e.target.value = formattedValue;
    }

    function parseCost(formattedValue) {
        let value = formattedValue.replace(/\./g, '');
        value = value.replace(',', '.');
        let numberValue = parseFloat(value);
        return isNaN(numberValue) ? 0 : numberValue;
    }

    function formatCostToDisplay(value) {
        if (isNaN(value) || value === null) {
            return '';
        }
    
        let valueString = parseFloat(value).toFixed(2);
    
        valueString = valueString.replace('.', ',');
    
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
        e.dataTransfer.setData('text/plain', this.dataset.id);
        this.classList.add('dragging');
    }

    function dragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        this.classList.add('over');
    }

    // Função para reordenar as tarefas pendentes via drag and drop
    function drop(e) {
        e.preventDefault();
    
        // Garantir que `draggedItem` seja diferente de `this` (o item de destino)
        if (draggedItem !== this) {
            // Obter todos os itens da lista de tarefas pendentes
            const items = Array.from(taskListPending.children);
    
            // Obter índices do item arrastado e do alvo
            const draggedIndex = items.indexOf(draggedItem);
            const targetIndex = items.indexOf(this);
    
            // Reordenar no DOM
            if (draggedIndex < targetIndex) {
                taskListPending.insertBefore(draggedItem, this.nextSibling);
            } else {
                taskListPending.insertBefore(draggedItem, this);
            }
    
            // Atualizar a ordem no backend
            const pendingIds = Array.from(taskListPending.children).map(item => parseInt(item.dataset.id, 10));
    
            fetch('api.php?action=reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: pendingIds })
            })
                .then(response => response.json())
                .catch(error => {
                    console.error('Erro ao enviar ordem para o backend:', error);
                    messageDiv.textContent = 'Erro ao reordenar tarefas.';
                });
        }
    
        this.classList.remove('over');
    }        

    function handleDragEnd(e) {
        this.classList.remove('dragging');
        const items = document.querySelectorAll('.task-item.over');
        items.forEach(item => item.classList.remove('over'));
    }

    // Função para formatar a data no formato DD/MM/AAAA
    function formatDate(dateStr) {
        if (!dateStr) {
            return '';
        }
        const parts = dateStr.split('-');
        if (parts.length !== 3) {
            return dateStr;
        }
        return parts[2] + '/' + parts[1] + '/' + parts[0];
    }
});
