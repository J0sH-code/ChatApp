import  express  from 'express';
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../../Client")));
app.use(express.json());

app.get("/", (req, res) => {
    res.send({ status: "Get route working" });
})

app.post("/post", (req, res) => {
    const requestContent = req.body;
    res.send({ status: "Post route working" });
})

app.patch("/patch", (req, res) => {
    res.send({ status: "Patch route working" });
})

app.delete("/delete", (req, res) => {
    res.send({ status: "Delete route working" });
})

export default app;
