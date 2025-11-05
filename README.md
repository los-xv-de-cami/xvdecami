# Invitación Virtual - Camila Hernández
## Quinceañera 2026

Una invitación virtual elegante y sofisticada para celebrar los quince años de Camila Hernández.

### 📅 Información del Evento
- **Fecha:** 14 de Febrero, 2026
- **Hora:** 19:00 horas  
- **Lugar:** Salón de Luz
- **Dress Code:** Relajado pero limpio

### 🎨 Características del Diseño
- **Paleta de colores:** Azules claros elegantes (como el vestido de Camila)
- **Tipografía:** Cormorant Garamond para títulos, Inter para texto
- **Estilo:** Lujoso y sofisticado con toque moderno
- **Animaciones:** Suaves y fluidas

### ⚡ Funcionalidades

#### 🕒 Cuenta Regresiva
- Countdown timer en tiempo real hasta el día del evento
- Se actualiza cada segundo
- Muestra días, horas, minutos y segundos

#### 📝 Confirmación de Asistencia (RSVP)
- Formulario completo con validación
- Campos: nombre, email, teléfono, mensaje
- Validación en tiempo real
- Guarda confirmaciones localmente
- Mensaje de confirmación elegante

#### 🎵 Reproductor de Música
- Música ambiente estilo Gustavo Cerati
- Control de play/pause
- Información del artista
- Optimizado para móviles

#### 📸 Galería de Fotos
- Grid responsivo de imágenes
- Placeholders personalizables
- Efectos hover elegantes
- Organización tipo masonry

#### 📱 Diseño Responsivo
- Perfecto en desktop, tablet y móvil
- Optimizaciones específicas para cada dispositivo
- Navegación táctil友好

### 🚀 Cómo Usar

1. **Abre el archivo `index.html`** en tu navegador
2. **Personaliza el contenido** editando el HTML según necesites
3. **Agrega fotos reales** reemplazando los placeholders
4. **Configura el hosting** subiéndolos a tu servidor web

### 🎯 Personalización Fácil

#### Cambiar Fotos
Reemplaza los `gallery-placeholder` divs con imágenes reales:
```html
<div class="gallery-item">
    <img src="tu-foto.jpg" alt="Descripción de la foto">
</div>
```

#### Modificar Colores
Edita las variables CSS en `styles.css`:
```css
:root {
    --primary-500: #A8C5E5;  /* Azul principal */
    --accent-gold: #D4AF37;  /* Dorado para acentos */
    /* ... más colores ... */
}
```

#### Añadir Más Secciones
Copia cualquier sección existente y modifica el contenido.

### 📊 Datos Técnicos

#### Tecnologías Utilizadas
- **HTML5** - Estructura semántica
- **CSS3** - Estilos avanzados con variables CSS
- **JavaScript ES6+** - Funcionalidades interactivas
- **Google Fonts** - Cormorant Garamond e Inter

#### Optimizaciones
- ✅ Imágenes lazy loading
- ✅ Animaciones optimizadas para móviles
- ✅ Accesibilidad (WCAG guidelines)
- ✅ SEO friendly
- ✅ Cross-browser compatibility

#### Performance
- Tiempo de carga optimizado
- Animaciones suaves (60fps)
- Código minificado listo para producción

### 🎉 Próximos Pasos

1. **Subir a un hosting** (Netlify, Vercel, GitHub Pages)
2. **Conectar un dominio personalizado**
3. **Configurar analytics** (Google Analytics)
4. **Añadir más fotos reales**
5. **Personalizar el mensaje** si es necesario

### 💾 Datos de Confirmación

Las confirmaciones se guardan automáticamente en:
- **LocalStorage** del navegador
- **Console del navegador** (para debugging)

Para ver las confirmaciones guardadas:
```javascript
// En la consola del navegador
console.log(JSON.parse(localStorage.getItem('rsvpData')));
```

### 🆘 Soporte

Si necesitas ayuda para personalizar o modificar la invitación:
1. Edita los archivos HTML, CSS o JS según necesites
2. Usa las variables CSS para cambiar colores fácilmente
3. Mantén la estructura HTML para no romper las funcionalidades

---

**¡La invitación está lista para ser compartida!** 🎊

Creado con amor para celebrar los quince años de Camila Hernández 💙