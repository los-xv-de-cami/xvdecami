/**
 * CONFIG.JS ACTUALIZADO CON ESPACIOS ESPECÍFICOS PARA TUS DATOS
 * XV Años de Camila - Sistema de Boletos
 * 
 * 👇👇👇 INSTRUCCIONES PARA COMPLETAR 👇👇👇
 * 
 * 1. REEMPLAZAR "TU_SPREADSHEET_ID_REAL" con tu ID de Google Sheets
 * 2. REEMPLAZAR "TU_URL_WEB_APP_COMPLETA" con tu URL del Web App
 * 
 * 📍 CÓMO OBTENER LOS DATOS:
 * 
 * 📊 SPREADSHEET_ID:
 * - Ve a tu Google Sheets
 * - La URL se ve así: https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit
 * - Copia todo el ID (larga cadena de letras y números)
 * 
 * 🌐 WEB APP URL:
 * - Ve a tu Google Apps Script
 * - Implementar → Gestionar implementaciones
 * - Copia la URL completa que termina en "/exec"
 */

const EVENT_CONFIG = {
    // ========================================
    // INFORMACIÓN DEL EVENTO
    // ========================================
    eventName: "XV Años de Camila",
    eventDate: "2025-12-15", // Formato: YYYY-MM-DD
    eventTime: "19:00", // Formato: HH:MM
    eventLocation: "Salón de Eventos Los Rosales",
    eventAddress: "Av. Principal 123, Ciudad, Estado",
    
    // ========================================
    // CAPACIDAD Y MESAS
    // ========================================
    maxGuests: 250,           // Capacidad máxima total
    tablesCount: 25,          // Número de mesas disponibles
    guestsPerTable: 10,       // Personas por mesa
    
    // ========================================
    // COLORES DEL TEMA
    // ========================================
    colors: {
        primary: "#D4AF37",        // Dorado principal
        primaryDark: "#B8941F",    // Dorado oscuro
        secondary: "#2C3E50",      // Azul oscuro
        success: "#27AE60",        // Verde para confirmaciones
        warning: "#F39C12",        // Amarillo para pendientes
        danger: "#E74C3C",         // Rojo para rechazos
        textPrimary: "#2C3E50",    // Texto principal
        textSecondary: "#6C757D"   // Texto secundario
    },
    
    // ========================================
    // CONFIGURACIÓN DE EMAILS
    // ========================================
    email: {
        from: "camila@quinceañera.com",      // Email de origen
        adminEmail: "admin@quinceañera.com", // Email del administrador
        fromName: "XV Años de Camila",       // Nombre que aparece en emails
        replyTo: "info@quinceañera.com"      // Email para respuestas
    },
    
    // ========================================
    // GOOGLE SHEETS Y APPS SCRIPT - ¡COMPLETAR AQUÍ!
    // ========================================
    sheets: {
        // 👇👇👇 PEGAR TU SPREADSHEET_ID AQUÍ 👇👇👇
        // Reemplaza "TU_SPREADSHEET_ID_REAL" con tu ID real
        spreadsheetId: "1lNvGPhE7tKa4HrUjny3YpdD90pRy6kUGm9yZxe2a-sM",     // ✅ CONFIGURADO CON TUS DATOS
        
        // 👇👇👇 PEGAR TU URL DEL WEB APP AQUÍ 👇👇👇
        // Reemplaza "TU_URL_WEB_APP_COMPLETA" con tu URL real
        scriptUrl: "https://script.google.com/macros/s/AKfycbxnrOFAIQ9nGKrdw6YcR5_mmM8bLEPlHE1ab0eqAyEqwzyusi4AnEsPr0xcgBXVn5QW/exec",        // ✅ CONFIGURADO CON TU URL
        
        sheetName: "Confirmaciones"
    },
    
    // ========================================
    // CONFIGURACIÓN DE BOLETOS
    // ========================================
    tickets: {
        includeQR: true,           // Incluir código QR
        includePhoto: true,        // Incluir foto de la quinceañera
        includeTable: true,        // Mostrar mesa asignada
        includeEventInfo: true,    // Información del evento
        includeLogo: true,         // Logo en el boleto
        qrSize: 120,              // Tamaño del QR en píxeles
        ticketWidth: 400,         // Ancho del boleto en píxeles
        ticketHeight: 600         // Alto del boleto en píxeles
    },
    
    // ========================================
    // CONFIGURACIÓN DEL FORMULARIO
    // ========================================
    form: {
        requirePhone: true,        // Teléfono obligatorio
        requireName: true,         // Nombre obligatorio
        maxCompanions: 9,         // Máximo acompañantes permitidos
        allowDietaryRestrictions: false,     // Permitir restricciones alimentarias (DESHABILITADO)
        allowSpecialNeeds: true,            // Permitir necesidades especiales
        confirmationMessage: "Gracias por confirmar tu asistencia. Recibirás un correo de confirmación pronto.",
        ticketDeliveryMessage: "Los boletos electrónicos serán enviados unos días antes del evento."
    },
    
    // ========================================
    // CONFIGURACIÓN DE LA GALERÍA (Opcional)
    // ========================================
    gallery: {
        enabled: false,            // Habilitar galería de fotos
        photos: [],                // Array de URLs de fotos
        allowGuestUploads: false,  // Permitir que invitados suban fotos
        moderationRequired: true   // Moderación de fotos de invitados
    },
    
    // ========================================
    // REDES SOCIALES (Opcional)
    // ========================================
    social: {
        hashtag: "#XVAnosDeCamila",     // Hashtag del evento
        instagram: "",                  // URL de Instagram
        facebook: "",                   // URL de Facebook
        tiktok: "",                     // URL de TikTok
        tiktokUser: "@camila_xv"        // Usuario de TikTok
    },
    
    // ========================================
    // CONFIGURACIÓN AVANZADA
    // ========================================
    advanced: {
        autoAssignTables: true,         // Habilitar asignación automática
        requireTableAssignment: true,   // Requerir asignación de mesa
        sendReminderEmails: true,       // Enviar recordatorios por email
        reminderDays: [7, 3, 1],        // Días antes del evento para recordatorios
        showPublicStats: false,         // Mostrar estadísticas públicas
        enableGuestList: true,          // Habilitar lista de invitados
        enableLiveCheckIn: true         // Habilitar check-in en vivo
    },
    
    // ========================================
    // MENSAJES PERSONALIZADOS
    // ========================================
    messages: {
        welcome: "¡Estás invitado a celebrar conmigo mis XV Años!",
        invitation: "Te invitamos a acompañarnos en este día tan especial.",
        confirmationThanks: "¡Gracias por confirmar tu asistencia!",
        ticketDelivery: "Recibe tus boletos electrónicos días antes del evento.",
        finalMessage: "¡Esperamos verte en mi celebración!",
        
        // Mensajes para administración
        adminNewGuest: "Nueva confirmación recibida",
        adminGuestDeclined: "Invitado confirmó que no asistirá",
        adminTableAssigned: "Mesa asignada exitosamente",
        adminTicketsGenerated: "Boletos generados correctamente"
    }
};

/**
 * Función para verificar que la configuración está completa
 */
function verificarConfiguracionCompleta() {
    const errores = [];
    
    // Verificar que los placeholders fueron reemplazados
    if (EVENT_CONFIG.sheets.spreadsheetId === "TU_SPREADSHEET_ID_REAL") {
        errores.push("❌ SPREADSHEET_ID no configurado - reemplazar con ID real");
    }
    
    if (EVENT_CONFIG.sheets.scriptUrl === "TU_URL_WEB_APP_COMPLETA") {
        errores.push("❌ Web App URL no configurada - reemplazar con URL real");
    }
    
    // Verificar formato básico
    if (errores.length === 0) {
        console.log("✅ Configuración completa y lista para usar");
    } else {
        console.log("🚨 Configuración incompleta:");
        errores.forEach(error => console.log(error));
    }
    
    return errores.length === 0;
}