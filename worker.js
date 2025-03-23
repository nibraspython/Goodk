export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        
        if (request.method === "POST" && url.pathname === "/upload") {
            const formData = await request.formData();
            const file = formData.get("file");
            
            if (!file) {
                return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
            }

            const uploadResponse = await fetch("https://file.io", {
                method: "POST",
                body: formData
            });

            const jsonResponse = await uploadResponse.json();

            return new Response(JSON.stringify({ fileUrl: jsonResponse.link || null }), {
                headers: { "Content-Type": "application/json" },
                status: jsonResponse.success ? 200 : 500
            });
        }
        
        // Serve index.html as default root
        if (url.pathname === "/") {
            return env.ASSETS.fetch(request);
        }
        
        return new Response("Not Found", { status: 404 });
    }
};
