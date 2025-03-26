addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

// Temporary in-memory cache (Resets when Worker restarts)
const resultsCache = {};

async function handleRequest(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const searchQuery = url.searchParams.get("search");
    const prompt = url.searchParams.get("prompt");

    if (path === "/search") {
        return handleImageSearch(searchQuery);
    } else if (path === "/seeai") {
        return handleAIRequest(prompt);
    } else {
        return new Response(JSON.stringify({ error: "Invalid endpoint" }), { headers: { "Content-Type": "application/json" }, status: 404 });
    }
}

/* 🖼️ Image Search Handler */
async function handleImageSearch(query) {
    if (!query) {
        return new Response(JSON.stringify({ error: "Search query required" }), { headers: { "Content-Type": "application/json" } });
    }

    const imageUrls = await searchImages(query, 9);
    const filteredUrls = filterImages(imageUrls);

    return new Response(JSON.stringify(filteredUrls), { headers: { "Content-Type": "application/json" } });
}

/* 🤖 AI Processing Handler */
async function handleAIRequest(prompt) {
    if (!prompt) {
        return new Response(JSON.stringify({ error: "Prompt required" }), { headers: { "Content-Type": "application/json" } });
    }

    try {
        // Fetch AI-generated response from SeaArt API
        const response = await fetch(`https://seaart-ai.apis-bj-devs.workers.dev/?Prompt=${encodeURIComponent(prompt)}`);
        const data = await response.json();

        return new Response(JSON.stringify({ status: "success", result: data }), { headers: { "Content-Type": "application/json" } });

    } catch (error) {
        console.error("AI Request Failed:", error);
        return new Response(JSON.stringify({ error: "Failed to process request" }), { status: 500 });
    }
}

/* 🔎 Image Search Logic */
async function searchImages(query, count = 1) {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&count=${count}`;

    const response = await fetch(url, { 
        headers: { 
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'image/*',
        },
    });

    const html = await response.text();
    const matches = html.match(/<img.+?src=["'](.*?)["'].*?>/g);

    return matches ? matches.map(match => match.match(/<img.+?src=["'](.*?)["'].*?>/)[1]) : [];
}

function filterImages(imageUrls) {
    const urlsToRemove = [
        '/sa/simg/Flag_Feedback.png',
        'https://r.bing.com/rp/ytiieusXgM2K8bLkEDP-AS1ePds.png',
        '/rp/ytiieusXgM2K8bLkEDP-AS1ePds.png',
    ];

    return imageUrls.filter(url => 
        !url.toLowerCase().includes('.svg') &&
        !urlsToRemove.some(removeUrl => url.includes(removeUrl)) &&
        !url.startsWith('data:image')
    );
}
