async function loadArticles() {
    try {
        const response = await fetch('articles/metadata.json');
        const articles = await response.json();
        
        const insightsContainer = document.getElementById('insights-container');
        insightsContainer.innerHTML = ''; // Clear existing content
        
        articles.forEach(article => {
            const articleCard = document.createElement('div');
            articleCard.className = 'article-card';
            
            articleCard.innerHTML = `
                <div class="article-content">
                    <time class="date" datetime="${article.date_iso}">${article.date}</time>
                    <h3><a href="${article.url}" class="article-title">${article.title}</a></h3>
                    <p>${article.excerpt}</p>
                    <a href="${article.url}" class="read-more" rel="noopener noreferrer">
                        Read Article
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </a>
                </div>
            `;
            
            insightsContainer.appendChild(articleCard);
        });
    } catch (error) {
        console.error('Error loading articles:', error);
        const insightsContainer = document.getElementById('insights-container');
        insightsContainer.innerHTML = `
            <div class="error">
                <h2>Unable to load articles</h2>
                <p class="error-details">Please try again later</p>
            </div>
        `;
    }
}

// Load articles when the page loads
document.addEventListener('DOMContentLoaded', loadArticles);
