# Sistema de Administración de Boletos - Quinceañera Camila

## 🎉 **Descripción General**

Sistema completo para la gestión de confirmaciones de asistencia y generación de boletos electrónicos para la quinceañera de Camila. Incluye formulario de confirmación, panel de administración, gestión de mesas y generación de boletos personalizados.

## 🚀 **Características Principales**

### ✅ **Formulario de Confirmación**
- Registro de información personal (nombre, email, teléfono)
- Confirmación de asistencia con opción de acompañantes
- Registro de restricciones alimentarias y necesidades especiales
- Validación automática y envío a Google Sheets
- Confirmación por email automática

### ✅ **Panel de Administración**
- Dashboard con estadísticas en tiempo real
- Vista de todas las confirmaciones con filtros
- Gestión de mesas (25 mesas de 10 personas cada una)
- Asignación manual y automática de mesas
- Generación de boletos personalizados
- Exportación de datos y sincronización

### ✅ **Sistema de Boletos**
- Boletos con diseño elegante y temático
- Códigos QR únicos para cada invitado
- Información de mesa asignada
- Opciones de personalización
- Generación masiva e individual

### ✅ **Backend con Google Sheets**
- Almacenamiento seguro en la nube
- Google Apps Script para automatización
- APIs para el panel de administración
- Backup automático y recuperación

## 📋 **Configuración Paso a Paso**

### **Paso 1: Google Sheets Setup**

1. **Crear Google Sheet**
   ```
   1. Ve a sheets.google.com
   2. Crea una nueva hoja de cálculo
   3. Nómbrala: "Camila Quinceañera - Confirmaciones"
   4. Copia el ID de la URL (está entre /d/ y /edit)
   ```

2. **Configurar Google Apps Script**
   ```
   1. Ve a script.google.com
   2. Crea un nuevo proyecto
   3. Reemplaza el código con google-apps-script.js
   4. Guarda el proyecto
   ```

3. **Configurar Variables**
   ```javascript
   // En el archivo google-apps-script.js, actualiza:
   const CONFIG = {
     SPREADSHEET_ID: 'TU_SPREADSHEET_ID_AQUI', // Pegar ID del Step 1
     SHEET_NAME: 'Confirmaciones', // Ya está correcto
     EMAIL_FROM: 'tu-email@dominio.com', // Tu email
     EVENT_NAME: 'XV Años de Camila', // Ya está correcto
     ADMIN_EMAIL: 'admin@tu-dominio.com' // Tu email para notificaciones
   };
   ```

4. **Desplegar como Web App**
   ```
   1. En Apps Script, haz clic en "Deploy" > "New deployment"
   2. Type: "Web app"
   3. Execute as: "Me"
   4. Who has access: "Anyone"
   5. Haz clic en "Deploy"
   6. Copia la URL del Web App
   ```

### **Paso 2: Actualizar Formulario de Confirmación**

1. **Obtener URL del Web App**
   - La URL tendrá este formato:
   ```
   https://script.google.com/macros/s/AKfycbz.../exec
   ```

2. **Actualizar JavaScript**
   ```javascript
   // En el archivo confirmacion.js, línea ~165, actualiza:
   const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz.../exec';
   ```

### **Paso 3: Deployment en GitHub Pages**

1. **Crear Repositorio en GitHub**
   ```
   1. Ve a github.com
   2. Crea un nuevo repositorio público
   3. Nómbralo: "camila-quinceañera-boletos"
   ```

2. **Subir Archivos**
   ```
   1. Sube todos los archivos del sistema de boletos
   2. Asegúrate de que la estructura sea:
      - index.html (en la raíz)
      - confirmacion/index.html
      - admin/index.html
      - assets/ (carpeta con todos los archivos)
   ```

3. **Habilitar GitHub Pages**
   ```
   1. Ve a Settings > Pages
   2. Source: "Deploy from a branch"
   3. Branch: "main"
   4. Folder: "/ (root)"
   5. Haz clic en "Save"
   ```

4. **URL del Sitio**
   ```
   Tu sitio estará disponible en:
   https://tu-usuario.github.io/camila-quinceañera-boletos
   ```

## 🎨 **Personalización del Sistema**

