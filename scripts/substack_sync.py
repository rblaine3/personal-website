import feedparser
import os
import html
from datetime import datetime
import json
import time
from bs4 import BeautifulSoup
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Download required NLTK data
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

def extract_text_from_html(html_content):
    """Extract clean text from HTML content."""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Remove script and style elements
    for script in soup(["script", "style"]):
        script.decompose()
    
    # Get text and clean it
    text = soup.get_text()
    lines = (line.strip() for line in text.splitlines())
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    text = ' '.join(chunk for chunk in chunks if chunk)
    
    return text

def generate_description(content, max_words=50):
    """Generate a standardized description from the article content."""
    # Extract clean text from HTML
    text = extract_text_from_html(content)
    
    # Split into sentences (simple approach)
    sentences = [s.strip() for s in text.split('.') if len(s.strip()) > 0]
    
    # Remove unwanted patterns
    unwanted_patterns = [
        r"^Thanks for reading",
        r"^Subscribe",
        r"^Like$",
        r"^Share$",
        r"^\d+ likes$",
        r"^Comment$"
    ]
    
    filtered_sentences = []
    for sentence in sentences:
        if len(sentence.split()) >= 5:  # Ignore very short sentences
            if not any(re.match(pattern, sentence.strip(), re.IGNORECASE) for pattern in unwanted_patterns):
                filtered_sentences.append(sentence)
    
    # Take the first few sentences that would make a good description
    description = ""
    word_count = 0
    
    for sentence in filtered_sentences:
        words = sentence.split()
        if word_count + len(words) <= max_words:
            if description:
                description += ". "
            description += sentence
            word_count += len(words)
        else:
            break
    
    # If description is too short, add one more sentence
    if len(description.split()) < 20 and len(filtered_sentences) > len(description.split('.')):
        if description:
            description += ". "
        description += filtered_sentences[len(description.split('.'))].strip()
    
    return description.strip() + "."

def clean_html_content(content):
    # Parse the HTML
    soup = BeautifulSoup(content, 'html.parser')
    
    # Remove unwanted elements
    for element in soup.find_all(['button', 'iframe']):
        element.decompose()
    
    # Remove Substack footer content
    footer_patterns = [
        "Thanks for reading",
        "Subscribe for free",
        "receive new posts",
        "receive new articles",
        "Like this post",
        "Share this post"
    ]
    
    for text in footer_patterns:
        for element in soup.find_all(string=re.compile(text, re.IGNORECASE)):
            parent = element.find_parent()
            if parent:
                parent.decompose()
    
    # Remove any elements with Substack-related classes
    for element in soup.find_all(class_=re.compile(r'button|subscribe|footer|social|share', re.IGNORECASE)):
        element.decompose()
        
    # Clean up image containers and captions
    for figure in soup.find_all('figure'):
        # Keep only the image and its caption
        img = figure.find('img')
        caption = figure.find('figcaption')
        
        if img:
            # Remove any onclick attributes
            if img.has_attr('onclick'):
                del img['onclick']
            # Remove any button-related classes
            if img.has_attr('class'):
                img['class'] = [c for c in img['class'] if 'button' not in c.lower()]
            
        if caption:
            # Clean up caption text
            caption_text = caption.get_text().strip()
            if caption_text:
                caption.string = caption_text
            else:
                caption.decompose()
        
        # Replace the figure with a clean version
        new_figure = soup.new_tag('figure')
        if img:
            new_figure.append(img)
        if caption and not caption.decomposed:
            new_figure.append(caption)
        figure.replace_with(new_figure)
    
    # Remove empty paragraphs
    for p in soup.find_all('p'):
        if not p.get_text().strip() and not p.find('img'):
            p.decompose()
    
    # Clean up any remaining unwanted elements
    for element in soup.find_all(class_=re.compile(r'button|expand|refresh|icon')):
        element.decompose()
    
    # Remove any remaining subscription-related content
    for element in soup.find_all(['div', 'p', 'section']):
        text = element.get_text().lower()
        if any(pattern.lower() in text for pattern in footer_patterns):
            element.decompose()
    
    return str(soup)

