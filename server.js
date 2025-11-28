import express from "express";
import { pipeline } from "@xenova/transformers";

const app = express();
const PORT = process.env.PORT || 8080;

// Load lightweight image generation model
const generator = await pipeline(
  "text-to-image",
  "Xenova/sd-turbo"
);

app.get("/", (req, res) => {
  res.send(`
    <h2>AI Image Generator</h2>
    <form action="/generate" method="get">
      <input type="text" name="prompt" placeholder="Enter your prompt" style="width:300px;" />
      <button type="submit">Generate</button>
    </form>
  `);
});

app.get("/generate", async (req, res) => {
  const prompt = req.query.prompt || "A cat";

  const image = await generator(prompt);

  // Convert image to base64
  const base64 = image[0].toDataURL();

  res.send(`
    <html>
      <body style="text-align:center;font-family:sans-serif">
        <h2>Prompt: ${prompt}</h2>
        <img src="${base64}" style="max-width:300px;border-radius:10px;" />
        <br><br>
        <a href="${base64}" download="ai-image.png">
          <button style="padding:10px 20px;font-size:16px;">Download Image</button>
        </a>
        <br><br>
        <a href="/">⬅ Generate Another</a>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
