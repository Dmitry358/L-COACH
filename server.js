import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// Servi la pagina HTML
app.use(express.static(__dirname));

app.post("/api/chat", async (req, res) => {
  const { model, message } = req.body;

  try {
    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.HF_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: message }]
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Errore nella richiesta:", error);
    res.status(500).json({ error: "Errore nella richiesta." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server in ascolto su porta ${PORT}`));
