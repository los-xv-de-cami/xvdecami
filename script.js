// Event Configuration
const eventDate = new Date('2026-02-14T19:00:00').getTime();

// DOM Elements
const daysElement = document.getElementById('days');
const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');
// RSVP elements removed - now using external system
const musicToggle = document.getElementById('musicToggle');
const musicPlayer = document.getElementById('musicPlayer');
const backgroundMusic = document.getElementById('backgroundMusic');

// Helper function to safely get elements
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with id '${id}' not found`);
    }
    return element;
}

// Countdown Timer Function
function updateCountdown() {
    const now = new Date().getTime();
    const timeLeft = eventDate - now;

    if (timeLeft > 0) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        daysElement.textContent = String(days).padStart(2, '0');
        hoursElement.textContent = String(hours).padStart(2, '0');
        minutesElement.textContent = String(minutes).padStart(2, '0');
    } else {
        // Event has started or passed
        daysElement.textContent = '00';
        hoursElement.textContent = '00';
        minutesElement.textContent = '00';
        
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

// RSVP functions removed - now handled by external system

// Music Player Functions
function toggleMusic() {
    // Check if required elements exist
    if (!backgroundMusic || !musicToggle) {
        console.warn('Music player elements not found');
        return;
    }
    
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
        setInterval(updateCountdown, 60000); // Update every minute since we don't show seconds anymore
        
        // Initialize hero animations
        initializeHeroAnimations();
        
        // Initialize gallery
        initializeGallery();
        
        // Initialize scroll animations
        initializeScrollAnimations();
        
        // Initialize floating flowers (only if not in reduced motion)
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            createFloatingFlowers();
        }
        
        // Initialize performance optimizations
        initializePerformanceOptimizations();
        
        // RSVP now handled by external system
        
        // Music player toggle (only if element exists)
        if (musicToggle) {
            musicToggle.addEventListener('click', toggleMusic);
        }
        
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
        
        // RSVP now handled by external system
        
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
    // Only if music elements exist
    if (backgroundMusic && musicToggle && document.hidden && !backgroundMusic.paused) {
        backgroundMusic.pause();
        musicToggle.classList.remove('music-playing');
    }
});

// Fixed Header Functionality
document.addEventListener('DOMContentLoaded', function() {
    const fixedHeader = document.getElementById('fixedHeader');
    const heroSection = document.getElementById('inicio');
    const headerLinks = document.querySelectorAll('.header-link');
    
    // Function to check if hero section is fully passed
    function isHeroSectionPassed() {
        const heroHeight = heroSection.offsetHeight;
        const scrollPosition = window.pageYOffset;
        return scrollPosition > heroHeight;
    }
    
    // Function to update header visibility
    function updateHeaderVisibility() {
        if (isHeroSectionPassed()) {
            fixedHeader.classList.add('visible');
            document.body.classList.add('header-visible');
        } else {
            fixedHeader.classList.remove('visible');
            document.body.classList.remove('header-visible');
        }
    }
    
    // Function to handle smooth scrolling
    function scrollToSection(targetId) {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const headerHeight = fixedHeader.offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
    
    // Event listeners
    window.addEventListener('scroll', updateHeaderVisibility);
    
    // Navigation links click handlers
    headerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
            
            // Update active link
            headerLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Initial check
    updateHeaderVisibility();
});

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateCountdown,
        scrollToSection
    };
}