addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    if (request.method !== "POST") {
        return new Response("Only POST requests allowed", { status: 405 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
        return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
    }

    const githubToken = "YOUR_GITHUB_PERSONAL_ACCESS_TOKEN";  // Replace with your GitHub token
    const gistFilename = file.name;
    const fileContent = await file.text();  // Convert file to text (Only works for text-based files)

    const gistData = {
        description: "Uploaded via Cloudflare Workers",
        public: true,
        files: {
            [gistFilename]: {
                content: fileContent
            }
        }
    };

    const response = await fetch("https://api.github.com/gists", {
        method: "POST",
        headers: {
            "Authorization": `token ${githubToken}`,
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(gistData)
    });

    if (response.ok) {
        const result = await response.json();
        const fileUrl = result.files[gistFilename].raw_url;
        return new Response(JSON.stringify({ success: true, url: fileUrl }), { status: 200 });
    } else {
        return new Response(JSON.stringify({ error: "Upload failed" }), { status: 500 });
    }
}
