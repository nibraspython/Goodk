const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload File to File.io</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
        input { margin: 10px; }
        #response { margin-top: 20px; color: green; }
    </style>
</head>
<body>
    <h1>Upload File</h1>
    <input type="file" id="fileInput">
    <button onclick="uploadFile()">Upload</button>
    
    <p id="response"></p>

    <script>
        async function uploadFile() {
            const fileInput = document.getElementById("fileInput");
            if (!fileInput.files.length) {
                alert("Please select a file!");
                return;
            }

            const formData = new FormData();
            formData.append("file", fileInput.files[0]);

            const response = await fetch("/upload", { method: "POST", body: formData });
            const result = await response.json();

            document.getElementById("response").innerHTML = result.success 
                ? \`✅ File uploaded: <a href="\${result.link}" target="_blank">\${result.link}</a>\`
                : \`❌ Error: \${result.error}\`;
        }
    </script>
</body>
</html>`;

export default {
    async fetch(request) {
        if (request.method === "GET") {
            return new Response(html, { headers: { "Content-Type": "text/html" } });
        }

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
