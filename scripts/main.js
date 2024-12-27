document.addEventListener('DOMContentLoaded', () => {
    const background = document.querySelector('.animated-background');
    
    document.addEventListener('mousemove', (e) => {
        const mouseX = (e.clientX / window.innerWidth) * 100;
        const mouseY = (e.clientY / window.innerHeight) * 100;
        
        background.style.setProperty('--mouse-x', `${mouseX}%`);
        background.style.setProperty('--mouse-y', `${mouseY}%`);
    });
});
