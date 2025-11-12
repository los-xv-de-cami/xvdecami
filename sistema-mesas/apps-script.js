/**
 * Google Apps Script Web App para gestión de asignaciones de mesas
 * Configuración requerida:
 * - Crear un Web App en Google Apps Script
 * - Configurar el acceso para "Anyone, even anonymous" o según necesidades
 * - Reemplazar SPREADSHEET_ID con el ID de tu hoja de cálculo
 * - Desplegar como Web App
 */

const SPREADSHEET_ID = '1lNvGPhE7tKa4HrUjny3YpdD90pRy6kUGm9yZxe2a-sM'; // Reemplaza con el ID real de tu Google Sheet

/**
 * Función principal que maneja las peticiones del frontend
 */
function doPost(e) {
  console.log('=== DO_POST INICIADO ===');
  console.log('Event object:', JSON.stringify(e));
  console.log('Parameters:', JSON.stringify(e.parameter));
  console.log('PostData contents:', e.postData ? e.postData.contents : 'undefined');
  
  try {
    // Verificar que se recibió el parámetro event
    if (!e.postData || !e.postData.contents) {
      console.log('❌ No se recibió postData o contents');
      return createResponse({ error: 'No se recibieron datos - verifica la configuración del Web App' });
    }
    
    let data;
    try {
      data = JSON.parse(e.postData.contents);
      console.log('✅ Datos parseados de JSON:', data);
    } catch (parseError) {
      console.log('⚠️ No es JSON válido, intentando FormData...');
      // Si no es JSON, intentar obtener de FormData
      data = {
        event: e.parameter.event
      };
      
      // Agregar assignments si existe
      if (e.parameter.assignments) {
        data.assignments = e.parameter.assignments;
      }
      
      console.log('📝 Datos extraídos de FormData:', data);
    }
    
    // Validar que existe el parámetro event
    if (!data.event) {
      console.log('❌ Falta el parámetro event');
      return createResponse({ error: 'Parámetro event requerido' });
    }
    
    console.log('🔄 Procesando evento:', data.event);
    
    // Rutear según el tipo de evento
    switch (data.event) {
      case 'loadGuests':
        console.log('📋 Llamando handleLoadGuests...');
        return handleLoadGuests();
        
      case 'saveAssignments':
        console.log('💾 Llamando handleSaveAssignments...');
        return handleSaveAssignments(data.assignments);
        
      case 'test':
        console.log('🧪 Procesando evento de prueba...');
        return createResponse({ 
          success: true, 
          message: 'Conexión exitosa con Apps Script',
          timestamp: new Date().toISOString(),
          spreadsheetId: SPREADSHEET_ID
        });
        
      default:
        console.log('❌ Evento no reconocido:', data.event);
        return createResponse({ error: `Evento no reconocido: ${data.event}` });
    }
    
  } catch (error) {
    console.error('💥 Error crítico en doPost:', error);
    console.error('Stack trace:', error.stack);
    return createResponse({ error: `Error interno del servidor: ${error.toString()}` });
  }
}

/**
 * Función GET para pruebas (opcional)
 */
function doGet(e) {
  console.log('GET request received:', JSON.stringify(e));
  
  return ContentService
    .createTextOutput(`
      <h1>🧪 Apps Script está funcionando</h1>
      <p><strong>Estado:</strong> ✅ Activo</p>
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      <p><strong>Spreadsheet ID:</strong> ${SPREADSHEET_ID}</p>
      <p><strong>URL utilizada:</strong> ${ScriptApp.getService().getUrl()}</p>
      
      <h2>🧪 Probar conexión</h2>
      <form method="POST">
        <input type="hidden" name="event" value="test">
        <button type="submit">Probar conexión</button>
      </form>
      
      <h2>📊 Información de depuración</h2>
      <p>Esta página es solo para pruebas. El frontend debe usar POST requests.</p>
    `)
    .setMimeType(ContentService.MimeType.HTML);
}

/**
 * Maneja la carga de invitados desde Google Sheets
 */
function handleLoadGuests() {
  console.log('🔍 Iniciando handleLoadGuests...');
  
  try {
    console.log('📊 SPREADSHEET_ID configurado:', SPREADSHEET_ID);
    
    if (SPREADSHEET_ID === 'TU_SPREADSHEET_ID_AQUI') {
      console.error('❌ SPREADSHEET_ID no está configurado');
      return createResponse({ error: 'SPREADSHEET_ID no está configurado en Apps Script' });
    }
    
    // Abrir la hoja de cálculo
    console.log('📖 Abriendo hoja de cálculo...');
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    console.log('✅ Hoja abierta:', spreadsheet.getName());
    
    const sheet = spreadsheet.getActiveSheet();
    console.log('📄 Hoja activa:', sheet.getName());
    
    // Obtener todos los datos
    console.log('📋 Obteniendo datos de la hoja...');
    const range = sheet.getDataRange();
    console.log('📊 Rango encontrado:', {
      row: range.getRow(),
      column: range.getColumn(), 
      numRows: range.getNumRows(),
      numColumns: range.getNumColumns()
    });
    
    const values = range.getValues();
    console.log('📋 Total filas de datos:', values.length);
    
    // Convertir a objetos de invitado
    const guests = [];
    const headers = values[0]; // Primera fila como headers
    
    console.log('📌 Headers encontrados:', headers);
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      
      // Verificar que la fila no esté vacía
      if (!row[0]) continue;
      
      const guest = {
        id: row[0] || '',           // Columna A - ID
        name: row[1] || '',         // Columna B - Nombre
        email: row[2] || '',        // Columna C - Email
        phone: row[3] || '',        // Columna D - Teléfono
        attending: row[4] || '',    // Columna E - Asistencia
        companions: row[5] || '',   // Columna F - Acompañantes
        tableAssignment: row[10] || '' // Columna K - Asignación de mesa
      };
      
      guests.push(guest);
      
      // Log de los primeros 3 invitados para debugging
      if (i <= 3) {
        console.log(`📝 Invitado ${i}:`, guest);
      }
    }
    
    console.log('✅ Procesados', guests.length, 'invitados');
    
    const response = createResponse({ 
      success: true, 
      guests: guests,
      totalGuests: guests.length,
      debugInfo: {
        spreadsheetId: SPREADSHEET_ID,
        sheetName: sheet.getName(),
        totalRows: values.length,
        timestamp: new Date().toISOString()
      }
    });
    
    console.log('🎉 Respuesta creada exitosamente');
    return response;
    
  } catch (error) {
    console.error('💥 Error cargando invitados:', error);
    console.error('📍 Stack trace:', error.stack);
    return createResponse({ 
      error: `Error cargando datos: ${error.toString()}`,
      debugInfo: {
        spreadsheetId: SPREADSHEET_ID,
        timestamp: new Date().toISOString()
      }
    });
  }
}

