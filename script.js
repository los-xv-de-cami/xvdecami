// Event Configuration
const eventDate = new Date('2026-02-14T19:00:00').getTime();

// DOM Elements
const daysElement = document.getElementById('days');
const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');
const rsvpForm = document.getElementById('rsvpForm');
const successMessage = document.getElementById('successMessage');
const musicToggle = document.getElementById('musicToggle');
const musicPlayer = document.getElementById('musicPlayer');
const backgroundMusic = document.getElementById('backgroundMusic');

// Countdown Timer Function
function updateCountdown() {
    const now = new Date().getTime();
    const timeLeft = eventDate - now;

    if (timeLeft > 0) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        daysElement.textContent = String(days).padStart(2, '0');
        hoursElement.textContent = String(hours).padStart(2, '0');
        minutesElement.textContent = String(minutes).padStart(2, '0');
        secondsElement.textContent = String(seconds).padStart(2, '0');
    } else {
        // Event has started or passed
        daysElement.textContent = '00';
        hoursElement.textContent = '00';
        minutesElement.textContent = '00';
        secondsElement.textContent = '00';
        
        // Update hero content
        const heroName = document.querySelector('.hero-name');
        if (heroName) {
            heroName.textContent = '¡El evento ha comenzado!';
            heroName.style.fontSize = '48px';
        }
    }
}

// Smooth Scroll Function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Form Validation and Submission
function validateForm(formData) {
    const errors = [];
    
    if (!formData.get('nombre') || formData.get('nombre').trim().length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
    }
    
    const email = formData.get('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push('Por favor ingresa un correo electrónico válido');
    }
    
    const telefono = formData.get('telefono');
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!telefono || telefono.replace(/\D/g, '').length < 7) {
        errors.push('Por favor ingresa un teléfono válido');
    }
    
    return errors;
}

function showErrors(errors) {
    // Remove existing error messages
    const existingErrors = document.querySelectorAll('.error-message');
    existingErrors.forEach(error => error.remove());
    
    // Create error container if it doesn't exist
    let errorContainer = document.querySelector('.error-container');
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.className = 'error-container';
        errorContainer.style.cssText = `
            background: #fee;
            border: 1px solid #fcc;
            color: #c33;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
            display: none;
        `;
        rsvpForm.parentNode.insertBefore(errorContainer, rsvpForm);
    }
    
    if (errors.length > 0) {
        errorContainer.innerHTML = `
            <strong>Por favor corrige los siguientes errores:</strong>
            <ul style="margin: 8px 0 0 20px; padding: 0;">
                ${errors.map(error => `<li>${error}</li>`).join('')}
            </ul>
        `;
        errorContainer.style.display = 'block';
        return false;
    } else {
        errorContainer.style.display = 'none';
        return true;
    }
}

function saveRSVP(formData) {
    const rsvpData = {
        nombre: formData.get('nombre').trim(),
        email: formData.get('email').trim(),
        telefono: formData.get('telefono').trim(),
        mensaje: formData.get('mensaje')?.trim() || '',
        fechaConfirmacion: new Date().toISOString(),
        evento: 'Camila Hernández - Quinceañera',
        fechaEvento: '2026-02-14',
        horaEvento: '19:00'
    };
    
    // Save to localStorage (in a real app, this would be sent to a server)
    let existingRSVPs = JSON.parse(localStorage.getItem('rsvpData') || '[]');
    existingRSVPs.push(rsvpData);
    localStorage.setItem('rsvpData', JSON.stringify(existingRSVPs));
    
    // Also save individual confirmation for easy access
    localStorage.setItem('lastRSVP', JSON.stringify(rsvpData));
    
    console.log('RSVP saved:', rsvpData);
    return rsvpData;
}

function showSuccessMessage() {
    rsvpForm.style.display = 'none';
    successMessage.style.display = 'block';
    
    // Add celebration animation
    successMessage.style.animation = 'fadeInUp 600ms ease-out';
    
    // Scroll to success message
    setTimeout(() => {
        successMessage.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }, 100);
}

// Music Player Functions
function toggleMusic() {
    if (backgroundMusic.paused) {
        backgroundMusic.play().catch(e => {
            console.log('Could not play music:', e);
            // Show user-friendly message
            showMusicMessage('Haz clic para activar la música');
        });
        musicToggle.classList.add('music-playing');
        musicToggle.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
            </svg>
        `;
    } else {
        backgroundMusic.pause();
        musicToggle.classList.remove('music-playing');
        musicToggle.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
            </svg>
        `;
    }
}

function showMusicMessage(message) {
    // Create a temporary message
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-700);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Gallery interactions
function initializeGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
        // Add staggered animation
        item.style.animationDelay = `${index * 100}ms`;
        item.classList.add('animate-fade-in');
    });
}

// Scroll Animations
function initializeScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 600ms ease-out forwards';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe all animatable elements
    const animatableElements = document.querySelectorAll('.event-card, .gallery-item');
    animatableElements.forEach(el => observer.observe(el));
}

// Performance optimizations
function initializePerformanceOptimizations() {
    // Lazy load non-critical animations on mobile
    if (window.innerWidth < 768) {
        document.body.classList.add('mobile-device');
    }
    
    // Optimize animations for users who prefer reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduced-motion');
    }
}

