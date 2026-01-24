import  express  from 'express';
const app = express();

app.use(express.static("../Client"));
app.use(express.json());

app.get("/", (req, res) => {
    res.send({ status: "Get route working" });
})

app.post("/post", (req, res) => {
    res.send({ status: "Get route working" });
})

app.patch("/patch", (req, res) => {
    res.send({ status: "Get route working" });
})

app.delete("/delete", (req, res) => {
    res.send({ status: "Get route working" });
})

export default app;