/**
 * Maneja el guardado de asignaciones en Google Sheets
 */
function handleSaveAssignments(assignmentsData) {
  try {
    // Validar que se recibieron las asignaciones
    if (!assignmentsData) {
      return createResponse({ error: 'No se recibieron asignaciones' });
    }
    
    // Parsear las asignaciones si viene como string
    let assignments;
    if (typeof assignmentsData === 'string') {
      try {
        assignments = JSON.parse(assignmentsData);
      } catch (parseError) {
        return createResponse({ error: 'Formato de asignaciones inválido' });
      }
    } else {
      assignments = assignmentsData;
    }
    
    // Abrir la hoja de cálculo
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getActiveSheet();
    
    // Obtener datos actuales
    const range = sheet.getDataRange();
    const values = range.getValues();
    const headers = values[0];
    
    // Encontrar índices de columnas
    const idColumnIndex = 0; // Columna A
    const tableAssignmentColumnIndex = 10; // Columna K
    
    // Crear mapa de IDs a filas para búsqueda rápida
    const idToRowMap = new Map();
    for (let i = 1; i < values.length; i++) {
      if (values[i][idColumnIndex]) {
        idToRowMap.set(values[i][idColumnIndex], i + 1); // +1 porque getRange usa índices 1-based
      }
    }
    
    // Procesar cada asignación
    let updatedCount = 0;
    const errors = [];
    
    assignments.forEach(assignment => {
      const guestId = assignment.guestId;
      const tableAssignment = assignment.tableAssignment;
      
      if (!guestId) {
        errors.push('ID de invitado requerido');
        return;
      }
      
      // Buscar la fila del invitado
      const rowNumber = idToRowMap.get(guestId);
      if (!rowNumber) {
        errors.push(`Invitado con ID ${guestId} no encontrado`);
        return;
      }
      
      try {
        // Actualizar la columna K (asignación de mesa)
        sheet.getRange(rowNumber, tableAssignmentColumnIndex + 1).setValue(tableAssignment);
        updatedCount++;
      } catch (updateError) {
        errors.push(`Error actualizando ID ${guestId}: ${updateError.toString()}`);
      }
    });
    
    // Responder con resultado
    return createResponse({ 
      success: true, 
      updated: updatedCount,
      errors: errors,
      message: `${updatedCount} asignaciones guardadas exitosamente`
    });
    
  } catch (error) {
    console.error('Error guardando asignaciones:', error);
    return createResponse({ error: `Error guardando asignaciones: ${error.toString()}` });
  }
}

/**
 * Función auxiliar para crear respuesta HTTP
 */
function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Función de prueba para verificar la configuración
 */
function testConnection() {
  const response = handleLoadGuests();
  Logger.log('Respuesta de prueba:', response.getContent());
  
  return JSON.parse(response.getContent());
}

/**
 * Función para limpiar todas las asignaciones (usar con cuidado)
 */
function clearAllAssignments() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getActiveSheet();
  
  const range = sheet.getRange('K:K'); // Columna K
  range.clearContent();
  
  return createResponse({ 
    success: true, 
    message: 'Todas las asignaciones han sido eliminadas' 
  });
}

/**
 * Función para obtener estadísticas de ocupación
 */
function getOccupancyStats() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getActiveSheet();
  
  const range = sheet.getDataRange();
  const values = range.getValues();
  
  let totalGuests = 0;
  let attendingGuests = 0;
  let assignedGuests = 0;
  const tableOccupancy = Array(25).fill(0);
  
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    
    if (!row[0]) continue; // Skip empty rows
    
    totalGuests++;
    
    if (row[4] && row[4].toLowerCase() === 'si') { // Columna E - Asistencia
      attendingGuests++;
      
      const tableAssignment = row[10]; // Columna K - Asignación
      if (tableAssignment && !isNaN(tableAssignment)) {
        const tableNumber = parseInt(tableAssignment);
        if (tableNumber >= 1 && tableNumber <= 25) {
          assignedGuests++;
          tableOccupancy[tableNumber - 1]++;
        }
      }
    }
  }
  
  return createResponse({
    success: true,
    stats: {
      totalGuests,
      attendingGuests,
      assignedGuests,
      unassignedGuests: attendingGuests - assignedGuests,
      tableOccupancy,
      averageOccupancy: tableOccupancy.reduce((a, b) => a + b, 0) / 25
    }
  });
}