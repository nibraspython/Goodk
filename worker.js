// worker.js - Cloudflare Worker for Handling File Uploads to File.io
export default {
    async fetch(request) {
        const url = new URL(request.url);
        
        if (request.method === "POST" && url.pathname === "/upload") {
            const formData = await request.formData();
            const file = formData.get("file");
            
            if (!file) {
                return new Response("No file uploaded", { status: 400 });
            }

            const uploadResponse = await fetch("https://file.io", {
                method: "POST",
                body: formData
            });

            const jsonResponse = await uploadResponse.json();

            if (jsonResponse.success) {
                return new Response(JSON.stringify({ fileUrl: jsonResponse.link }), {
                    headers: { "Content-Type": "application/json" }
                });
            } else {
                return new Response("Upload failed", { status: 500 });
            }
        }
        
        // Serve index.html as default root
        if (url.pathname === "/") {
            return fetch("https://your-cloudflare-pages-url.com/index.html");
        }
        
        return new Response("Not Found", { status: 404 });
    }
};
