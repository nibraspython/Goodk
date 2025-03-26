addEventListener('fetch', event => { 
    event.respondWith(handleRequest(event.request)); 
}); 

async function handleRequest(request) { 
    const searchQuery = new URL(request.url).searchParams.get('search'); 
    const imageCount = 9; 

    if (!searchQuery) { 
        return new Response(JSON.stringify({ error: 'No search prompt provided' }), { 
            headers: { 
                'Content-Type': 'application/json', 
                'Access-Control-Allow-Origin': '*', 
                'Access-Control-Allow-Methods': 'GET, OPTIONS', 
                'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept', 
            }, 
        }); 
    } 

    const imageUrls = await searchImages(searchQuery, imageCount); 
    const filteredUrls = filterImages(imageUrls); 

    return new Response(JSON.stringify(filteredUrls, null, 2), { // Pretty print JSON
        headers: { 
            'Content-Type': 'application/json', 
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Methods': 'GET, OPTIONS', 
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept', 
        }, 
    }); 
} 

async function searchImages(query, count = 1) { 
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&count=${count}`; 

    const response = await fetch(url, { 
        headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3', 
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

    const joinedUrls = imageUrls.map(url => url + '@bj_devs'); 

    return joinedUrls.filter(url => 
        !url.toLowerCase().includes('.svg') && 
        !urlsToRemove.some(removeUrl => url.includes(removeUrl)) && 
        !url.startsWith('data:image') 
    ); 
}
