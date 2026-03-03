import express from "express";
import { getEnvVar } from "./getEnvVar.js";
import { SHARED_TEST } from "./shared/example.js";
import { VALID_ROUTES } from "./shared/ValidRoutes.js";
import { ImageProvider } from "./ImageProvider.js";
import { connectMongo } from "./connectMongo.js";

const PORT = Number.parseInt(getEnvVar("PORT", false), 10) || 3000;
const STATIC_DIR = getEnvVar("STATIC_DIR", false) || "public";
const app = express();

const mongoClient = connectMongo();
await mongoClient.connect();
const imageProvider = new ImageProvider(mongoClient);



function waitDuration(numMs) {
    return new Promise(resolve => setTimeout(resolve, numMs));
}
app.use(express.static(STATIC_DIR));

app.get("/api/hello", (req, res) => {
    res.send("Hello, World " + SHARED_TEST);
});

app.get("/api/images", async (req, res) => {
    try {
        await waitDuration(1000);
        const images = await imageProvider.getAllImages();
        res.json(images);
    } catch (e) {
        res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
    }
});

app.get(Object.values(VALID_ROUTES), (req, res) => {
    res.sendFile("index.html", { root: STATIC_DIR });
});



app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}.  CTRL+C to stop.`);
});
