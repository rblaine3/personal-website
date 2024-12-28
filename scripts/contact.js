document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // For now, just log the data
        console.log('Form submitted:', data);
        
        // Show success message
        alert('Thanks for reaching out! I\'ll get back to you shortly.');
        
        // Reset form
        form.reset();
    });
});
