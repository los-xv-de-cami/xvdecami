// Sistema de Confirmación de Asistencia
class ConfirmacionAsistencia {
    constructor() {
        this.form = document.getElementById('guestForm');
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupConditionalFields();
    }

    bindEvents() {
        // Envío del formulario
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Campos condicionales
        document.querySelectorAll('input[name="asistencia"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handleAsistenciaChange(e));
        });

        document.getElementById('companions').addEventListener('change', (e) => this.handleAcompanantesChange(e));
    }

    setupConditionalFields() {
        // Inicializar campos ocultos
        this.handleAsistenciaChange();
    }

    handleAsistenciaChange() {
        const asistenciaSi = document.querySelector('input[name="asistencia"][value="si"]').checked;
        const acompañaGroup = document.getElementById('companionsSection');
        const nombresGroup = document.getElementById('companionFields');
        
        if (asistenciaSi) {
            acompañaGroup.style.display = 'block';
            this.handleAcompanantesChange();
        } else {
            acompañaGroup.style.display = 'none';
            nombresGroup.style.display = 'none';
            document.getElementById('companions').value = '0';
        }
    }

    handleAcompanantesChange() {
        const numAcompanantes = document.getElementById('companions').value;
        const nombresGroup = document.getElementById('companionFields');
        
        if (parseInt(numAcompanantes) > 0) {
            nombresGroup.style.display = 'block';
            
            // Generar campos dinámicamente para cada acompañante
            this.generateCompanionFields(parseInt(numAcompanantes));
        } else {
            nombresGroup.style.display = 'none';
            nombresGroup.innerHTML = '';
        }
    }

    generateCompanionFields(count) {
        const container = document.getElementById('companionFields');
        container.innerHTML = '';
        
        for (let i = 1; i <= count; i++) {
            const fieldGroup = document.createElement('div');
            fieldGroup.className = 'companion-field-group';
            fieldGroup.innerHTML = `
                <label class="form-label">Acompañante ${i} - Nombre Completo</label>
                <input type="text" name="companion_${i}" class="form-input" required>
            `;
            container.appendChild(fieldGroup);
        }
    }



    async handleSubmit(e) {
        e.preventDefault();
        
        // Validar formulario
        if (!this.validateForm()) {
            return;
        }

        // Mostrar loading
        this.showLoading(true);

        try {
            // Recopilar datos del formulario
            const formData = this.collectFormData();
            
            // Enviar a Google Sheets
            await this.sendToGoogleSheets(formData);
            
            // Mostrar mensaje de éxito
            this.showSuccess();
            
        } catch (error) {
            console.error('Error:', error);
            this.showError('Hubo un error al enviar la confirmación. Por favor intenta de nuevo.');
        } finally {
            this.showLoading(false);
        }
    }

    validateForm() {
        const requiredFields = ['name', 'email', 'phone', 'asistencia'];
        const asistenciaSi = document.querySelector('input[name="asistencia"][value="si"]').checked;
        
        // Validar campos requeridos básicos
        for (let field of requiredFields) {
            const element = document.querySelector(`[name="${field}"]`);
            if (!element || (element.type === 'radio' && !element.checked)) {
                if (element && element.type === 'radio') {
                    // Para radio buttons, verificar si alguno está seleccionado
                    const radioGroup = document.querySelectorAll(`input[name="${field}"]`);
                    const isSelected = Array.from(radioGroup).some(radio => radio.checked);
                    if (!isSelected) {
                        this.showFieldError(field, 'Este campo es requerido');
                        return false;
                    }
                } else {
                    this.showFieldError(field, 'Este campo es requerido');
                    return false;
                }
            }
        }

        // Validar email
        const email = document.getElementById('email').value;
        if (!this.isValidEmail(email)) {
            this.showFieldError('email', 'Por favor ingresa un email válido');
            return false;
        }

        // Si confirmó asistencia, validar campos de acompañantes si es necesario
        if (asistenciaSi) {
            const numAcompanantes = document.getElementById('companions').value;
            if (parseInt(numAcompanantes) > 0) {
                // Verificar que los campos de acompañantes estén llenos
                const companionFields = document.querySelectorAll('[name^="companion_"]');
                for (let field of companionFields) {
                    if (!field.value.trim()) {
                        this.showFieldError(field.name, 'El nombre del acompañante es requerido');
                        return false;
                    }
                }
            }
        }

        return true;
    }

    showFieldError(fieldName, message) {
        // Remover errores previos
        this.clearFieldError(fieldName);
        
        // Mostrar nuevo error
        const field = document.querySelector(`[name="${fieldName}"]`) || 
                     document.getElementById(fieldName);
        
        if (field) {
            field.style.borderColor = 'var(--error-red)';
            
            // Crear mensaje de error
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.style.color = 'var(--error-red)';
            errorDiv.style.fontSize = '0.9rem';
            errorDiv.style.marginTop = '5px';
            errorDiv.textContent = message;
            
            field.parentNode.appendChild(errorDiv);
            
            // Scroll al campo con error
            field.scrollIntoView({ behavior: 'smooth', block: 'center' });
            field.focus();
        }
    }

    clearFieldError(fieldName) {
        const field = document.querySelector(`[name="${fieldName}"]`) || 
                     document.getElementById(fieldName);
        
        if (field) {
            field.style.borderColor = 'var(--gray-border)';
            
            // Remover mensaje de error
            const errorDiv = field.parentNode.querySelector('.field-error');
            if (errorDiv) {
                errorDiv.remove();
            }
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    collectFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        // Campos básicos
        data.nombre = formData.get('name');
        data.email = formData.get('email');
        data.telefono = formData.get('phone');
        data.asistencia = formData.get('asistencia');
        
        // Acompañantes
        data.num_acompanantes = formData.get('companions') || '0';
        
        // Recopilar nombres de acompañantes
        const companionNames = [];
        const numAcompanantes = parseInt(formData.get('companions') || '0');
        for (let i = 1; i <= numAcompanantes; i++) {
            const companionName = formData.get(`companion_${i}`);
            if (companionName) {
                companionNames.push(companionName);
            }
        }
        data.nombres_acompanantes = companionNames.join(', ');
        data.observaciones = formData.get('notes') || '';
        
        // Metadatos
        data.fecha_confirmacion = new Date().toISOString();
        data.id_invitado = this.generateGuestId();
        data.estado = 'pendiente'; // pendiente, confirmado, confirmado_con_acompanantes, no_asistira
        
        return data;
    }

    generateGuestId() {
        // Generar ID único basado en timestamp y datos aleatorios
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `CAMILA_${timestamp}_${random}`.toUpperCase();
    }

    async sendToGoogleSheets(data) {
        // Configuración de Google Apps Script Web App
        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyWqWNsrj4-a3YXpHym8uubF30r3XNwkr_DCvKk6wEYojRWCJoUwuOoukIq8FKC55l5/exec';
        
        try {
            // Convertir datos a FormData (formato que funciona con el Web App)
            const formData = new FormData();
            for (const [key, value] of Object.entries(data)) {
                if (Array.isArray(value)) {
                    formData.append(key, value.join(', '));
                } else {
                    formData.append(key, value.toString());
                }
            }

            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: formData
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
        const existingData = JSON.parse(localStorage.getItem('camila_confirmaciones') || '[]');
        existingData.push(data);
        localStorage.setItem('camila_confirmaciones', JSON.stringify(existingData));
        
        console.log('Datos guardados localmente como respaldo');
    }

    showLoading(show) {
        const btn = document.querySelector('.form-submit-btn');
        const btnText = btn.querySelector('.btn-text');
        const btnLoading = btn.querySelector('.btn-loading');
        
        if (show) {
            btn.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
        } else {
            btn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    }

    showSuccess() {
        // Ocultar formulario
        document.querySelector('.confirmation-form-container').style.display = 'none';
        
        // Mostrar mensaje de éxito
        document.getElementById('successMessage').style.display = 'block';
        
        // Scroll al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showError(message) {
        // Crear alerta de error
        const alertDiv = document.createElement('div');
        alertDiv.className = 'error-alert';
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--error-red);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
            z-index: 1000;
            max-width: 300px;
            font-size: 0.9rem;
            line-height: 1.4;
        `;
        alertDiv.textContent = message;
        
        document.body.appendChild(alertDiv);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 5000);
    }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new ConfirmacionAsistencia();
});
