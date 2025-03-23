export default {
    async fetch(request) {
        if (request.method === "POST") {
            const formData = await request.formData();
            const file = formData.get("file");

            if (!file) {
                return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400, headers: { "Content-Type": "application/json" } });
            }

            const fileBuffer = await file.arrayBuffer();
            const blob = new Blob([fileBuffer], { type: file.type });

            const form = new FormData();
            form.append("file", blob, file.name);

            const uploadResponse = await fetch("https://file.io", {
                method: "POST",
                body: form
            });

            const jsonResponse = await uploadResponse.json();

            return new Response(JSON.stringify(jsonResponse), {
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response("Send a file using POST request.", { status: 405 });
    }
};
