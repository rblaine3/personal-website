// Initialize all functionality when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeMobileMenu();
    initializeBackgroundEffect();
    initializeCursorLight();
    if (document.querySelector('.carousel')) {
        initializeCarousel();
    }
    if (document.getElementById('insights-container')) {
        loadArticles();
    }
});

// Navigation scroll behavior
function initializeNavigation() {
    let lastScrollTop = 0;
    const nav = document.querySelector('.nav');
    const scrollThreshold = 10;

    if (!nav) return;

    // Initialize nav visibility
    nav.classList.add('nav-visible');

    function handleScroll() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        // Don't hide nav at the very top of the page
        if (currentScroll <= 0) {
            nav.classList.remove('nav-hidden');
            nav.classList.add('nav-visible');
            return;
        }
        
        if (Math.abs(lastScrollTop - currentScroll) <= scrollThreshold) return;

        if (currentScroll > lastScrollTop) {
            // Scrolling down
            nav.classList.remove('nav-visible');
            nav.classList.add('nav-hidden');
        } else {
            // Scrolling up
            nav.classList.remove('nav-hidden');
            nav.classList.add('nav-visible');
        }
        
        lastScrollTop = currentScroll;
    }

    // Add scroll event listener with throttling
    let isScrolling = false;
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                handleScroll();
                isScrolling = false;
            });
            isScrolling = true;
        }
    });
}

// Mobile menu functionality
function initializeMobileMenu() {
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuButton && navLinks) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenuButton.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuButton.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
}

// Background animation effect
function initializeBackgroundEffect() {
    const background = document.querySelector('.animated-background');
    
    if (background) {
        document.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            background.style.transform = `translate(${mouseX * 20}px, ${mouseY * 20}px)`;
        });
    }
}

// Cursor light effect
function initializeCursorLight() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    // Create cursor light element
    const cursorLight = document.createElement('div');
    cursorLight.className = 'cursor-light';
    hero.appendChild(cursorLight);

    // Create grid cells container
    const gridContainer = document.createElement('div');
    gridContainer.style.position = 'absolute';
    gridContainer.style.top = '0';
    gridContainer.style.left = '0';
    gridContainer.style.width = '100%';
    gridContainer.style.height = '100%';
    gridContainer.style.pointerEvents = 'none';
    gridContainer.style.zIndex = '1';
    hero.appendChild(gridContainer);

    // Create grid cells
    const cellSize = 30;
    const cols = Math.ceil(hero.offsetWidth / cellSize);
    const rows = Math.ceil(hero.offsetHeight / cellSize);
    const cells = [];

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.style.left = `${j * cellSize}px`;
            cell.style.top = `${i * cellSize}px`;
            gridContainer.appendChild(cell);
            cells.push({
                element: cell,
                x: j * cellSize,
                y: i * cellSize,
                active: false
            });
        }
    }

    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;
    const ease = 0.15;

    function lerp(start, end, t) {
        return start * (1 - t) + end * t;
    }

    function updateCursorLight() {
        currentX = lerp(currentX, mouseX, ease);
        currentY = lerp(currentY, mouseY, ease);

        cursorLight.style.left = `${currentX}px`;
        cursorLight.style.top = `${currentY}px`;

        // Update grid cells
        const radius = 100; // Activation radius
        cells.forEach(cell => {
            const dx = currentX - (cell.x + cellSize / 2);
            const dy = currentY - (cell.y + cellSize / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < radius && !cell.active) {
                cell.active = true;
                cell.element.classList.add('active');
                setTimeout(() => {
                    cell.active = false;
                    cell.element.classList.remove('active');
                }, 1000);
            }
        });

        requestAnimationFrame(updateCursorLight);
    }

    document.addEventListener('mousemove', (e) => {
        // Get mouse position relative to hero section
        const heroRect = hero.getBoundingClientRect();
        const isInHero = e.clientY >= heroRect.top && 
                        e.clientY <= heroRect.bottom && 
                        e.clientX >= heroRect.left && 
                        e.clientX <= heroRect.right;

        if (isInHero) {
            mouseX = e.clientX - heroRect.left;
            mouseY = e.clientY - heroRect.top;
            cursorLight.style.opacity = '1';
            gridContainer.style.opacity = '1';
        } else {
            cursorLight.style.opacity = '0';
            gridContainer.style.opacity = '0';
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        const newCols = Math.ceil(hero.offsetWidth / cellSize);
        const newRows = Math.ceil(hero.offsetHeight / cellSize);

        // Only rebuild if dimensions have changed
        if (newCols !== cols || newRows !== rows) {
            gridContainer.innerHTML = '';
            cells.length = 0;

            for (let i = 0; i < newRows; i++) {
                for (let j = 0; j < newCols; j++) {
                    const cell = document.createElement('div');
                    cell.className = 'grid-cell';
                    cell.style.left = `${j * cellSize}px`;
                    cell.style.top = `${i * cellSize}px`;
                    gridContainer.appendChild(cell);
                    cells.push({
                        element: cell,
                        x: j * cellSize,
                        y: i * cellSize,
                        active: false
                    });
                }
            }
        }
    });

    // Start the animation loop
    updateCursorLight();
}

// Carousel functionality
function initializeCarousel() {
    const carousel = document.querySelector('.carousel');
    const carouselInner = carousel.querySelector('.carousel-inner');
    const cards = Array.from(carouselInner.querySelectorAll('.card'));
    const prevButton = carousel.querySelector('.prev');
    const nextButton = carousel.querySelector('.next');

    let currentIndex = 0;

    function updateCarousel() {
        cards.forEach((card, index) => {
            let position;
            if (index === currentIndex) {
                position = "center";
            } else if (index === (currentIndex - 1 + cards.length) % cards.length) {
                position = "left";
            } else if (index === (currentIndex + 1) % cards.length) {
                position = "right";
            } else {
                position = "hidden";
            }
            card.setAttribute('data-position', position);
        });
    }

    function moveCarousel(direction) {
        if (direction === 'next') {
            currentIndex = (currentIndex + 1) % cards.length;
        } else {
            currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        }
        updateCarousel();
    }

    // Add click event listeners to navigation buttons
    prevButton.addEventListener('click', () => moveCarousel('prev'));
    nextButton.addEventListener('click', () => moveCarousel('next'));

    // Initialize carousel
    updateCarousel();
}

// Load articles from Substack
async function loadArticles() {
    try {
        const response = await fetch('/api/articles');
        const articles = await response.json();
        
        // Update carousel with articles
        articles.forEach((article, index) => {
            if (index < cards.length) {
                const card = cards[index];
                const title = card.querySelector('h3');
                const description = card.querySelector('p');
                const link = card.querySelector('a');
                
                if (title) title.textContent = article.title;
                if (description) description.textContent = article.description;
                if (link) link.href = article.url;
            }
        });
    } catch (error) {
        console.error('Error loading articles:', error);
    }
}
