document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('new-task');
    const taskDateInput = document.getElementById('task-date');
    const taskCostInput = document.getElementById('task-cost');
    const addTaskButton = document.getElementById('add-task');
    const taskListPending = document.getElementById('task-list-pending');
    const taskListCompleted = document.getElementById('task-list-completed');
    const messageDiv = document.getElementById('message');

    // Selecionar elementos do modal
    const confirmationModal = document.getElementById('confirmation-modal');
    const confirmDeleteButton = document.getElementById('confirm-delete');
    const cancelDeleteButton = document.getElementById('cancel-delete');

    // Botão para mostrar/ocultar tarefas concluídas
    const toggleCompletedButton = document.getElementById('toggle-completed');
    let showCompleted = false; // Estado inicial: ocultar tarefas concluídas

    let tasks = [];
    let currentTaskToDelete = null;

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

    // Adicionar evento ao botão para mostrar/ocultar tarefas concluídas
    toggleCompletedButton.addEventListener('click', () => {
        showCompleted = !showCompleted;
        toggleCompletedButton.textContent = showCompleted ? 'Ocultar Tarefas Concluídas' : 'Mostrar Tarefas Concluídas';
        toggleCompletedButton.classList.toggle('active', showCompleted);
        
        if (showCompleted) {
            taskListCompleted.classList.add('show');
        } else {
            taskListCompleted.classList.remove('show');
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
                    // Combinar as tarefas pendentes e concluídas em uma única lista para facilitar o gerenciamento
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
        // Limpar listas atuais
        taskListPending.innerHTML = '';
        taskListCompleted.innerHTML = '';

        // Renderizar tarefas pendentes
        pendentes.forEach(task => {
            const li = createTaskElement(task, false);
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
        if (parseFloat(task.custo) >= 1000) {
            li.style.backgroundColor = '#fff4e5'; // Fundo amarelo claro
        }

        // Criar o checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = isCompleted ? true : false;
        checkbox.disabled = isCompleted ? true : false; // Desabilitar checkbox para tarefas concluídas
        checkbox.addEventListener('change', () => {
            if (!isCompleted) {
                toggleTaskCompletion(task.id, checkbox.checked);
            }
        });

        // Nome da tarefa
        const nameElement = document.createElement('span');
        nameElement.textContent = task.nome;
        if (checkbox.checked) {
            nameElement.classList.add('completed');
        }

        // Detalhes da tarefa
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'task-details';

        if (task.data_limite) {
            const dateSpan = document.createElement('span');
            dateSpan.textContent = 'Data Limite: ' + formatDate(task.data_limite);
            detailsDiv.appendChild(dateSpan);
        }

        if (task.custo !== null && task.custo !== undefined) {
            const costSpan = document.createElement('span');
            costSpan.textContent = 'Custo: R$ ' + formatCostToDisplay(task.custo);
            detailsDiv.appendChild(costSpan);
        }

        // Div para botões de ação
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

        // Botão de editar (apenas se a tarefa NÃO estiver concluída)
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

        // Botão de excluir (apenas se a tarefa NÃO estiver concluída)
        if (!isCompleted) {
            const deleteButton = document.createElement('button');
            const deleteIcon = document.createElement('img');
            deleteIcon.src = 'assets/icons/delete.svg';
            deleteIcon.alt = 'Excluir';
            deleteButton.appendChild(deleteIcon);
            deleteButton.addEventListener('click', () => {
                excluirTarefa(task);
            });
            actionsDiv.appendChild(deleteButton);
        }

        // Adicionar elementos ao li
        li.appendChild(checkbox);
        li.appendChild(nameElement);
        li.appendChild(detailsDiv);
        li.appendChild(actionsDiv);

        // Aplicar classe 'completed' se a tarefa já estiver concluída
        if (isCompleted) {
            li.classList.add('completed');
        }

        // Tornar o item arrastável (apenas se a tarefa NÃO estiver concluída)
        if (!isCompleted) {
            li.setAttribute('draggable', true);

            // Eventos de drag and drop
            li.addEventListener('dragstart', dragStart);
            li.addEventListener('dragover', dragOver);
            li.addEventListener('drop', drop);
            li.addEventListener('dragend', handleDragEnd);
        }

        return li;
    }

    // Função para alternar o status de conclusão da tarefa
    function toggleTaskCompletion(taskId, isCompleted) {
        fetch('api.php?action=toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: taskId, concluida: isCompleted })
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
                    messageDiv.textContent = data.error;
                }
            })
            .catch(error => {
                if (error.error) {
                    messageDiv.textContent = error.error;
                } else {
                    messageDiv.textContent = 'Erro ao atualizar status da tarefa.';
                }
                console.error('Erro ao atualizar status da tarefa:', error);
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
        // Armazenar a tarefa a ser excluída
        currentTaskToDelete = task;
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

        // Remover todos os caracteres que não sejam dígitos
        value = value.replace(/\D/g, '');

        // Remover zeros à esquerda
        value = value.replace(/^0+/, '');

        // Se não houver valor, não formatar
        if (value.length === 0) {
            e.target.value = '';
            return;
        }

        // Garantir que o valor tenha pelo menos 3 dígitos
        value = value.padStart(3, '0');

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
        // Verificar se o valor é válido
        if (isNaN(value)) {
            return '0,00';
        }

        // Converter o número para string com duas casas decimais
        let valueString = parseFloat(value).toFixed(2);

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
        console.log('Drag Start:', this.dataset.id);
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
        console.log('Drop:', this.dataset.id);
        if (draggedItem !== this) {
            // Obter todos os itens da lista pendente
            const items = Array.from(taskListPending.children);
            const draggedIndex = items.indexOf(draggedItem);
            const targetIndex = items.indexOf(this);

            // Reordenar o array de tarefas pendentes
            const pendingTasks = tasks.filter(task => !task.concluida);
            pendingTasks.splice(targetIndex, 0, pendingTasks.splice(draggedIndex, 1)[0]);

            // Obter apenas os IDs das tarefas pendentes na nova ordem
            const pendingIds = pendingTasks.map(task => task.id);
            console.log('Reordering Pending IDs:', pendingIds);

            // Verificar se todos os IDs são únicos
            const uniqueIds = new Set(pendingIds);
            if (uniqueIds.size !== pendingIds.length) {
                messageDiv.textContent = 'Erro: IDs duplicados na reordenação.';
                console.error('IDs duplicados:', pendingIds);
                return;
            }

            // Enviar apenas os IDs pendentes reordenados para o backend
            fetch('api.php?action=reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: pendingIds })
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
                        console.log('Ordem das tarefas pendentes atualizada com sucesso.');
                    } else if (data.error) {
                        messageDiv.textContent = data.error;
                        console.error('Erro ao atualizar ordem:', data.error);
                    }
                })
                .catch(error => {
                    if (error.error) {
                        messageDiv.textContent = error.error;
                    } else {
                        messageDiv.textContent = 'Erro ao atualizar ordem das tarefas.';
                    }
                    console.error('Erro ao atualizar ordem:', error);
                });
        }
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
