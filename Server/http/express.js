import  express  from 'express';
const app = express();

app.use(express.static("../Client"));

export default app;