/**
 * Google Apps Script - Sistema de Boletos Quinceañera Camila
 * 
 * INSTRUCCIONES DE IMPLEMENTACIÓN:
 * 1. Crear un nuevo proyecto en Google Apps Script (script.google.com)
 * 2. Reemplazar el código predeterminado con este archivo
 * 3. Configurar las variables SPREADSHEET_ID y SHEET_NAME
 * 4. Desplegar como Web App con permisos de "Anyone"
 * 5. Copiar la URL del Web App y actualizar en el formulario
 */

// ========================================
// CONFIGURACIÓN
// ========================================

const CONFIG = {
  SPREADSHEET_ID: 'TU_SPREADSHEET_ID_AQUI', // Reemplazar con el ID de tu Google Sheets
  SHEET_NAME: 'Confirmaciones',
  EMAIL_FROM: 'camila@quinceañera.com', // Email de origen
  EVENT_NAME: 'XV Años de Camila',
  ADMIN_EMAIL: 'admin@quinceañera.com' // Email del administrador
};

// ========================================
// FUNCIONES PRINCIPALES
// ========================================

/**
 * Función principal que recibe las confirmaciones del formulario
 * @param {Object} data - Datos del formulario
 * @returns {Object} Resultado de la operación
 */
function doPost(e) {
  try {
    // Verificar que la petición tenga datos
    if (!e.postData || !e.postData.contents) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'No se recibieron datos' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Parsear los datos
    const data = JSON.parse(e.postData.contents);
    
    // Validar datos requeridos
    const validation = validateGuestData(data);
    if (!validation.isValid) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: validation.error }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Guardar en Google Sheets
    const result = saveGuestConfirmation(data);
    
    if (result.success) {
      // Enviar email de confirmación
      sendConfirmationEmail(data);
      
      // Notificar al administrador
      notifyAdmin(data);
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error en doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Error interno del servidor' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Función para manejar peticiones GET (opcional)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      status: 'ok', 
      message: 'Sistema de Boletos - XV Años de Camila',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ========================================
// VALIDACIÓN DE DATOS
// ========================================

/**
 * Valida los datos del invitado
 * @param {Object} data - Datos del formulario
 * @returns {Object} Resultado de la validación
 */
function validateGuestData(data) {
  const requiredFields = ['nombre', 'email', 'telefono', 'asistencia'];
  
  // Verificar campos requeridos
  for (let field of requiredFields) {
    if (!data[field] || data[field].trim() === '') {
      return { isValid: false, error: `El campo ${field} es requerido` };
    }
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { isValid: false, error: 'El email no es válido' };
  }

  // Validar asistencia
  if (!['si', 'no'].includes(data.asistencia)) {
    return { isValid: false, error: 'El valor de asistencia no es válido' };
  }

  // Si confirmó asistencia, validar acompañantes
  if (data.asistencia === 'si') {
    const numAcompanantes = parseInt(data.num_acompanantes || '0');
    if (numAcompanantes > 0 && (!data.nombres_acompanantes || data.nombres_acompanantes.trim() === '')) {
      return { isValid: false, error: 'Debe especificar los nombres de los acompañantes' };
    }
  }

  return { isValid: true };
}

// ========================================
// GESTIÓN DE GOOGLE SHEETS
// ========================================

/**
 * Guarda la confirmación en Google Sheets
 * @param {Object} data - Datos del invitado
 * @returns {Object} Resultado de la operación
 */
function saveGuestConfirmation(data) {
  try {
    const sheet = getSheet();
    
    // Generar ID único si no existe
    if (!data.id_invitado) {
      data.id_invitado = generateGuestId();
    }

    // Determinar estado
    data.estado = data.asistencia === 'si' ? 'confirmado' : 'no_asistira';
    
    // Preparar datos para la hoja
    const rowData = [
      data.id_invitado,           // A: ID Invitado
      data.nombre,               // B: Nombre
      data.email,                // C: Email
      data.telefono,             // D: Teléfono
      data.asistencia,           // E: Asistencia (si/no)
      data.num_acompanantes || '0', // F: Número de acompañantes
      data.nombres_acompanantes || '', // G: Nombres de acompañantes
      data.estado,               // H: Estado
      data.fecha_confirmacion || new Date().toISOString(), // I: Fecha de confirmación
      '',                        // J: Mesa asignada (se llenará después)
      new Date().toISOString()   // K: Última actualización
    ];

    // Verificar si el invitado ya existe
    const existingRow = findExistingGuest(sheet, data.email);
    
    if (existingRow > 0) {
      // Actualizar fila existente
      sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
      console.log(`Actualizada confirmación para: ${data.nombre} (${data.email})`);
    } else {
      // Insertar nueva fila
      sheet.appendRow(rowData);
      console.log(`Nueva confirmación agregada: ${data.nombre} (${data.email})`);
    }

    return { success: true, message: 'Confirmación guardada correctamente', id: data.id_invitado };

  } catch (error) {
    console.error('Error guardando en Sheets:', error);
    return { success: false, error: 'Error al guardar la confirmación' };
  }
}

/**
 * Obtiene la hoja de cálculo
 * @returns {Sheet} Hoja de Google Sheets
 */
function getSheet() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
  
  if (!sheet) {
    // Crear la hoja si no existe
    sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
    createSheetHeaders(sheet);
  }
  
  return sheet;
}

/**
 * Crea los encabezados de la hoja
 * @param {Sheet} sheet - Hoja de Google Sheets
 */
function createSheetHeaders(sheet) {
  const headers = [
    'ID Invitado',
    'Nombre',
    'Email', 
    'Teléfono',
    'Asistencia',
    'Número de Acompañantes',
    'Nombres de Acompañantes',
    'Estado',
    'Fecha Confirmación',
    'Mesa Asignada',
    'Última Actualización'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formatear encabezados
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#D4AF37');
  headerRange.setFontColor('white');
  
  // Congelar primera fila
  sheet.setFrozenRows(1);
}

/**
 * Busca un invitado existente por email
 * @param {Sheet} sheet - Hoja de Google Sheets
 * @param {string} email - Email del invitado
 * @returns {number} Número de fila o 0 si no existe
 */
function findExistingGuest(sheet, email) {
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][2] === email) { // Columna C (Email)
      return i + 1; // +1 porque las filas empiezan en 1
    }
  }
  
  return 0;
}

