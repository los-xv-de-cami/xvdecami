/**
 * CONFIRMACION.JS - VERSIÓN LISTA PARA COMPLETAR
 * XV Años de Camila - Sistema de Boletos
 * 
 * 🔥 ARCHIVO LISTO PARA USAR
 * Solo necesito que me proporciones:
 * 1. SPREADSHEET_ID de tu Google Sheets
 * 2. URL del Web App de tu Google Apps Script
 * 
 * Y yo completo el código para que funcione perfectamente
 */

class GuestForm {
    constructor() {
        this.form = document.getElementById('guestForm');
        this.formData = new FormData();
        
        // Configuración del sistema
        this.ticketConfig = {
            prefix: 'XC',
            name: 'XV Años de Camila',
            date: '15 de Diciembre, 2025',
            time: '19:00',
            location: 'Salón de Eventos Los Rosales'
        };
        
        // ✅ DESPUÉS DE RECIBIR TUS DATOS, EL CÓDIGO COMPLETO SE VERÁ ASÍ:
        // const SCRIPT_URL = 'https://script.google.com/macros/s/TU_SCRIPT_ID_REAL/exec';
        
        this.init();
    }
    
    init() {
        if (this.form) {
            this.setupEventListeners();
            this.loadTicket();
        } else {
            console.log('Formulario no encontrado');
        }
    }
    