### **Colores y Tema**
```css
/* En admin-styles.css, puedes personalizar: */
:root {
    --primary-color: #D4AF37;        /* Color dorado principal */
    --primary-dark: #B8941F;         /* Dorado oscuro */
    --secondary-color: #2C3E50;      /* Azul oscuro para sidebar */
    --success-color: #27AE60;        /* Verde para confirmaciones */
    --warning-color: #F39C12;        /* Amarillo para pendientes */
    --danger-color: #E74C3C;         /* Rojo para rechazos */
}
```

### **Información del Evento**
```html
<!-- En confirmacion/index.html, actualiza: -->
<h1 class="confirmation-title">Confirmación de Asistencia</h1>
<p class="confirmation-subtitle">XV Años de [Tu Nombre]</p>
```

```javascript
// En google-apps-script.js, actualiza:
const CONFIG = {
    EVENT_NAME: 'XV Años de [Tu Nombre]',
    EMAIL_FROM: '[tu-email@dominio.com]',
    ADMIN_EMAIL: '[admin@tu-dominio.com]'
};
```

### **Capacidad de Mesas**
```javascript
// En admin.js, actualiza:
this.config = {
    maxGuests: 250,      // Capacidad total
    tablesCount: 25      // Número de mesas
};
```

### **Logo e Imágenes**
```
1. Reemplaza assets/logo-camila.png con tu logo
2. Para la foto de Camila, actualiza el formulario
3. Para boletos, las imágenes se incluyen en la generación
```

## 📊 **Uso del Sistema**

### **Para Invitados**
1. **Acceder al Formulario**
   ```
   URL: https://tu-usuario.github.io/camila-quinceañera-boletos/confirmacion/
   ```

2. **Completar Información**
   - Información personal obligatoria
   - Confirmar asistencia (Sí/No)
   - Indicar acompañantes si aplica
   - Restricciones alimentarias (opcional)
   - Necesidades especiales (opcional)

3. **Recibir Confirmación**
   - Email automático de confirmación
   - Almacenamiento seguro en Google Sheets

### **Para Administrador**
1. **Acceder al Panel**
   ```
   URL: https://tu-usuario.github.io/camila-quinceañera-boletos/admin/
   ```

2. **Dashboard - Vista General**
   - Confirmaciones recientes
   - Estadísticas del evento
   - Capacidad de mesas
   - Totales de invitados

3. **Gestión de Confirmaciones**
   - Ver lista completa de invitados
   - Filtrar por estado (Confirmado/Pendiente/Rechazado)
   - Buscar por nombre o email
   - Ver detalles completos de cada invitado

4. **Gestión de Mesas**
   - Vista visual de las 25 mesas
   - Asignación manual de invitados
   - Asignación automática optimizada
   - Vista de ocupación en tiempo real

5. **Generación de Boletos**
   - Vista previa del diseño
   - Opciones de personalización
   - Generación masiva o individual
   - Preparación para impresión

6. **Estadísticas**
   - Gráficos de confirmaciones por fecha
   - Distribución de acompañantes
   - Análisis de restricciones alimentarias

7. **Configuración**
   - Ajustes del evento
   - Configuración de Google Sheets
   - Prueba de conexión

## 🔧 **Funciones Avanzadas**

### **Asignación Automática de Mesas**
```javascript
// El algoritmo considera:
- Número de acompañantes de cada invitado
- Capacidad máxima de 10 personas por mesa
- Distribución balanceada
- Prioridad a grupos grandes
```

### **Generación de Boletos con QR**
```javascript
// Los boletos incluyen:
- Código QR único con ID del invitado
- Información del evento
- Mesa asignada
- Foto de la quinceañera
- Diseño elegante y personalizable
```

### **Sistema de Notificaciones**
```
- Email automático al invitado al confirmar
- Notificación al administrador de nuevas confirmaciones
- Backup automático en localStorage como respaldo
```

## 📈 **Estadísticas y Reportes**

### **Métricas Disponibles**
- Total de confirmados vs rechazados
- Número total de invitados (incluye acompañantes)
- Distribución de acompañantes (0-9)
- Restricciones alimentarias más comunes
- Evolución de confirmaciones por fecha
- Ocupación de mesas en tiempo real

