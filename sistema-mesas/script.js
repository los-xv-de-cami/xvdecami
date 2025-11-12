// Application State
const state = {
    guests: [],
    assignments: new Map(), // guestId -> tableNumber
    tables: Array.from({ length: 25 }, (_, i) => ({
        number: i + 1,
        guests: [],
        capacity: 10
    }))
};

// Constants
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyJAuXjjzKQnIJSqtSaVnSC-c4pSd1nhrxIDKqraZx8LFnbceaRAy7xYIwAHatPLE3COQ/exec'; // Replace with your deployed Apps Script URL
const LOAD_GUEST_EVENT = 'loadGuests';
const SAVE_ASSIGNMENTS_EVENT = 'saveAssignments';

// DOM Elements
const elements = {
    guestList: document.getElementById('guestList'),
    tablesGrid: document.getElementById('tablesGrid'),
    saveButton: document.getElementById('saveButton'),
    toast: document.getElementById('statusToast'),
    toastMessage: document.getElementById('toastMessage')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initializeApp();
    } catch (error) {
        console.error('Error inicializando aplicación:', error);
        showToast('Error al cargar la aplicación', 'error');
    }
});

async function initializeApp() {
    // Generate tables grid
    generateTables();
    
    // Load guests from Google Sheets
    await loadGuests();
    
    // Render initial state
    renderGuestList();
    renderTables();
    
    // Setup event listeners
    setupEventListeners();
}

function generateTables() {
    for (let i = 1; i <= 25; i++) {
        const tableCard = createTableCard(i);
        elements.tablesGrid.appendChild(tableCard);
    }
}

function createTableCard(tableNumber) {
    const card = document.createElement('div');
    card.className = 'table-card';
    card.dataset.tableNumber = tableNumber;
    
    card.innerHTML = `
        <div class="table-header">
            <h3 class="table-number">Mesa ${tableNumber}</h3>
            <div class="table-capacity" data-capacity="0">0/10</div>
        </div>
        <div class="table-guests" data-table-number="${tableNumber}">
            <!-- Guests will be added here -->
        </div>
    `;
    
    // Setup drag and drop for this table
    setupTableDragAndDrop(card);
    
    return card;
}

function setupTableDragAndDrop(tableCard) {
    tableCard.addEventListener('dragover', (e) => {
        e.preventDefault();
        tableCard.classList.add('drag-over');
    });
    
    tableCard.addEventListener('dragleave', (e) => {
        tableCard.classList.remove('drag-over');
    });
    
    tableCard.addEventListener('drop', (e) => {
        e.preventDefault();
        tableCard.classList.remove('drag-over');
        
        const guestId = e.dataTransfer.getData('text/plain');
        const tableNumber = parseInt(tableCard.dataset.tableNumber);
        moveGuestToTable(guestId, tableNumber);
    });
}

function setupEventListeners() {
    // Save button
    elements.saveButton.addEventListener('click', saveChanges);
    
    // REMOVIDO: Refresh data every 30 seconds for multi-user support
    // Como solo un usuario manejará las asignaciones, este refresh se eliminó
    // setInterval(async () => {
    //     await loadGuests();
    //     renderGuestList();
    //     renderTables();
    // }, 30000);
}

