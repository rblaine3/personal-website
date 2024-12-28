document.addEventListener('DOMContentLoaded', async () => {
    const insightsContainer = document.getElementById('insights-container');
    const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
    const SUBSTACK_RSS = 'https://robblaine.substack.com/feed';

    try {
        // Fetch RSS feed through CORS proxy
        const response = await fetch(CORS_PROXY + encodeURIComponent(SUBSTACK_RSS));
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const items = xmlDoc.getElementsByTagName('item');

        // Clear loading message
        insightsContainer.innerHTML = '';

        // Process each article
        Array.from(items).forEach(item => {
            const title = item.getElementsByTagName('title')[0].textContent;
            const link = item.getElementsByTagName('link')[0].textContent;
            const pubDate = new Date(item.getElementsByTagName('pubDate')[0].textContent);
            let description = item.getElementsByTagName('description')[0].textContent;
            
            // Extract image if available
            let imageUrl = '';
            const imageMatch = description.match(/<img[^>]+src="([^">]+)"/);
            if (imageMatch) {
                imageUrl = imageMatch[1];
            }

            // Clean description text (remove HTML and truncate)
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = description;
            description = tempDiv.textContent || tempDiv.innerText;
            description = description
                .split(' ')
                .slice(0, 40)
                .join(' ') + '...';

            const articleCard = document.createElement('div');
            articleCard.className = 'article-card';

            // Only include image HTML if we found an image
            const imageHTML = imageUrl ? `<img src="${imageUrl}" alt="${title}" class="article-image">` : '';

            articleCard.innerHTML = `
                ${imageHTML}
                <div class="article-content">
                    <div class="date">${pubDate.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</div>
                    <h3>${title}</h3>
                    <p>${description}</p>
                    <a href="${link}" class="read-more" target="_blank" rel="noopener noreferrer">
                        Read on Substack
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </a>
                </div>
            `;

            insightsContainer.appendChild(articleCard);
        });

    } catch (error) {
        console.error('Error fetching articles:', error);
        insightsContainer.innerHTML = `
            <div class="error">
                <p>Unable to load articles. Please try again later.</p>
                <p class="error-details">Error: ${error.message}</p>
            </div>
        `;
    }
});