// Error Handling
function handleErrors(error, context) {
    console.error(`Error in ${context}:`, error);
    
    // Show user-friendly error message
    const errorMessage = document.createElement('div');
    errorMessage.textContent = 'Ha ocurrido un error. Por favor intenta nuevamente.';
    errorMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-size: 14px;
    `;
    
    document.body.appendChild(errorMessage);
    
    setTimeout(() => {
        errorMessage.remove();
    }, 5000);
}

// Hero Animation Controller
function initializeHeroAnimations() {
    const heroPhoto = document.getElementById('heroPhoto');
    const heroSubtitle = document.getElementById('heroSubtitle');
    const heroName = document.getElementById('heroName');
    const countdownContainer = document.getElementById('countdownContainer');
    
    // Stagger animations for better effect
    setTimeout(() => {
        if (heroSubtitle) {
            heroSubtitle.style.animation = 'fadeInUp 800ms cubic-bezier(0.25, 0.8, 0.25, 1) 100ms both';
        }
    }, 500);
    
    setTimeout(() => {
        if (heroName) {
            heroName.style.animation = 'fadeInUp 800ms cubic-bezier(0.25, 0.8, 0.25, 1) 300ms both';
        }
    }, 700);
    
    setTimeout(() => {
        if (countdownContainer) {
            countdownContainer.style.animation = 'fadeInUp 800ms cubic-bezier(0.25, 0.8, 0.25, 1) 500ms both';
        }
    }, 900);
    
    setTimeout(() => {
        if (heroPhoto) {
            heroPhoto.style.animation = 'photoReveal 3s ease-out 1s forwards';
        }
    }, 2000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize countdown timer
        updateCountdown();
        setInterval(updateCountdown, 1000);
        
        // Initialize hero animations
        initializeHeroAnimations();
        
        // Initialize gallery
        initializeGallery();
        
        // Initialize scroll animations
        initializeScrollAnimations();
        
        // Initialize floating flowers
        createFloatingFlowers();
        
        // Initialize performance optimizations
        initializePerformanceOptimizations();
        
        // RSVP Form submission
        rsvpForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            try {
                const formData = new FormData(this);
                const errors = validateForm(formData);
                
                if (showErrors(errors)) {
                    // Simulate form submission delay
                    const submitBtn = this.querySelector('button[type="submit"]');
                    const originalText = submitBtn.textContent;
                    submitBtn.textContent = 'Confirmando...';
                    submitBtn.disabled = true;
                    
                    setTimeout(() => {
                        saveRSVP(formData);
                        showSuccessMessage();
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    }, 1500);
                }
            } catch (error) {
                handleErrors(error, 'form submission');
            }
        });
        
        // Music player toggle
        musicToggle.addEventListener('click', toggleMusic);
        
        // Smooth scroll for internal links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Keyboard navigation for accessibility
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                // Close any open modals or return to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        
        // Check if user has already RSVP'd
        const lastRSVP = localStorage.getItem('lastRSVP');
        if (lastRSVP) {
            const rsvpData = JSON.parse(lastRSVP);
            const eventDate = new Date('2026-02-14T19:00:00');
            const today = new Date();
            
            // Only show if RSVP was for this event and recent (within 30 days)
            if (rsvpData.fechaEvento === '2026-02-14' && 
                (today - new Date(rsvpData.fechaConfirmacion)) < (30 * 24 * 60 * 60 * 1000)) {
                setTimeout(() => {
                    showMusicMessage(`¡Gracias por tu confirmación, ${rsvpData.nombre}!`);
                }, 3000);
            }
        }
        
        console.log('Invitation initialized successfully');
        
    } catch (error) {
        handleErrors(error, 'initialization');
    }
});

// Función para crear flores flotantes
function createFloatingFlowers() {
    // Verificar si el usuario prefiere movimiento reducido
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }
    
    const flowerSymbols = ['🌸', '🌺', '🌻', '🌷', '💐', '💮'];
    const container = document.createElement('div');
    container.className = 'floating-flowers';
    document.body.appendChild(container);
    
    // Crear 15 flores distribuidas en diferentes posiciones
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const flower = document.createElement('div');
            flower.className = 'floating-flower';
            flower.textContent = flowerSymbols[Math.floor(Math.random() * flowerSymbols.length)];
            
            // Posición aleatoria horizontal
            flower.style.left = Math.random() * 100 + '%';
            
            // Duración de animación aleatoria (20-35 segundos)
            const duration = 20 + Math.random() * 15;
            flower.style.animationDuration = duration + 's';
            
            // Retraso aleatorio (0-20 segundos)
            const delay = Math.random() * 20;
            flower.style.animationDelay = delay + 's';
            
            // Tamaño aleatorio
            const size = 12 + Math.random() * 8;
            flower.style.fontSize = size + 'px';
            
            container.appendChild(flower);
        }, i * 2000); // Crear una nueva flor cada 2 segundos
    }
}

// Window load optimizations
window.addEventListener('load', function() {
    // Remove loading states and start animations
    document.body.classList.add('loaded');
    
    // Preload critical resources
    const criticalImages = [];
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
});

// Handle page visibility changes (for music)
document.addEventListener('visibilitychange', function() {
    if (document.hidden && !backgroundMusic.paused) {
        backgroundMusic.pause();
        musicToggle.classList.remove('music-playing');
    }
});

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateCountdown,
        validateForm,
        scrollToSection
    };
}