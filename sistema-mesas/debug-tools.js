/**
 * 🔧 GUÍA DE DEBUGGING PASO A PASO
 * Solucionando: "Error al cargar la aplicación"
 */

console.log('=== DIAGNÓSTICO DE GOOGLE APPS SCRIPT ===');

// PASO 1: Verificar la URL del Web App
console.log('URL del Web App configurada:', APPS_SCRIPT_URL);

// PASO 2: Función de prueba directa
async function testAppsScriptConnection() {
    try {
        console.log('1. Probando conexión directa al Apps Script...');
        
        const testData = new FormData();
        testData.append('event', 'test');
        
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: testData
        });
        
        console.log('2. Respuesta del servidor:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
        });
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }
        
        const responseText = await response.text();
        console.log('3. Respuesta completa (texto):', responseText);
        
        try {
            const jsonData = JSON.parse(responseText);
            console.log('4. Datos parseados (JSON):', jsonData);
            
            if (jsonData.error) {
                throw new Error(`Apps Script Error: ${jsonData.error}`);
            }
            
            return jsonData;
            
        } catch (parseError) {
            console.error('5. Error al parsear JSON:', parseError);
            console.error('6. Respuesta que falló:', responseText);
            throw new Error(`Respuesta no válida del servidor: ${responseText.substring(0, 100)}...`);
        }
        
    } catch (error) {
        console.error('ERROR DE CONEXIÓN:', error);
        throw error;
    }
}

// PASO 3: Verificar estructura de datos de Google Sheets
function testSheetStructure() {
    console.log('=== VERIFICANDO ESTRUCTURA DE GOOGLE SHEETS ===');
    
    // Esta función debe ejecutarse desde Apps Script console
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    
    console.log('Sheet ID:', ss.getId());
    console.log('Sheet name:', sheet.getName());
    console.log('Total rows:', sheet.getLastRow());
    console.log('Total columns:', sheet.getLastColumn());
    
    // Verificar headers
    const headers = sheet.getRange(1, 1, 1, 11).getValues()[0];
    console.log('Headers encontrados:', headers);
    
    // Verificar algunas filas de datos
    if (sheet.getLastRow() > 1) {
        const sampleData = sheet.getRange(2, 1, Math.min(5, sheet.getLastRow() - 1), 11).getValues();
        console.log('Datos de muestra:', sampleData);
    }
}

// PASO 4: Verificar permisos y configuración
function testPermissions() {
    console.log('=== VERIFICANDO PERMISOS ===');
    
    try {
        // Intentar abrir la hoja
        const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
        console.log('✅ Hoja abierta exitosamente');
        console.log('Título:', spreadsheet.getName());
        
        // Intentar leer datos
        const sheet = spreadsheet.getActiveSheet();
        const data = sheet.getDataRange().getValues();
        console.log('✅ Datos leídos:', data.length, 'filas encontradas');
        
        // Verificar columnas esperadas
        if (data.length > 0) {
            const headers = data[0];
            console.log('Headers:', headers);
            
            const expectedColumns = ['ID', 'Nombre', 'Email', 'Teléfono', 'Asistencia', 'Acompañantes', '', '', '', '', 'Asignación Mesa'];
            const foundColumns = headers.slice(0, 11); // Primeras 11 columnas
            
            console.log('Columnas encontradas:', foundColumns);
            console.log('Columnas esperadas:', expectedColumns);
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Error de permisos:', error);
        return false;
    }
}

// Función para ejecutar desde la consola del navegador
window.debugAppsScript = testAppsScriptConnection;