async function loadGuests() {
    console.log('🔄 Iniciando carga de invitados...');
    console.log('📍 URL del Apps Script:', APPS_SCRIPT_URL);
    
    try {
        const formData = new FormData();
        formData.append('event', LOAD_GUEST_EVENT);
        
        console.log('📤 Enviando petición a Apps Script...');
        
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: formData
        });
        
        console.log('📥 Respuesta recibida:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error HTTP:', errorText);
            throw new Error(`Error HTTP ${response.status}: ${errorText}`);
        }
        
        const responseText = await response.text();
        console.log('📄 Respuesta completa (texto):', responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('✅ Datos parseados exitosamente:', data);
        } catch (parseError) {
            console.error('❌ Error al parsear JSON:', parseError);
            console.error('📄 Respuesta que falló:', responseText);
            throw new Error(`Respuesta inválida del servidor: ${responseText.substring(0, 200)}...`);
        }
        
        if (data.error) {
            console.error('❌ Error del Apps Script:', data.error);
            throw new Error(data.error);
        }
        
        // Process guests data
        state.guests = data.guests
            .filter(guest => guest.attending.toLowerCase() === 'si')
            .map(guest => ({
                id: guest.id,
                name: guest.name,
                companions: guest.companions ? (typeof guest.companions === 'string' ? guest.companions.split(',').map(c => c.trim()).filter(c => c) : Array.from({ length: parseInt(guest.companions) }, (_, i) => `Acompañante ${i + 1}`)) : []
            }));
        
        // Load existing assignments
        data.guests.forEach(guest => {
            if (guest.tableAssignment && guest.tableAssignment !== '') {
                const tableNumber = parseInt(guest.tableAssignment);
                if (tableNumber >= 1 && tableNumber <= 25) {
                    state.assignments.set(guest.id, tableNumber);
                }
            }
        });
        
        // Reorganize tables based on assignments
        updateTablesFromAssignments();
        
        showToast(`Cargados ${state.guests.length} invitados confirmados`);
        
    } catch (error) {
        console.error('Error cargando invitados:', error);
        throw error;
    }
}

function renderGuestList() {
    // Clear guest list
    elements.guestList.innerHTML = '';
    
    // Get guests not assigned to any table
    const unassignedGuests = state.guests.filter(guest => !state.assignments.has(guest.id));
    
    if (unassignedGuests.length === 0) {
        elements.guestList.innerHTML = '<div class="loading">Todos los invitados están asignados</div>';
        return;
    }
    
    unassignedGuests.forEach(guest => {
        const guestCard = createGuestCard(guest, false);
        elements.guestList.appendChild(guestCard);
    });
}

function createGuestCard(guest, isOnTable) {
    const card = document.createElement('div');
    card.className = `guest-card ${isOnTable ? 'table-guest' : ''}`;
    card.draggable = true;
    card.dataset.guestId = guest.id;
    
    const companionsText = guest.companions.length > 0 
        ? `+${guest.companions.length} acompañante${guest.companions.length > 1 ? 's' : ''}`
        : '';
    
    card.innerHTML = `
        <div class="guest-main">${guest.name}</div>
        ${companionsText ? `<div class="guest-companions">${companionsText}</div>` : ''}
        ${isOnTable ? `<button class="remove-guest-btn" onclick="removeGuestFromTable('${guest.id}')" title="Quitar de la mesa">×</button>` : ''}
    `;
    
    // Setup drag and drop for this guest
    card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', guest.id);
        card.classList.add('dragging');
    });
    
    card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
    });
    
    return card;
}

function renderTables() {
    state.tables.forEach(table => {
        const tableCard = elements.tablesGrid.querySelector(`[data-table-number="${table.number}"]`);
        const guestsContainer = tableCard.querySelector('.table-guests');
        const capacityIndicator = tableCard.querySelector('[data-capacity]');
        
        // Clear existing guests
        guestsContainer.innerHTML = '';
        
        // Add guests to table
        table.guests.forEach(guest => {
            const guestCard = createGuestCard(guest, true);
            guestsContainer.appendChild(guestCard);
        });
        
        // Update capacity indicator
        const currentCount = table.guests.reduce((total, guest) => {
            return total + 1 + guest.companions.length;
        }, 0);
        
        capacityIndicator.textContent = `${currentCount}/10`;
        capacityIndicator.classList.toggle('full', currentCount >= 10);
        tableCard.classList.toggle('full', currentCount >= 10);
    });
}

function updateTablesFromAssignments() {
    // Clear all tables
    state.tables.forEach(table => {
        table.guests = [];
    });
    
    // Assign guests to tables based on assignments map
    state.assignments.forEach((tableNumber, guestId) => {
        const guest = state.guests.find(g => g.id === guestId);
        if (guest && tableNumber >= 1 && tableNumber <= 25) {
            const table = state.tables[tableNumber - 1];
            const totalSize = 1 + guest.companions.length;
            
            if (table.guests.reduce((total, g) => total + 1 + g.companions.length, 0) + totalSize <= 10) {
                table.guests.push(guest);
            }
        }
    });
}

