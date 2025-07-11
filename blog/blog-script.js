$(document).ready(function() {
    loadBlogPosts();
});

let allPosts = [];

function loadBlogPosts() {
    $.getJSON("manifest.json", function(data) {
        allPosts = data;
        
        // Sort posts by date (most recent first)
        allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        displayPosts(allPosts);
        createFilterButtons();
    }).fail(function() {
        $('.blog-posts-container').html('<p>Error loading blog posts.</p>');
    });
}

function displayPosts(posts) {
    const container = $('.blog-posts-container');
    container.empty();
    
    if (posts.length === 0) {
        container.html('<p class="text-center">No posts found matching the selected filters.</p>');
        return;
    }
    
    posts.forEach(post => {
        const formattedDate = formatDate(post.date);
        const thumbnailHtml = post.thumbnail ? 
            `<img src="${post.thumbnail}" alt="${post.title}" class="blog-post-thumbnail" onerror="this.style.display='none'">` : '';
        
        const tagsHtml = post.tags.map(tag => 
            `<span class="blog-tag">${tag}</span>`
        ).join(' ');
        
        const postCard = `
            <div class="blog-post-card" onclick="openBlogPost('${post.id}')">
                ${thumbnailHtml}
                <h2 class="blog-post-title">${post.title}</h2>
                <p class="blog-post-subheading">${post.subheading}</p>
                <div class="blog-post-meta">
                    <span class="blog-post-date">${formattedDate}</span>
                    <div class="blog-post-tags">${tagsHtml}</div>
                </div>
            </div>
        `;
        
        container.append(postCard);
    });
}

function createFilterButtons() {
    const allTags = [...new Set(allPosts.flatMap(post => post.tags))];
    const filterContainer = $('.filter-buttons');
    
    // Add "Show All" button
    filterContainer.append(`
        <button class="filter-button show-all active" onclick="filterPosts('all')">
            All Posts
        </button>
    `);
    
    // Add tag filter buttons
    allTags.forEach(tag => {
        filterContainer.append(`
            <button class="filter-button" onclick="filterPosts('${tag}')">
                ${tag}
            </button>
        `);
    });
}

function filterPosts(filter) {
    // Update active button
    $('.filter-button').removeClass('active');
    if (filter === 'all') {
        $('.filter-button.show-all').addClass('active');
        displayPosts(allPosts);
    } else {
        $(`.filter-button:contains("${filter}")`).not('.show-all').addClass('active');
        const filteredPosts = allPosts.filter(post => post.tags.includes(filter));
        displayPosts(filteredPosts);
    }
}

function openBlogPost(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (post) {
        window.location.href = `post.html?id=${postId}`;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}