// ========================================
// GESTIÓN DE EMAILS
// ========================================

/**
 * Envía email de confirmación al invitado
 * @param {Object} data - Datos del invitado
 */
function sendConfirmationEmail(data) {
  try {
    const subject = `Confirmación de Asistencia - ${CONFIG.EVENT_NAME}`;
    
    const emailBody = createConfirmationEmail(data);
    
    GmailApp.sendEmail(data.email, subject, '', {
      htmlBody: emailBody,
      name: CONFIG.EVENT_NAME
    });
    
    console.log(`Email de confirmación enviado a: ${data.email}`);
    
  } catch (error) {
    console.error('Error enviando email:', error);
  }
}

/**
 * Crea el contenido del email de confirmación
 * @param {Object} data - Datos del invitado
 * @returns {string} HTML del email
 */
function createConfirmationEmail(data) {
  const asistencia = data.asistencia === 'si' ? 'Confirmada' : 'Rechazada';
  const colorAsistencia = data.asistencia === 'si' ? '#27AE60' : '#E74C3C';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Confirmación de Asistencia</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #000, #333); color: white; padding: 30px; text-align: center; }
        .title { color: #D4AF37; font-size: 28px; margin: 0; }
        .subtitle { margin: 10px 0 0 0; opacity: 0.9; }
        .content { background: #f8f8f8; padding: 30px; }
        .status { background: ${colorAsistencia}; color: white; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; }
        .label { font-weight: bold; color: #D4AF37; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="title">${CONFIG.EVENT_NAME}</h1>
          <p class="subtitle">Confirmación de Asistencia</p>
        </div>
        
        <div class="content">
          <h2>Hola ${data.nombre},</h2>
          
          <div class="status">
            Tu asistencia ha sido: ${asistencia}
          </div>
          
          <div class="info-box">
            <p><span class="label">Fecha del evento:</span> [Fecha del evento]</p>
            <p><span class="label">Lugar:</span> [Lugar del evento]</p>
            <p><span class="label">Hora:</span> [Hora del evento]</p>
          </div>
          
          ${data.asistencia === 'si' ? `
            <div class="info-box">
              <h3>Detalles de tu asistencia:</h3>
              <p><span class="label">Acompañantes:</span> ${data.num_acompanantes}</p>
              ${data.nombres_acompanantes ? `<p><span class="label">Nombres de acompañantes:</span> ${data.nombres_acompanantes}</p>` : ''}
            </div>
            
            <div class="info-box">
              <h3>Boletos Electrónicos</h3>
              <p>Los boletos electrónicos serán enviados unos días antes del evento. Te notificaremos cuando estén listos.</p>
            </div>
          ` : `
            <div class="info-box">
              <p>Lamentamos que no puedas acompañarnos en este día tan especial. ¡Gracias por confirmarnos tu respuesta!</p>
            </div>
          `}
          
          <p>Si tienes alguna pregunta o necesitas hacer algún cambio, no dudes en contactarnos.</p>
          
          <p>¡Esperamos verte en la celebración!</p>
        </div>
        
        <div class="footer">
          <p>${CONFIG.EVENT_NAME}</p>
          <p>Si no puedes ver este email, por favor copia y pega este enlace en tu navegador: [Link al sitio web]</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Notifica al administrador sobre nueva confirmación
 * @param {Object} data - Datos del invitado
 */
function notifyAdmin(data) {
  try {
    const subject = `Nueva Confirmación - ${data.nombre}`;
    
    const emailBody = `
      Nueva confirmación de asistencia recibida:
      
      Nombre: ${data.nombre}
      Email: ${data.email}
      Teléfono: ${data.telefono}
      Asistencia: ${data.asistencia === 'si' ? 'Confirmada' : 'No asistirá'}
      Acompañantes: ${data.num_acompanantes}
      ${data.nombres_acompanantes ? `Nombres de acompañantes: ${data.nombres_acompanantes}` : ''}
      Fecha de confirmación: ${new Date().toISOString()}
      
      Accede al panel de administración para más detalles.
    `;
    
    GmailApp.sendEmail(CONFIG.ADMIN_EMAIL, subject, emailBody);
    
  } catch (error) {
    console.error('Error notificando al admin:', error);
  }
}

// ========================================
// UTILIDADES
// ========================================

/**
 * Genera un ID único para el invitado
 * @returns {string} ID único
 */
function generateGuestId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `CAMILA_${timestamp}_${random}`.toUpperCase();
}

/**
 * Función para inicializar la hoja (ejecutar una vez)
 */
function initializeSheet() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  
  if (data.length === 1) { // Solo encabezados
    console.log('Inicializando encabezados de la hoja...');
    createSheetHeaders(sheet);
  }
  
  console.log('Hoja inicializada correctamente');
}

/**
 * Función de limpieza (opcional)
 */
function cleanupOldEntries() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  let deletedCount = 0;
  
  for (let i = data.length - 1; i > 0; i--) {
    const fechaConfirmacion = new Date(data[i][10]); // Columna K
    if (fechaConfirmacion < threeMonthsAgo && data[i][1] !== 'Nombre') {
      sheet.deleteRow(i + 1);
      deletedCount++;
    }
  }
  
  console.log(`Se eliminaron ${deletedCount} entradas antiguas`);
}

/**
 * Obtener estadísticas del evento
 * @returns {Object} Estadísticas
 */
function getEventStats() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  
  let confirmations = 0;
  let declined = 0;
  let totalGuests = 0;
  let dietaryRestrictions = {};
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const asistencia = row[4]; // Columna E
    const numAcompanantes = parseInt(row[5]) || 0; // Columna F
    const restricciones = row[7]; // Columna H
    
    if (asistencia === 'si') {
      confirmations++;
      totalGuests += numAcompanantes + 1;
    } else if (asistencia === 'no') {
      declined++;
    }
    
    // Procesar restricciones alimentarias
    if (restricciones) {
      const items = restricciones.split(', ');
      items.forEach(item => {
        const cleanItem = item.trim();
        dietaryRestrictions[cleanItem] = (dietaryRestrictions[cleanItem] || 0) + 1;
      });
    }
  }
  
  return {
    confirmations,
    declined,
    totalGuests,
    totalInvitations: confirmations + declined,
    dietaryRestrictions
  };
}