function moveGuestToTable(guestId, tableNumber) {
    const guest = state.guests.find(g => g.id === guestId);
    if (!guest) return;
    
    const table = state.tables[tableNumber - 1];
    const totalSize = 1 + guest.companions.length;
    const currentSize = table.guests.reduce((total, g) => total + 1 + g.companions.length, 0);
    
    // Check if table has space
    if (currentSize + totalSize > 10) {
        showToast(`La Mesa ${tableNumber} está completa`, 'error');
        return;
    }
    
    // Remove guest from previous table if exists
    if (state.assignments.has(guestId)) {
        const previousTableNumber = state.assignments.get(guestId);
        const previousTable = state.tables[previousTableNumber - 1];
        previousTable.guests = previousTable.guests.filter(g => g.id !== guestId);
    }
    
    // Add guest to new table
    table.guests.push(guest);
    state.assignments.set(guestId, tableNumber);
    
    // Re-render
    renderGuestList();
    renderTables();
    
    showToast(`${guest.name} asignado a Mesa ${tableNumber}`);
}

async function saveChanges() {
    const button = elements.saveButton;
    const originalText = button.querySelector('.btn-text').textContent;
    
    try {
        // Update button state
        button.classList.add('saving');
        button.querySelector('.btn-text').textContent = 'Guardando...';
        
        // Prepare data
        const assignmentsData = [];
        state.assignments.forEach((tableNumber, guestId) => {
            assignmentsData.push({
                guestId: guestId,
                tableAssignment: tableNumber.toString()
            });
        });
        
        const formData = new FormData();
        formData.append('event', SAVE_ASSIGNMENTS_EVENT);
        formData.append('assignments', JSON.stringify(assignmentsData));
        
        // Save to Google Sheets
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Update button state to success
        button.classList.remove('saving');
        button.classList.add('saved');
        button.querySelector('.btn-text').textContent = 'Guardado';
        
        showToast(`Cambios guardados: ${assignmentsData.length} asignaciones`, 'success');
        
        // Reset button after 2 seconds
        setTimeout(() => {
            button.classList.remove('saved');
            button.querySelector('.btn-text').textContent = originalText;
        }, 2000);
        
    } catch (error) {
        console.error('Error guardando cambios:', error);
        
        // Reset button state
        button.classList.remove('saving');
        button.querySelector('.btn-text').textContent = originalText;
        
        showToast(`Error al guardar: ${error.message}`, 'error');
    }
}

// Función para remover invitado de mesa (para cancelaciones)
function removeGuestFromTable(guestId) {
    if (state.assignments.has(guestId)) {
        const tableNumber = state.assignments.get(guestId);
        const table = state.tables[tableNumber - 1];
        
        // Remover de la mesa
        table.guests = table.guests.filter(guest => guest.id !== guestId);
        
        // Remover asignación
        state.assignments.delete(guestId);
        
        // Re-render
        renderGuestList();
        renderTables();
        
        const guest = state.guests.find(g => g.id === guestId);
        if (guest) {
            showToast(`${guest.name} removido de Mesa ${tableNumber}`);
        }
    } else {
        console.warn('Invitado no encontrado en asignaciones:', guestId);
    }
}

// Función para limpiar mesa completa
function clearTable(tableNumber) {
    const table = state.tables[tableNumber - 1];
    if (table.guests.length === 0) return;
    
    // Remover todas las asignaciones de esta mesa
    table.guests.forEach(guest => {
        state.assignments.delete(guest.id);
    });
    
    // Limpiar mesa
    table.guests = [];
    
    // Re-render
    renderGuestList();
    renderTables();
    
    showToast(`Mesa ${tableNumber} limpiada`);
}

