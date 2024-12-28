document.addEventListener('DOMContentLoaded', () => {
    const background = document.querySelector('.animated-background');
    
    document.addEventListener('mousemove', (e) => {
        const mouseX = (e.clientX / window.innerWidth) * 100;
        const mouseY = (e.clientY / window.innerHeight) * 100;
        
        background.style.setProperty('--mouse-x', `${mouseX}%`);
        background.style.setProperty('--mouse-y', `${mouseY}%`);
    });

    // Carousel functionality
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

    // Load articles on page load
    loadArticles();

    // Mobile Menu Toggle
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
});
