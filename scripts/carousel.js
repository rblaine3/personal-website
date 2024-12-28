document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.carousel-inner');
    const cards = Array.from(document.querySelectorAll('.card'));
    const prevBtn = document.querySelector('.nav-button.prev');
    const nextBtn = document.querySelector('.nav-button.next');
    
    let currentIndex = 0;
    const totalCards = cards.length;
    let isAnimating = false;

    function updateCarousel() {
        if (isAnimating) return;
        
        cards.forEach((card, index) => {
            let position;
            const diff = (index - currentIndex + totalCards) % totalCards;
            
            if (diff === 0) {
                position = 'center';
            } else if (diff === 1 || diff === -(totalCards - 1)) {
                position = 'right';
            } else if (diff === totalCards - 1 || diff === -1) {
                position = 'left';
            } else {
                position = 'hidden';
            }
            
            card.setAttribute('data-position', position);
        });
    }

    function moveCarousel(direction) {
        if (isAnimating) return;
        isAnimating = true;

        currentIndex = (currentIndex - direction + totalCards) % totalCards;
        updateCarousel();

        setTimeout(() => {
            isAnimating = false;
        }, 500);
    }

    // Initialize carousel
    updateCarousel();

    // Event Listeners
    prevBtn.addEventListener('click', () => moveCarousel(1));
    nextBtn.addEventListener('click', () => moveCarousel(-1));

    // Optional: Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            moveCarousel(1);
        } else if (e.key === 'ArrowRight') {
            moveCarousel(-1);
        }
    });

    // Optional: Add touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchEndX < touchStartX - 50) {
            moveCarousel(-1); // Swipe left
        } else if (touchEndX > touchStartX + 50) {
            moveCarousel(1); // Swipe right
        }
    });
});