### **Exportación de Datos**
```javascript
// Formato JSON con:
{
  "guests": [...],           // Array completo de invitados
  "tables": [...],           // Estado de las mesas
  "config": {...},           // Configuración del sistema
  "exportDate": "2025-01-15T10:30:00Z"
}
```

## 🚨 **Troubleshooting**

### **Problemas Comunes**

**1. Error "No se pudieron cargar los datos"**
```
Solución:
- Verificar que el SPREADSHEET_ID sea correcto
- Asegurar que el Web App esté desplegado
- Comprobar permisos de acceso público
```

**2. No llegan emails de confirmación**
```
Solución:
- Verificar EMAIL_FROM en la configuración
- Comprobar carpeta de spam del invitado
- Revisar logs en Google Apps Script
```

**3. Error al asignar mesas**
```
Solución:
- Verificar que la mesa tenga espacio suficiente
- Comprobar que el invitado esté confirmado
- Revisar que no esté ya asignado
```

**4. Problemas de CORS en el navegador**
```
Solución:
- Asegurar que el Web App tenga acceso público
- Verificar que la URL sea HTTPS
- Comprobar que no haya extensiones bloqueando requests
```

### **Verificación de Funcionamiento**

**Test de Configuración:**
```javascript
// En Google Apps Script, ejecutar:
testConfiguration()

// Esto verificará:
- Conexión con Google Sheets
- Permisos de acceso
- Estructura de datos
- APIs funcionando
```

### **Logs y Debugging**

**En el Formulario:**
```javascript
// Los datos se guardan automáticamente en localStorage
// como respaldo si falla Google Sheets
localStorage.getItem('camila_confirmaciones')
```

**En Google Apps Script:**
```javascript
// Ver logs en: Apps Script > Executions
// Buscar errores en: Apps Script > Logs
```

## 🔒 **Seguridad y Privacidad**

### **Protección de Datos**
- Google Sheets con permisos configurados
- IDs únicos para cada invitado
- Datos almacenados de forma segura
- Backup automático disponible

### **Acceso al Panel Admin**
- Sin autenticación (considera agregar si es necesario)
- Acceso directo vía URL
- Recomendado: Cambiar nombre del directorio admin para mayor seguridad

### **Emails y Comunicaciones**
- Envío seguro vía Gmail API
- Contenido de email personalizable
- Notificaciones automáticas al administrador

## 🎯 **Mejoras Futuras Posibles**

### **Funcionalidades Adicionales**
- [ ] Autenticación para panel de administración
- [ ] Sistema de recordatorios por email
- [ ] App móvil para el día del evento
- [ ] Verificación de boletos con QR en tiempo real
- [ ] Integración con WhatsApp para confirmaciones
- [ ] Dashboard público de estadísticas

### **Personalizaciones**
- [ ] Temas de color personalizables
- [ ] Múltiples formatos de boletos
- [ ] Integración con redes sociales
- [ ] Galería de fotos del evento
- [ ] Live streaming link

## 📞 **Soporte Técnico**

### **Archivos Importantes**
- `google-apps-script.js` - Backend principal
- `confirmacion.js` - Lógica del formulario
- `admin.js` - Panel de administración
- `admin-styles.css` - Estilos del panel
- `styles.css` - Estilos del formulario

### **Estructura de Directorios**
```
sistema-boletos/
├── confirmacion/
│   └── index.html              # Formulario de confirmación
├── admin/
│   └── index.html              # Panel de administración
├── assets/
│   ├── styles.css              # Estilos del formulario
│   ├── admin-styles.css        # Estilos del panel admin
│   ├── confirmacion.js         # JavaScript del formulario
│   ├── admin.js                # JavaScript del panel admin
│   └── logo-camila.png         # Logo del evento
└── docs/
    ├── google-apps-script.js   # Código de Apps Script
    └── README.md               # Esta documentación
```

### **URLs Importantes**
- **Formulario:** `https://usuario.github.io/repositorio/confirmacion/`
- **Panel Admin:** `https://usuario.github.io/repositorio/admin/`
- **Google Apps Script:** `https://script.google.com/home`
- **Google Sheets:** `https://sheets.google.com`

---

**¡El sistema está listo para usarse! Solo necesitas seguir la configuración paso a paso y tendrás un sistema completo de gestión de boletos para la quinceañera.**

**💝 ¡Que tengan una celebración increíble!**