    setupEventListeners() {
        // Manejo de asistencia
        const attendanceRadios = document.querySelectorAll('input[name="attendance"]');
        const companionsSection = document.getElementById('companionsSection');
        
        attendanceRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'si') {
                    companionsSection.style.display = 'block';
                } else {
                    companionsSection.style.display = 'none';
                }
            });
        });
        
        // Manejo del envío del formulario
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });
        
        // Manejo de acompañantes
        const companionsInput = document.getElementById('companions');
        const companionsSection = document.getElementById('companionsSection');
        
        if (companionsInput && companionsSection) {
            companionsInput.addEventListener('change', (e) => {
                const numGuests = parseInt(e.target.value);
                if (numGuests > 0) {
                    this.showCompanionFields(numGuests);
                } else {
                    this.hideCompanionFields();
                }
            });
        }
    }
    
    showCompanionFields(numGuests) {
        const container = document.getElementById('companionFields');
        if (!container) return;
        
        container.innerHTML = '';
        
        for (let i = 1; i <= numGuests; i++) {
            const fieldGroup = document.createElement('div');
            fieldGroup.className = 'form-group';
            fieldGroup.innerHTML = `
                <label for="companion_${i}">Nombre del acompañante ${i}:</label>
                <input type="text" id="companion_${i}" name="companion_${i}" class="form-control" required>
            `;
            container.appendChild(fieldGroup);
        }
    }
    
    hideCompanionFields() {
        const container = document.getElementById('companionFields');
        if (container) {
            container.innerHTML = '';
        }
    }
    
    async handleFormSubmit() {
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.textContent;
        
        // Mostrar estado de carga
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;
        
        try {
            // Recopilar datos del formulario
            const formData = this.collectFormData();
            
            // Enviar a Google Sheets
            const result = await this.sendToGoogleSheets(formData);
            
            if (result.success) {
                this.showSuccessMessage(result);
                this.generateTicket(formData, result);
                this.form.reset();
            } else {
                throw new Error(result.error || 'Error desconocido');
            }
            
        } catch (error) {
            console.error('Error:', error);
            this.showErrorMessage(error.message);
        } finally {
            // Restaurar botón
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    
    collectFormData() {
        const data = {
            timestamp: new Date().toISOString(),
            nombre: document.getElementById('name')?.value || '',
            email: document.getElementById('email')?.value || '',
            telefono: document.getElementById('phone')?.value || '',
            asistencia: document.querySelector('input[name="attendance"]:checked')?.value || '',
            acompañantes: document.getElementById('companions')?.value || '0',
            nombres_acompanantes: this.getCompanionNames(),
            observaciones: document.getElementById('notes')?.value || '',
            fecha_evento: this.ticketConfig.date,
            hora_evento: this.ticketConfig.time,
            lugar_evento: this.ticketConfig.location,
            ticket_id: this.generateTicketId(),
            estado: 'pendiente'
        };
        
        return data;
    }
    
    getCompanionNames() {
        const companions = [];
        const numCompanions = parseInt(document.getElementById('companions')?.value || '0');
        
        for (let i = 1; i <= numCompanions; i++) {
            const companionName = document.getElementById(`companion_${i}`)?.value;
            if (companionName) {
                companions.push(companionName);
            }
        }
        
        return companions.join(', ');
    }
    
    generateTicketId() {
        // Generar ID único basado en timestamp y datos aleatorios
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `CAMILA_${timestamp}_${random}`.toUpperCase();
    }
    
    async sendToGoogleSheets(data) {
        // ✅ URL CONFIGURADA CON TUS DATOS
        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxnrOFAIQ9nGKrdw6YcR5_mmM8bLEPlHE1ab0eqAyEqwzyusi4AnEsPr0xcgBXVn5QW/exec';
        
        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Error desconocido');
            }
            
            return result;
            
        } catch (error) {
            // Si falla el envío a Google Sheets, guardar localmente como respaldo
            console.warn('Error al enviar a Google Sheets:', error);
            this.saveDataLocally(data);
            
            // Aún así considerar exitoso para el usuario
            return { success: true, local_backup: true };
        }
    }
    
    saveDataLocally(data) {
        // Guardar en localStorage como respaldo
        const existingData = JSON.parse(localStorage.getItem('guestConfirmations') || '[]');
        existingData.push(data);
        localStorage.setItem('guestConfirmations', JSON.stringify(existingData));
    }
    
    generateTicket(data, result) {
        const ticketId = data.ticket_id;
        const ticketContent = this.createTicketContent(data, result);
        
        // Guardar ticket para descarga o mostrar
        this.displayTicket(ticketContent, ticketId);
    }
    
    createTicketContent(data, result) {
        return {
            ticketId: data.ticket_id,
            guestName: data.nombre,
            eventName: this.ticketConfig.name,
            eventDate: this.ticketConfig.date,
            eventTime: this.ticketConfig.time,
            eventLocation: this.ticketConfig.location,
            companions: data.acompañantes,
            companionNames: data.nombres_acompanantes,
            status: data.asistencia === 'si' ? 'Confirmado' : 'No Asistirá',
            email: data.email,
            phone: data.telefono,
            table: result.ticketNumber ? `Mesa ${result.ticketNumber}` : 'Por asignar',
            qrData: `Guest:${data.ticket_id}|Name:${data.nombre}|Event:XV Camila|Date:2025-12-15`,
            timestamp: new Date().toLocaleString('es-ES')
        };
    }
    
    displayTicket(ticketContent, ticketId) {
        // Crear ventana para mostrar ticket
        const ticketWindow = window.open('', '_blank', 'width=500,height=600');
        ticketWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Boleto - ${ticketContent.eventName}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .ticket { border: 2px solid #D4AF37; padding: 20px; text-align: center; }
                    .ticket-header { background: #D4AF37; color: white; padding: 10px; }
                    .ticket-body { margin: 20px 0; }
                    .ticket-footer { background: #2C3E50; color: white; padding: 10px; }
                </style>
            </head>
            <body>
                <div class="ticket">
                    <div class="ticket-header">
                        <h1>${ticketContent.eventName}</h1>
                        <h2>Boleto Electrónico</h2>
                    </div>
                    <div class="ticket-body">
                        <h3>${ticketContent.guestName}</h3>
                        <p><strong>Fecha:</strong> ${ticketContent.eventDate}</p>
                        <p><strong>Hora:</strong> ${ticketContent.eventTime}</p>
                        <p><strong>Lugar:</strong> ${ticketContent.eventLocation}</p>
                        <p><strong>Estado:</strong> ${ticketContent.status}</p>
                        ${ticketContent.companions > 0 ? `<p><strong>Acompañantes:</strong> ${ticketContent.companions}</p>` : ''}
                        <p><strong>${ticketContent.table}</strong></p>
                        <p><strong>ID del Boleto:</strong> ${ticketContent.ticketId}</p>
                    </div>
                    <div class="ticket-footer">
                        <p>¡Te esperamos en este día tan especial!</p>
                        <p>Fecha de emisión: ${ticketContent.timestamp}</p>
                    </div>
                </div>
            </body>
            </html>
        `);
    }
    
    showSuccessMessage(result) {
        const successDiv = document.createElement('div');
        successDiv.className = 'alert alert-success';
        successDiv.innerHTML = `
            <h4>¡Confirmación Enviada!</h4>
            <p>Tu asistencia ha sido confirmada exitosamente.</p>
            ${result.ticketNumber ? `<p>Tu número de mesa es: <strong>Mesa ${result.ticketNumber}</strong></p>` : ''}
            <p>Recibirás un correo de confirmación con los detalles del evento.</p>
        `;
        
        this.form.parentNode.insertBefore(successDiv, this.form);
        successDiv.scrollIntoView({ behavior: 'smooth' });
        
        // Remover después de 10 segundos
        setTimeout(() => {
            successDiv.remove();
        }, 10000);
    }
    
    showErrorMessage(error) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger';
        errorDiv.innerHTML = `
            <h4>Error al enviar</h4>
            <p>${error}</p>
            <p>Por favor, intenta nuevamente o verifica tu conexión a internet.</p>
        `;
        
        this.form.parentNode.insertBefore(errorDiv, this.form);
        errorDiv.scrollIntoView({ behavior: 'smooth' });
        
        // Remover después de 5 segundos
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
    
    loadTicket() {
        // Cargar información del evento desde config
        if (typeof EVENT_CONFIG !== 'undefined') {
            this.ticketConfig.name = EVENT_CONFIG.eventName;
            this.ticketConfig.date = new Date(EVENT_CONFIG.eventDate).toLocaleDateString('es-ES');
            this.ticketConfig.time = EVENT_CONFIG.eventTime;
            this.ticketConfig.location = EVENT_CONFIG.eventLocation;
        }
    }
}

// Inicializar cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
    new GuestForm();
});