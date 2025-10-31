// Import dei moduli principali
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Carica le variabili d’ambiente da .env
dotenv.config();

// Setup dei percorsi per ESM (import.meta.url)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crea l’app Express
const app = express();
app.use(express.json());
app.use(cors());

// === SERVE LA PAGINA PRINCIPALE ===
// Invece di servire direttamente file statici, leggiamo index.html
// e sostituiamo la variabile ${ADSENSE_ID} con il valore reale
app.get("/", (req, res) => {
  const htmlPath = path.join(__dirname, "index.html");

  try {
    let html = fs.readFileSync(htmlPath, "utf-8");

    // Sostituisci il placeholder con il valore dell'ambiente
    const adsenseId = process.env.ADSENSE_ID || "ca-pub-XXXXXXXXXXXX";
    html = html.replace("${ADSENSE_ID}", adsenseId);

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (err) {
    console.error("Errore nel caricamento di index.html:", err);
    res.status(500).send("Errore nel caricamento della pagina");
  }
});

// === API CHAT (Hugging Face) ===
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

// === SERVE FILE STATICI (CSS, JS, IMMAGINI) ===
app.use(express.static(__dirname));

// === AVVIO SERVER ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server in ascolto su porta ${PORT}`));
