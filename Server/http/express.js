import  express  from 'express';
const app = express();

app.use(express.static("../Client"));
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
