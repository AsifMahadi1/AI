import express from "express";
import { pipeline, env } from "@xenova/transformers";

env.backends.onnx.wasm.numThreads = 1;
env.backends.onnx.wasm.simd = true;

const app = express();
const PORT = process.env.PORT || 8080;

let generator;

// Load model safely
(async () => {
  console.log("Loading model...");
  generator = await pipeline(
    "text-to-image",
    "Xenova/stable-diffusion-tiny",
    { device: "cpu" }
  );
  console.log("Model loaded ✅");
})();

app.get("/", (req, res) => {
  res.send(`
    <h2>AI Image Generator</h2>
    <form action="/generate">
      <input name="prompt" placeholder="Enter prompt" style="width:300px;">
      <button type="submit">Generate</button>
    </form>
  `);
});

app.get("/generate", async (req, res) => {
  try {
    if (!generator) {
      return res.send("Model is still loading, try again in 10 sec...");
    }

    const prompt = req.query.prompt || "A cat";

    const image = await generator(prompt, {
      num_inference_steps: 2,
      guidance_scale: 0
    });

    const base64 = image[0].toDataURL();

    res.send(`
      <html>
        <body style="text-align:center;font-family:sans-serif">
          <h3>${prompt}</h3>
          <img src="${base64}" style="max-width:300px;border-radius:10px;" />
          <br><br>
          <a href="${base64}" download="image.png">
            <button>Download</button>
          </a>
        </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.send("Error generating image 😥");
  }
});

app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