// ========================================
// API PARA PANEL DE ADMINISTRACIÓN
// ========================================

/**
 * Obtener todos los invitados (para el panel de admin)
 * @returns {Array} Array de invitados
 */
function getAllGuests() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const guests = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    guests.push({
      id: row[0],
      nombre: row[1],
      email: row[2],
      telefono: row[3],
      asistencia: row[4],
      num_acompanantes: row[5] || '0',
      nombres_acompanantes: row[6] || '',
      estado: row[7] || 'pendiente',
      fecha_confirmacion: row[8] || '',
      mesa_asignada: row[9] || null
    });
  }
  
  return guests;
}

/**
 * Asignar mesa a un invitado
 * @param {string} guestId - ID del invitado
 * @param {number} tableNumber - Número de mesa
 * @returns {Object} Resultado de la operación
 */
function assignGuestToTable(guestId, tableNumber) {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === guestId) { // Columna A (ID)
        sheet.getRange(i + 1, 12).setValue(tableNumber); // Columna L (Mesa asignada)
        sheet.getRange(i + 1, 13).setValue(new Date().toISOString()); // Columna M (Última actualización)
        
        return { success: true, message: 'Mesa asignada correctamente' };
      }
    }
    
    return { success: false, error: 'Invitado no encontrado' };
    
  } catch (error) {
    console.error('Error asignando mesa:', error);
    return { success: false, error: 'Error al asignar mesa' };
  }
}

// ========================================
// FUNCIONES DE PRUEBA
// ========================================

/**
 * Función de prueba para verificar la configuración
 */
function testConfiguration() {
  try {
    console.log('=== PRUEBA DE CONFIGURACIÓN ===');
    console.log('SPREADSHEET_ID:', CONFIG.SPREADSHEET_ID);
    console.log('SHEET_NAME:', CONFIG.SHEET_NAME);
    
    const sheet = getSheet();
    console.log('Hoja obtenida correctamente:', sheet.getName());
    
    const stats = getEventStats();
    console.log('Estadísticas:', stats);
    
    const guests = getAllGuests();
    console.log('Total de invitados:', guests.length);
    
    return { success: true, message: 'Configuración correcta' };
    
  } catch (error) {
    console.error('Error en configuración:', error);
    return { success: false, error: error.message };
  }
}