// Función para liberar todos los espacios
function clearAllAssignments() {
    if (confirm('¿Estás seguro de que quieres limpiar todas las asignaciones? Esta acción no se puede deshacer.')) {
        // Limpiar todas las asignaciones
        state.assignments.clear();
        state.tables.forEach(table => {
            table.guests = [];
        });
        
        // Re-render
        renderGuestList();
        renderTables();
        
        showToast('Todas las asignaciones han sido limpiadas', 'warning');
    }
}

// Función para obtener información detallada de ocupación
function getTableOccupancyInfo(tableNumber) {
    const table = state.tables[tableNumber - 1];
    const totalPeople = table.guests.reduce((total, guest) => {
        return total + 1 + guest.companions.length;
    }, 0);
    
    return {
        tableNumber,
        guests: table.guests.length,
        totalPeople,
        capacity: 10,
        available: 10 - totalPeople,
        isFull: totalPeople >= 10
    };
}

// Función para distribución automática equilibrada
async function autoDistributeGuests() {
    const unassignedGuests = state.guests.filter(guest => !state.assignments.has(guest.id));
    
    if (unassignedGuests.length === 0) {
        showToast('No hay invitados sin asignar', 'warning');
        return;
    }
    
    // Ordenar mesas por ocupación actual (menor a mayor)
    const availableTables = state.tables
        .map(table => ({
            table,
            currentSize: table.guests.reduce((total, guest) => total + 1 + guest.companions.length, 0)
        }))
        .filter(item => item.currentSize < 10)
        .sort((a, b) => a.currentSize - b.currentSize);
    
    // Asignar cada invitado a la mesa con más espacio disponible
    for (const guest of unassignedGuests) {
        const guestSize = 1 + guest.companions.length;
        
        // Buscar la primera mesa que tenga espacio
        const availableTable = availableTables.find(item => 
            item.currentSize + guestSize <= 10
        );
        
        if (availableTable) {
            // Asignar a la mesa
            availableTable.table.guests.push(guest);
            state.assignments.set(guest.id, availableTable.table.number);
            availableTable.currentSize += guestSize;
        } else {
            // Si no hay mesa disponible, asignar a la primera mesa con más espacio
            const smallestTable = availableTables[availableTables.length - 1];
            if (smallestTable) {
                smallestTable.table.guests.push(guest);
                state.assignments.set(guest.id, smallestTable.table.number);
                smallestTable.currentSize += guestSize;
            }
        }
    }
    
    renderGuestList();
    renderTables();
    showToast(`Distribución automática completada para ${unassignedGuests.length} invitados`, 'success');
}

// Función para mostrar reporte de ocupación
function showOccupancyReport() {
    const stats = getOccupancyStatistics();
    
    const report = `
        <div class="occupancy-report">
            <h4>📊 Estadísticas de Ocupación</h4>
            <p><strong>Total de mesas:</strong> ${stats.totalTables}</p>
            <p><strong>Mesas completas:</strong> ${stats.fullTables} (${Math.round(stats.fullTables/stats.totalTables*100)}%)</p>
            <p><strong>Mesas vacías:</strong> ${stats.emptyTables}</p>
            <p><strong>Promedio de ocupación:</strong> ${stats.averageOccupancy.toFixed(1)} personas/mesa</p>
            <p><strong>Invitados asignados:</strong> ${stats.assignedGuests}</p>
            <p><strong>Invitados pendientes:</strong> ${stats.unassignedGuests}</p>
            <p><strong>Total personas en mesas:</strong> ${Math.round(stats.averageOccupancy * stats.totalTables)}</p>
        </div>
    `;
    
    showModal('Reporte de Ocupación', report);
}

// Calcular estadísticas de ocupación
function getOccupancyStatistics() {
    const totalTables = state.tables.length;
    const emptyTables = state.tables.filter(table => table.guests.length === 0).length;
    const fullTables = state.tables.filter(table => {
        const size = table.guests.reduce((total, guest) => total + 1 + guest.companions.length, 0);
        return size >= 10;
    }).length;
    
    const totalAssignedSize = state.tables.reduce((total, table) => {
        return total + table.guests.reduce((size, guest) => size + 1 + guest.companions.length, 0);
    }, 0);
    
    const averageOccupancy = totalAssignedSize / totalTables;
    const assignedGuests = state.assignments.size;
    const unassignedGuests = state.guests.length - assignedGuests;
    
    return {
        totalTables,
        emptyTables,
        fullTables,
        averageOccupancy,
        assignedGuests,
        unassignedGuests
    };
}

