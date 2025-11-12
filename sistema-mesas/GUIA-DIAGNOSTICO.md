# 🔧 GUÍA DE DIAGNÓSTICO PASO A PASO
# Solucionando: "Error al cargar la aplicación"

## 🚨 **PROBLEMA: "Error al cargar la aplicación"**

Vamos a diagnosticar el problema paso a paso. Sigue estas instrucciones en orden:

---

## 📋 **PASO 1: Verificar la configuración básica**

### A. Verificar la URL del Web App
1. En tu minisite, **presiona F12** para abrir la consola del navegador
2. En la consola, busca un mensaje que diga algo como:
   ```
   📍 URL del Apps Script: https://script.google.com/macros/s/[LARGO_ID]/exec
   ```
3. **¿Aparece la URL?** Si no, significa que no configuraste la URL correctamente

### B. Verificar configuración del SPREADSHEET_ID
En Google Apps Script, asegúrate de haber reemplazado:
```javascript
const SPREADSHEET_ID = 'TU_SPREADSHEET_ID_AQUI';
```
Por:
```javascript
const SPREADSHEET_ID = 'TU_ID_REAL_DE_GOOGLE_SHEETS';
```

---

## 🧪 **PASO 2: Probar conexión directa**

### A. Ejecutar función de prueba en la consola del navegador
1. Abre tu minisite
2. Presiona **F12** para abrir la consola
3. Copia y pega este código:

```javascript
async function testConnection() {
    try {
        console.log('🧪 Probando conexión...');
        const formData = new FormData();
        formData.append('event', 'test');
        
        const response = await fetch('TU_WEB_APP_URL_AQUI', {
            method: 'POST',
            body: formData
        });
        
        console.log('📥 Status:', response.status);
        console.log('📄 Text:', await response.text());
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}
testConnection();
```

⚠️ **IMPORTANTE**: Reemplaza `'TU_WEB_APP_URL_AQUI'` con tu URL real del Web App

### B. Ejecutar función de prueba en Apps Script
En Google Apps Script:
1. Ve a la función `testConnection()` 
2. Presiona el botón "Ejecutar" ▶️
3. Revisa los logs para ver si hay errores

---

## 📊 **PASO 3: Verificar permisos y acceso**

### A. Verificar permisos de Google Apps Script
1. En Google Apps Script, ve a **Servicios**
2. Asegúrate que **Google Sheets API** esté habilitado
3. Ve a **Ejecutar como** → **Yo**
4. Ve a **Implementar** → **Gestionar implementaciones**
5. Verifica que esté en **"Cualquier persona"** (para acceso público)

### B. Verificar permisos de Google Sheets
1. Abre tu Google Sheets
2. Comparte la hoja con **"Cualquiera con el enlace puede ver"**
3. O asegúrate que tu cuenta de Google esté autorizada para acceder

---

## 🐛 **PASO 4: Revisar logs detallados**

### A. Logs del navegador (Frontend)
1. Abre tu minisite
2. Presiona **F12**
3. Ve a la pestaña **Console**
4. Busca mensajes que empiecen con:
   - `🔄 Iniciando carga de invitados`
   - `📍 URL del Apps Script`
   - `📤 Enviando petición`
   - `❌ Error`

**Copia todos los errores que veas** y guárdalos.

### B. Logs de Google Apps Script
1. En Google Apps Script, ve a **Ejecuciones** (icono de reloj)
2. Ve la ejecución más reciente
3. Haz click en los logs detallados
4. Busca errores que empiecen con:
   - `=== DO_POST INICIADO ===`
   - `❌ Error`
   - `💥 Error crítico`

---

## 🔧 **PASO 5: Soluciones específicas por error**

### Error: "No se recibieron datos"
**Causa**: El Web App no está configurado correctamente
**Solución**:
1. Verifica que la URL del Web App sea correcta
2. Verifica que esté desplegado como "Aplicación web"
3. Verifica que el acceso sea "Cualquier persona"

### Error: "SPREADSHEET_ID no está configurado"
**Causa**: No reemplazaste el ID de la hoja
**Solución**:
1. Abre tu Google Sheets
2. Copia el ID de la URL (está entre `/d/` y `/edit`)
3. Reemplaza en Apps Script:
   ```javascript
   const SPREADSHEET_ID = 'aqui_tu_id_real';
   ```

### Error: "Permission denied" o "Access denied"
**Causa**: Permisos insuficientes
**Solución**:
1. Verifica que la hoja esté compartida correctamente
2. Verifica que Google Sheets API esté habilitado
3. Ejecuta una vez manualmente para otorgar permisos

### Error: "Columna A - ID" no encontrada
**Causa**: Estructura de la hoja incorrecta
**Solución**:
1. Verifica que tu hoja tenga las columnas A, B, C, D, E, F, K
2. Asegúrate que la primera fila tenga datos (no esté vacía)

---

## 🎯 **PASO 6: Probar página de prueba**

Crea una página HTML simple para probar:

```html
<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
<h1>🧪 Prueba de Conexión</h1>
<button onclick="testAppsScript()">Probar Apps Script</button>
<div id="result"></div>

<script>
async function testAppsScript() {
    const result = document.getElementById('result');
    result.innerHTML = 'Probando...';
    
    try {
        const formData = new FormData();
        formData.append('event', 'test');
        
        const response = await fetch('TU_WEB_APP_URL_AQUI', {
            method: 'POST',
            body: formData
        });
        
        const text = await response.text();
        result.innerHTML = `<pre>${text}</pre>`;
        
    } catch (error) {
        result.innerHTML = `<p style="color:red">Error: ${error.message}</p>`;
    }
}
</script>
</body>
</html>
```

---

## 📞 **PASO 7: Contactar soporte**

Si después de seguir todos los pasos aún tienes problemas, comparte:

1. **URL del Web App**
2. **Screenshot de la consola del navegador** (F12)
3. **Screenshot de los logs de Apps Script**
4. **ID de tu Google Sheets** (solo para verificar)
5. **Error específico** que aparece en la consola

---

## ✅ **CHECKLIST FINAL**

- [ ] ✅ SPREADSHEET_ID configurado correctamente
- [ ] ✅ URL del Web App configurada en script.js  
- [ ] ✅ Google Apps Script desplegado como Web App
- [ ] ✅ Permisos configurados ("Cualquier persona")
- [ ] ✅ Google Sheets API habilitado
- [ ] ✅ Hoja de Google Sheets compartida correctamente
- [ ] ✅ Primera fila de la hoja tiene datos (no vacía)
- [ ] ✅ Función de prueba `testConnection()` ejecutada sin errores
- [ ] ✅ Logs de consola del navegador revisados
- [ ] ✅ Logs de Apps Script revisados

---

**🎯 OBJETIVO**: Al final del diagnóstico, deberías ver un mensaje como:
```
✅ Datos parseados exitosamente: {success: true, guests: [...], totalGuests: 25}
```

Si ves ese mensaje, el problema está resuelto y puedes usar el minisite normalmente.