def create_article_page(title, content, date, url):
    # Clean the title to create a URL-friendly slug
    slug = title.lower().replace(' ', '-').replace('?', '').replace('!', '').replace('.', '')
    
    # Clean the HTML content
    cleaned_content = clean_html_content(content)
    
    # Get the absolute path to the articles directory
    articles_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'articles')
    
    # Create the articles directory if it doesn't exist
    if not os.path.exists(articles_dir):
        os.makedirs(articles_dir)
        
    # Template for individual article pages
    article_template = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - Rob Blaine</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Open+Sans:wght@400;600&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../styles/main.css">
</head>
<body>
    <!-- Animated Background -->
    <div class="animated-background">
        <div class="gradient-layer"></div>
        <div class="pattern-layer"></div>
        <div class="glow-layer"></div>
    </div>

    <!-- Navigation -->
    <nav class="nav">
        <div class="nav-container">
            <a href="../index.html" class="logo">Rob Blaine</a>
            <div class="nav-links">
                <a href="../index.html">About Me</a>
                <a href="../insights.html">Insights</a>
                <a href="../services.html">Services</a>
                <a href="../contact.html">Contact</a>
            </div>
        </div>
    </nav>

    <article class="article-full">
        <div class="container">
            <div class="article-header">
                <a href="../insights.html" class="back-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back to Insights
                </a>
                <h1>{title}</h1>
                <div class="article-meta">
                    <time datetime="{date}">{date}</time>
                    <a href="{url}" target="_blank" rel="noopener noreferrer" class="original-link">Read on Substack</a>
                </div>
            </div>
            <div class="article-content">
                {cleaned_content}
            </div>
            <div class="article-footer">
                <a href="../insights.html" class="back-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back to Insights
                </a>
            </div>
        </div>
    </article>

    <!-- Call to Action Section -->
    <section class="article-cta">
        <div class="container">
            <h2>Ready to Transform Your Business with AI?</h2>
            <p>Let's explore how AI can drive growth and innovation for your organization.</p>
            <a href="../services.html" class="cta-button large">View My Services</a>
        </div>
    </section>

    <script src="../scripts/main.js"></script>
</body>
</html>'''
    
    # Write the article page using absolute path
    article_path = os.path.join(articles_dir, f'{slug}.html')
    with open(article_path, 'w', encoding='utf-8') as f:
        f.write(article_template)
    
    return f'articles/{slug}.html'

def sync_substack_posts():
    # Your Substack RSS feed URL
    SUBSTACK_RSS = 'https://robblaine.substack.com/feed'
    
    # Get the absolute path to the articles directory
    articles_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'articles')
    
    # Parse the RSS feed
    feed = feedparser.parse(SUBSTACK_RSS)
    
    # Create a list to store article metadata
    articles = []
    
    for entry in feed.entries:
        title = entry.title
        content = entry.content[0].value
        # Fix date parsing and format it
        try:
            parsed_date = datetime.strptime(entry.published, '%a, %d %b %Y %H:%M:%S GMT')
        except ValueError:
            try:
                parsed_date = datetime.strptime(entry.published, '%a, %d %b %Y %H:%M:%S %z')
            except ValueError:
                parsed_date = datetime.now()
        
        # Create both machine-readable and formatted dates
        date_iso = parsed_date.strftime('%Y-%m-%d')
        date_formatted = parsed_date.strftime('%B %d, %Y')
        
        url = entry.link
        
        # Create individual article page
        local_url = create_article_page(title, content, date_formatted, url)
        
        # Generate standardized description
        description = generate_description(content)
        
        # Store article metadata
        articles.append({
            'title': title,
            'date': date_formatted,
            'date_iso': date_iso,
            'url': local_url,
            'original_url': url,
            'excerpt': description
        })
    
    # Sort articles by date (newest first)
    articles.sort(key=lambda x: x['date_iso'], reverse=True)
    
    # Write metadata file using absolute path
    metadata_path = os.path.join(articles_dir, 'metadata.json')
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(articles, f, indent=4)

if __name__ == '__main__':
    sync_substack_posts()