// Función para mostrar modal
function showModal(title, content) {
    // Remover modal existente si existe
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-eliminar al hacer click fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Mostrar modal
    setTimeout(() => modal.classList.add('show'), 100);
}

// DEBUG FUNCTIONS

// Toggle debug panel
function toggleDebugPanel() {
    const panel = document.getElementById('debugPanel');
    const toggle = document.getElementById('debugToggle');
    
    panel.classList.toggle('hidden');
    toggle.classList.toggle('hidden');
    
    if (!panel.classList.contains('hidden')) {
        showDebugMessage('🐛 Panel de debug activado');
    }
}

// Test connection to Apps Script
async function testConnection() {
    const output = document.getElementById('debugOutput');
    
    try {
        showDebugMessage('🧪 Probando conexión con Apps Script...');
        
        const formData = new FormData();
        formData.append('event', 'test');
        
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: formData
        });
        
        const responseText = await response.text();
        
        showDebugMessage(`✅ Respuesta recibida:`);
        showDebugMessage(`Status: ${response.status}`);
        showDebugMessage(`Text: ${responseText}`);
        
        try {
            const jsonData = JSON.parse(responseText);
            showDebugMessage(`JSON Parseado: ${JSON.stringify(jsonData, null, 2)}`);
        } catch (parseError) {
            showDebugMessage(`❌ Error parseando JSON: ${parseError.message}`);
        }
        
    } catch (error) {
        showDebugMessage(`❌ Error: ${error.message}`);
        console.error('Debug test error:', error);
    }
}

// Show debug logs
function showDebugLogs() {
    const output = document.getElementById('debugOutput');
    const logs = getDebugLogs();
    
    if (logs.length === 0) {
        showDebugMessage('📋 No hay logs disponibles');
        return;
    }
    
    showDebugMessage('📋 Últimos logs:');
    logs.forEach(log => {
        showDebugMessage(log);
    });
}

// Clear debug logs
function clearDebugLogs() {
    clearDebugLogStorage();
    const output = document.getElementById('debugOutput');
    output.innerHTML = '';
    showDebugMessage('🧹 Logs limpiados');
}

// Debug message helper
function showDebugMessage(message) {
    const output = document.getElementById('debugOutput');
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    
    output.innerHTML += logEntry + '\n';
    output.scrollTop = output.scrollHeight;
    
    // Store in localStorage for persistence
    addDebugLog(logEntry);
}

// Debug log storage
let debugLogs = JSON.parse(localStorage.getItem('debugLogs') || '[]');

function addDebugLog(log) {
    debugLogs.push(log);
    if (debugLogs.length > 100) {
        debugLogs.shift(); // Keep only last 100 logs
    }
    localStorage.setItem('debugLogs', JSON.stringify(debugLogs));
}

function getDebugLogs() {
    return debugLogs.slice(-10); // Return last 10 logs
}

function clearDebugLogStorage() {
    debugLogs = [];
    localStorage.removeItem('debugLogs');
}

function showToast(message, type = 'info') {
    elements.toastMessage.textContent = message;
    elements.toast.className = `toast ${type}`;
    
    // Show toast
    setTimeout(() => {
        elements.toast.classList.add('show');
    }, 100);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// Auto-initialize debug panel (only in development)
if (window.location.hostname === 'localhost' || window.location.search.includes('debug=true')) {
    setTimeout(() => {
        const panel = document.getElementById('debugPanel');
        const toggle = document.getElementById('debugToggle');
        
        if (panel && toggle) {
            console.log('🐛 Debug panel available - click the 🐛 button to open');
        }
    }, 1000);
}
