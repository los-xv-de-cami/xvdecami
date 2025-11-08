// Panel de Administración - Sistema de Boletos
class AdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.guests = [];
        this.tables = [];
        this.config = {
            eventName: 'XV Años de Camila',
            eventDate: '',
            eventLocation: '',
            maxGuests: 250,
            tablesCount: 25,
            sheetId: '',
            scriptUrl: ''
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeTables();
        this.loadData();
        this.updateDashboard();
    }

    bindEvents() {
        // Navegación del sidebar
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.navigateToSection(section);
            });
        });

        // Toggle sidebar en móvil
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Botón de refrescar datos
        const refreshBtn = document.getElementById('refreshData');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadData());
        }

        // Filtros y búsqueda
        this.bindFilterEvents();
        
        // Gestión de mesas
        this.bindTableEvents();
        
        // Generación de boletos
        this.bindTicketEvents();
        
        // Configuración
        this.bindConfigEvents();

        // Modal
        this.bindModalEvents();
    }

    bindFilterEvents() {
        const statusFilter = document.getElementById('statusFilter');
        const searchInput = document.getElementById('searchInput');
        const exportBtn = document.getElementById('exportData');
        const syncBtn = document.getElementById('syncData');

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterGuests());
        }

        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterGuests());
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        if (syncBtn) {
            syncBtn.addEventListener('click', () => this.syncData());
        }
    }

    bindTableEvents() {
        const autoAssignBtn = document.getElementById('autoAssign');
        const clearAssignmentsBtn = document.getElementById('clearAssignments');
        const assignGuestBtn = document.getElementById('assignGuest');

        if (autoAssignBtn) {
            autoAssignBtn.addEventListener('click', () => this.autoAssignTables());
        }

        if (clearAssignmentsBtn) {
            clearAssignmentsBtn.addEventListener('click', () => this.clearAssignments());
        }

        if (assignGuestBtn) {
            assignGuestBtn.addEventListener('click', () => this.assignGuestToTable());
        }
    }

    bindTicketEvents() {
        const generateAllBtn = document.getElementById('generateAllTickets');
        const generateSelectedBtn = document.getElementById('generateSelected');

        if (generateAllBtn) {
            generateAllBtn.addEventListener('click', () => this.generateAllTickets());
        }

        if (generateSelectedBtn) {
            generateSelectedBtn.addEventListener('click', () => this.generateSelectedTickets());
        }

        // Opciones de generación
        ['includeQR', 'includePhoto', 'includeTable'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.updateTicketPreview());
            }
        });
    }

    bindConfigEvents() {
        const testConnectionBtn = document.getElementById('testConnection');
        if (testConnectionBtn) {
            testConnectionBtn.addEventListener('click', () => this.testConnection());
        }

        // Cargar configuración guardada
        this.loadConfig();
    }

    bindModalEvents() {
        const modal = document.getElementById('guestModal');
        const closeBtn = modal?.querySelector('.modal-close');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
    }

    navigateToSection(section) {
        // Actualizar navegación activa
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Mostrar sección
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');

        // Actualizar título
        const titles = {
            dashboard: 'Dashboard',
            confirmaciones: 'Confirmaciones',
            mesas: 'Gestión de Mesas',
            boletos: 'Generación de Boletos',
            estadisticas: 'Estadísticas',
            configuracion: 'Configuración'
        };
        document.getElementById('pageTitle').textContent = titles[section];

        this.currentSection = section;

        // Cargar datos específicos de la sección
        this.loadSectionData(section);
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.admin-sidebar');
        sidebar.classList.toggle('mobile-open');
    }

    async loadData() {
        try {
            this.showLoading(true);
            
            // Cargar datos reales de Google Sheets
            await this.loadGuestsFromGoogleSheets();
            
            this.updateDashboard();
            this.renderGuestsTable();
            this.updateStats();
            
            this.showError(''); // Limpiar errores previos
            
        } catch (error) {
            console.error('Error cargando datos:', error);
            this.showError('Error al cargar los datos: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    getMockGuests() {
        return [
            {
                id: '1',
                nombre: 'María González',
                email: 'maria.gonzalez@email.com',
                telefono: '555-0123',
                asistencia: 'si',
                num_acompanantes: '2',
                nombres_acompanantes: 'Juan González, Ana González',
                restricciones_alimentarias: 'vegetariano',
                necesidades_especiales: '',
                fecha_confirmacion: '2025-01-15T10:30:00Z',
                estado: 'confirmado',
                mesa_asignada: null
            },
            {
                id: '2',
                nombre: 'Carlos Rodríguez',
                email: 'carlos.rodriguez@email.com',
                telefono: '555-0124',
                asistencia: 'si',
                num_acompanantes: '1',
                nombres_acompanantes: 'Laura Rodríguez',
                restricciones_alimentarias: '',
                necesidades_especiales: '',
                fecha_confirmacion: '2025-01-16T14:15:00Z',
                estado: 'confirmado',
                mesa_asignada: 5
            },
            {
                id: '3',
                nombre: 'Ana Martínez',
                email: 'ana.martinez@email.com',
                telefono: '555-0125',
                asistencia: 'no',
                num_acompanantes: '0',
                nombres_acompanantes: '',
                restricciones_alimentarias: '',
                necesidades_especiales: '',
                fecha_confirmacion: '2025-01-17T09:45:00Z',
                estado: 'no_asistira',
                mesa_asignada: null
            }
        ];
    }

    loadSectionData(section) {
        switch (section) {
            case 'confirmaciones':
                this.renderGuestsTable();
                break;
            case 'mesas':
                this.renderTables();
                this.updateGuestSelect();
                this.updateTableSelect();  // ← AGREGADO: Actualiza menú de mesas
                break;
            case 'boletos':
                this.updateTicketPreview();
                break;
            case 'estadisticas':
                this.updateStats();
                break;
        }
    }

    updateDashboard() {
        // Actualizar estadísticas del header
        const confirmed = this.guests.filter(g => g.estado === 'confirmado').length;
        const totalGuests = this.guests.reduce((sum, g) => {
            return sum + (g.estado === 'confirmado' ? parseInt(g.num_acompanantes) + 1 : 0);
        }, 0);

        document.getElementById('totalConfirmados').textContent = confirmed;
        document.getElementById('totalInvitados').textContent = totalGuests;

        // Actualizar dashboard cards
        document.getElementById('confirmedCount').textContent = confirmed;
        document.getElementById('declinedCount').textContent = this.guests.filter(g => g.estado === 'no_asistira').length;
        document.getElementById('pendingCount').textContent = this.guests.filter(g => g.estado === 'pendiente').length;

        // Actualizar mesas ocupadas
        const occupiedTables = new Set(this.guests.filter(g => g.mesa_asignada).map(g => g.mesa_asignada));
        document.getElementById('mesasOcupadas').textContent = occupiedTables.size;

        // Mostrar confirmaciones recientes
        this.renderRecentConfirmations();
    }

    renderRecentConfirmations() {
        const container = document.getElementById('recentConfirmations');
        const recentGuests = this.guests
            .sort((a, b) => new Date(b.fecha_confirmacion) - new Date(a.fecha_confirmacion))
            .slice(0, 5);

        container.innerHTML = recentGuests.map(guest => `
            <div class="recent-item">
                <div class="recent-name">${guest.nombre}</div>
                <span class="recent-status status-${guest.estado}">
                    ${this.getStatusLabel(guest.estado)}
                </span>
            </div>
        `).join('');
    }

    getStatusLabel(estado) {
        const labels = {
            'confirmado': 'Confirmado',
            'no_asistira': 'No Asistirá',
            'pendiente': 'Pendiente'
        };
        return labels[estado] || estado;
    }

    renderGuestsTable() {
        const tableBody = document.querySelector('#confirmacionesTable tbody');
        if (!tableBody) return;

        const filteredGuests = this.getFilteredGuests();

        tableBody.innerHTML = filteredGuests.map(guest => `
            <tr>
                <td>${guest.nombre}</td>
                <td>${guest.email}</td>
                <td>${guest.telefono}</td>
                <td>${guest.num_acompanantes}</td>
                <td>
                    <span class="recent-status status-${guest.estado}">
                        ${this.getStatusLabel(guest.estado)}
                    </span>
                </td>
                <td>${new Date(guest.fecha_confirmacion).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="adminPanel.showGuestDetails('${guest.id}')">
                        Ver Detalles
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getFilteredGuests() {
        const statusFilter = document.getElementById('statusFilter')?.value || 'todos';
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';

        let filtered = this.guests;

        if (statusFilter !== 'todos') {
            filtered = filtered.filter(guest => guest.estado === statusFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(guest => 
                guest.nombre.toLowerCase().includes(searchTerm) ||
                guest.email.toLowerCase().includes(searchTerm)
            );
        }

        return filtered;
    }

    filterGuests() {
        this.renderGuestsTable();
    }

    initializeTables() {
        this.tables = [];
        for (let i = 1; i <= 25; i++) {
            this.tables.push({
                number: i,
                guests: [],
                capacity: 10
            });
        }
    }

    renderTables() {
        const container = document.getElementById('mesasGrid');
        if (!container) return;

        container.innerHTML = this.tables.map(table => {
            const isOccupied = table.guests.length > 0;
            const isFull = table.guests.length >= table.capacity;
            const cssClass = isFull ? 'full' : (isOccupied ? 'occupied' : '');

            return `
                <div class="mesa-card ${cssClass}" data-table="${table.number}">
                    <div class="mesa-number">Mesa ${table.number}</div>
                    <div class="mesa-capacity">${table.guests.length}/${table.capacity} personas</div>
                    <div class="mesa-guests">
                        ${table.guests.length > 0 
                            ? table.guests.slice(0, 3).map(g => g.nombre.split(' ')[0]).join(', ') +
                              (table.guests.length > 3 ? '...' : '')
                            : 'Sin asignar'
                        }
                    </div>
                </div>
            `;
        }).join('');
    }

    updateGuestSelect() {
        const select = document.getElementById('guestSelect');
        if (!select) return;

        const unassignedGuests = this.guests.filter(g => g.estado === 'confirmado' && !g.mesa_asignada);
        
        select.innerHTML = '<option value="">Seleccionar invitado</option>' +
            unassignedGuests.map(guest => `
                <option value="${guest.id}">${guest.nombre} (${parseInt(guest.num_acompanantes) + 1} personas)</option>
            `).join('');
    }

    updateTableSelect() {
        const select = document.getElementById('tableSelect');
        if (!select) return;

        const availableTables = this.tables.filter(table => table.guests.length < table.capacity);
        
        select.innerHTML = '<option value="">Seleccionar mesa</option>' +
            availableTables.map(table => `
                <option value="${table.number}">Mesa ${table.number} (${table.guests.length}/${table.capacity})</option>
            `).join('');
    }

    assignGuestToTable() {
        const guestId = document.getElementById('guestSelect').value;
        const tableNumber = parseInt(document.getElementById('tableSelect').value);

        if (!guestId || !tableNumber) {
            this.showError('Por favor selecciona un invitado y una mesa');
            return;
        }

        const guest = this.guests.find(g => g.id === guestId);
        const table = this.tables.find(t => t.number === tableNumber);

        if (!guest || !table) {
            this.showError('Invitado o mesa no encontrados');
            return;
        }

        const totalGuests = parseInt(guest.num_acompanantes) + 1;
        if (table.guests.length + totalGuests > table.capacity) {
            this.showError('No hay suficiente espacio en esta mesa');
            return;
        }

        // Asignar invitado a la mesa
        guest.mesa_asignada = tableNumber;
        table.guests.push({
            id: guest.id,
            nombre: guest.nombre,
            acompañantes: parseInt(guest.num_acompanantes),
            total: totalGuests
        });

        this.renderTables();
        this.updateGuestSelect();
        this.updateTableSelect();
        this.showSuccess('Invitado asignado a la mesa correctamente');
    }

    autoAssignTables() {
        // Lógica de asignación automática
        const unassignedGuests = this.guests.filter(g => g.estado === 'confirmado' && !g.mesa_asignada);
        unassignedGuests.sort((a, b) => parseInt(b.num_acompanantes) - parseInt(a.num_acompanantes));

        for (const guest of unassignedGuests) {
            const totalGuests = parseInt(guest.num_acompanantes) + 1;
            
            // Buscar mesa disponible
            const availableTable = this.tables.find(table => 
                table.guests.length + totalGuests <= table.capacity
            );

            if (availableTable) {
                guest.mesa_asignada = availableTable.number;
                availableTable.guests.push({
                    id: guest.id,
                    nombre: guest.nombre,
                    acompañantes: parseInt(guest.num_acompanantes),
                    total: totalGuests
                });
            }
        }

        this.renderTables();
        this.updateGuestSelect();
        this.updateTableSelect();
        this.showSuccess('Asignación automática completada');
    }

    clearAssignments() {
        if (confirm('¿Estás seguro de que quieres清除 todas las asignaciones de mesas?')) {
            this.guests.forEach(guest => {
                guest.mesa_asignada = null;
            });
            
            this.tables.forEach(table => {
                table.guests = [];
            });

            this.renderTables();
            this.updateGuestSelect();
            this.updateTableSelect();
            this.showSuccess('Asignaciones清除adas correctamente');
        }
    }

    updateTicketPreview() {
        const preview = document.getElementById('ticketPreview');
        if (!preview) return;

        const includeQR = document.getElementById('includeQR')?.checked;
        const includePhoto = document.getElementById('includePhoto')?.checked;
        const includeTable = document.getElementById('includeTable')?.checked;

        // Simular vista previa del boleto
        preview.innerHTML = `
            <div style="border: 2px solid #D4AF37; padding: 20px; border-radius: 10px; background: linear-gradient(135deg, #f8f8f8 0%, #f0f0f0 100%);">
                <h3 style="color: #D4AF37; margin-bottom: 15px;">XV Años de Camila</h3>
                <p style="margin: 5px 0;"><strong>Invitado:</strong> Ejemplo Guest</p>
                <p style="margin: 5px 0;"><strong>Fecha:</strong> [Fecha del evento]</p>
                <p style="margin: 5px 0;"><strong>Lugar:</strong> [Lugar del evento]</p>
                ${includeTable ? '<p style="margin: 5px 0;"><strong>Mesa:</strong> [Número de mesa]</p>' : ''}
                ${includePhoto ? '<div style="margin: 15px 0; text-align: center;">[Foto de Camila]</div>' : ''}
                ${includeQR ? '<div style="margin: 15px 0; text-align: center;">[Código QR]</div>' : ''}
                <p style="font-size: 0.8rem; color: #666; margin-top: 15px;">Este boleto es personal e intransferible</p>
            </div>
        `;
    }

    generateAllTickets() {
        const confirmedGuests = this.guests.filter(g => g.estado === 'confirmado');
        this.generateTickets(confirmedGuests);
    }

    generateSelectedTickets() {
        // Por simplicidad, generar boletos para todos los confirmados
        // En una implementación real, permitiría selección múltiple
        this.generateAllTickets();
    }

    generateTickets(guests) {
        if (guests.length === 0) {
            this.showError('No hay invitados confirmados para generar boletos');
            return;
        }

        const includeQR = document.getElementById('includeQR')?.checked;
        const includePhoto = document.getElementById('includePhoto')?.checked;
        const includeTable = document.getElementById('includeTable')?.checked;

        // Crear ventana con los boletos
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Boletos - XV Años de Camila</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .ticket { 
                        border: 2px solid #D4AF37; 
                        padding: 20px; 
                        margin: 20px 0; 
                        border-radius: 10px; 
                        page-break-inside: avoid;
                        background: linear-gradient(135deg, #f8f8f8 0%, #f0f0f0 100%);
                    }
                    .ticket-header { 
                        text-align: center; 
                        color: #D4AF37; 
                        margin-bottom: 20px; 
                    }
                    .ticket-info { margin: 10px 0; }
                    .qr-placeholder { 
                        text-align: center; 
                        margin: 20px 0; 
                        padding: 20px; 
                        border: 1px dashed #ccc; 
                        color: #666; 
                    }
                    @media print { .ticket { page-break-inside: avoid; } }
                </style>
            </head>
            <body>
                <h1 style="text-align: center; color: #D4AF37;">Boletos - XV Años de Camila</h1>
                ${guests.map(guest => `
                    <div class="ticket">
                        <div class="ticket-header">
                            <h2>XV Años de Camila</h2>
                        </div>
                        <div class="ticket-info">
                            <p><strong>Invitado:</strong> ${guest.nombre}</p>
                            <p><strong>Acompañantes:</strong> ${guest.num_acompanantes}</p>
                            <p><strong>Fecha:</strong> [Fecha del evento]</p>
                            <p><strong>Lugar:</strong> [Lugar del evento]</p>
                            ${includeTable ? `<p><strong>Mesa Asignada:</strong> ${guest.mesa_asignada || 'Por asignar'}</p>` : ''}
                        </div>
                        ${includePhoto ? `
                            <div style="text-align: center; margin: 20px 0;">
                                <p style="color: #666; font-style: italic;">[Foto de Camila]</p>
                            </div>
                        ` : ''}
                        ${includeQR ? `
                            <div class="qr-placeholder">
                                <p>Código QR</p>
                                <p style="font-size: 0.8rem;">ID: ${guest.id}</p>
                            </div>
                        ` : ''}
                        <p style="font-size: 0.8rem; color: #666; margin-top: 15px; text-align: center;">
                            Este boleto es personal e intransferible
                        </p>
                    </div>
                `).join('')}
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.print();
        this.showSuccess(`Se generaron ${guests.length} boletos`);
    }

    updateStats() {
        // Estadísticas por fecha
        this.updateConfirmationsChart();
        
        // Distribución de acompañantes
        this.updateCompanionsChart();
        
        // Restricciones alimentarias
        this.updateDietaryRestrictions();
    }

    updateConfirmationsChart() {
        // Simulación de gráfico - en producción usaría Chart.js
        const canvas = document.getElementById('confirmationsChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar gráfico simple
        ctx.fillStyle = '#D4AF37';
        ctx.fillRect(50, 150, 30, 50);
        ctx.fillRect(100, 120, 30, 80);
        ctx.fillRect(150, 100, 30, 100);
        ctx.fillRect(200, 80, 30, 120);
    }

    updateCompanionsChart() {
        const canvas = document.getElementById('companionsChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Gráfico de acompañantes
        const companionsData = [0, 1, 2, 3, 4, 5]; // 0-5 acompañantes
        const counts = companionsData.map(num => 
            this.guests.filter(g => parseInt(g.num_acompanantes) === num).length
        );
        
        const barWidth = 40;
        const spacing = 15;
        const startX = 50;
        const maxHeight = 150;
        
        counts.forEach((count, index) => {
            const height = (count / Math.max(...counts)) * maxHeight;
            const x = startX + (index * (barWidth + spacing));
            const y = 180 - height;
            
            ctx.fillStyle = '#D4AF37';
            ctx.fillRect(x, y, barWidth, height);
            
            ctx.fillStyle = '#2C3E50';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(companionsData[index].toString(), x + barWidth/2, 195);
        });
    }

    updateDietaryRestrictions() {
        const container = document.getElementById('dietaryRestrictions');
        if (!container) return;

        const restrictions = {};
        this.guests.forEach(guest => {
            if (guest.restricciones_alimentarias) {
                const items = guest.restricciones_alimentarias.split(', ');
                items.forEach(item => {
                    const cleanItem = item.trim();
                    restrictions[cleanItem] = (restrictions[cleanItem] || 0) + 1;
                });
            }
        });

        container.innerHTML = Object.entries(restrictions)
            .map(([restriction, count]) => `
                <div class="restriction-item">
                    <span class="restriction-name">${restriction}</span>
                    <span class="restriction-count">${count}</span>
                </div>
            `).join('') || '<p style="color: #666; font-style: italic;">No hay restricciones registradas</p>';
    }

    loadConfig() {
        const savedConfig = localStorage.getItem('adminConfig');
        if (savedConfig) {
            this.config = { ...this.config, ...JSON.parse(savedConfig) };
        }

        // Cargar en formulario
        Object.keys(this.config).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.value = this.config[key];
            }
        });
    }

    saveConfig() {
        // Actualizar configuración desde formulario
        Object.keys(this.config).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                this.config[key] = element.value;
            }
        });

        localStorage.setItem('adminConfig', JSON.stringify(this.config));
    }

    testConnection() {
        this.saveConfig();
        
        // Simular prueba de conexión
        this.showSuccess('Conexión con Google Sheets configurada correctamente');
    }

    exportData() {
        const data = {
            guests: this.guests,
            tables: this.tables,
            config: this.config,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `camila-quinceañera-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showSuccess('Datos exportados correctamente');
    }

    async syncData() {
        try {
            // Simular sincronización con Google Sheets
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.loadData();
            this.showSuccess('Datos sincronizados correctamente');
        } catch (error) {
            this.showError('Error al sincronizar los datos');
        }
    }

    showGuestDetails(guestId) {
        const guest = this.guests.find(g => g.id === guestId);
        if (!guest) return;

        const modal = document.getElementById('guestModal');
        const details = document.getElementById('guestDetails');

        details.innerHTML = `
            <div class="guest-details">
                <h4>${guest.nombre}</h4>
                <p><strong>Email:</strong> ${guest.email}</p>
                <p><strong>Teléfono:</strong> ${guest.telefono}</p>
                <p><strong>Estado:</strong> ${this.getStatusLabel(guest.estado)}</p>
                <p><strong>Acompañantes:</strong> ${guest.num_acompanantes}</p>
                ${guest.nombres_acompanantes ? `<p><strong>Nombres de acompañantes:</strong> ${guest.nombres_acompanantes}</p>` : ''}
                ${guest.restricciones_alimentarias ? `<p><strong>Restricciones alimentarias:</strong> ${guest.restricciones_alimentarias}</p>` : ''}
                ${guest.necesidades_especiales ? `<p><strong>Necesidades especiales:</strong> ${guest.necesidades_especiales}</p>` : ''}
                <p><strong>Fecha de confirmación:</strong> ${new Date(guest.fecha_confirmacion).toLocaleString()}</p>
                <p><strong>Mesa asignada:</strong> ${guest.mesa_asignada || 'No asignada'}</p>
            </div>
        `;

        modal.classList.add('active');
    }

    closeModal() {
        const modal = document.getElementById('guestModal');
        modal.classList.remove('active');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 3000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        if (type === 'success') {
            notification.style.background = 'linear-gradient(135deg, #27AE60, #2ecc71)';
        } else {
            notification.style.background = 'linear-gradient(135deg, #E74C3C, #ec7063)';
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remover después de 4 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // ========================================
    // FUNCIONES DE CARGA DE DATOS DESDE GOOGLE SHEETS
    // ========================================

    async loadGuestsFromGoogleSheets() {
        const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyOoWfstZO1q03qcO7Zf2UYkZXdryDzYbpt8yP_Rs1GjHLaz4Smli4bUoZUM3DS5Zd8/exec';
        
        try {
            // Realizar petición GET para obtener datos
            const response = await fetch(`${WEB_APP_URL}?action=getAllData`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success && result.data) {
                this.guests = this.formatGuestsData(result.data);
            } else {
                throw new Error(result.error || 'No se pudieron obtener los datos');
            }
            
        } catch (error) {
            console.error('Error cargando desde Google Sheets:', error);
            // Fallback a datos mock si falla la conexión
            this.guests = this.getMockGuests();
            this.showError('Usando datos de prueba - Error de conexión: ' + error.message);
        }
    }

    formatGuestsData(rawData) {
        // Convertir datos de Google Sheets al formato esperado por el panel
        if (!Array.isArray(rawData)) return [];
        
        return rawData.map((row, index) => {
            // Saltar header row
            if (index === 0) return null;
            
            return {
                id: row[0] || `guest_${index}`,
                nombre: row[1] || '',
                email: row[2] || '',
                telefono: row[3] || '',
                asistencia: row[4] || '',
                num_acompanantes: row[5] || '0',
                nombres_acompanantes: row[6] || '',
                observaciones: row[7] || '',
                fecha_confirmacion: row[8] || new Date().toISOString(),
                estado: row[9] || 'pendiente',
                mesa_asignada: null
            };
        }).filter(guest => guest && guest.nombre); // Filtrar filas vacías
    }

    showLoading(show) {
        // Mostrar/ocultar indicador de carga
        const headerRight = document.querySelector('.header-right');
        if (headerRight) {
            if (show) {
                headerRight.style.opacity = '0.5';
                headerRight.style.pointerEvents = 'none';
            } else {
                headerRight.style.opacity = '1';
                headerRight.style.pointerEvents = 'auto';
            }
        }
        
        // Actualizar botón de refresh
        const refreshBtn = document.getElementById('refreshData');
        if (refreshBtn) {
            const icon = refreshBtn.querySelector('i');
            if (show) {
                icon.className = 'fas fa-spinner fa-spin';
            } else {
                icon.className = 'fas fa-sync-alt';
            }
        }
    }
}

// Inicializar panel de administración
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});
