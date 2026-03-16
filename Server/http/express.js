/**
 * Express Server Configuration
 * Sets up HTTP routes and serves static client files
 * Note: Real-time messaging is handled by Socket.IO in server.js
 */

import express from 'express';
import path from "path";
import { fileURLToPath } from "url";
import  jwt  from 'jsonwebtoken';

const app = express();

// Get current directory for ES6 modules (replaces __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files (HTML, CSS, JS) from the Client folder
app.use(express.static(path.join(__dirname, "../../Client")));
// Parse incoming JSON requests
app.use(express.json());

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];

    if (!authHeader) {
        return res.status(401).json({message: "Authorization header missing"});
    }

    try {
    // Verify token
    const decoded = jwt.verify(token, process.env.jwtKey);

    // Attach user to request
    req.user = decoded;
    console.log(req.user);
    
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

//Trial db
const users = [
  { id: 1, username: 'user1', password: 'password1', role: 'user' }
];

/**
 * GET / (GET Route)
 * Returns a simple status response
 * Testing endpoint to verify server is running
 */
app.get("/", (req, res) => {
    res.send({ status: "Get route working" });
})

app.get("/login", authenticateToken, (res, req) => {
    console.log(req.user);
    
    res.json(users.filter(user => user.username === req.user.name));
})

app.post("/login", (req, res) => {
    const {username, password} = req.body;
    
    const user = users.find(u => u.username === username && u.password === password);

    const payload = {
        id: user.id,
        username: user.username,
        role: user.role
    }

    const token = jwt.sign(payload, process.env.jwtKey, { expiresIn: '1h' });
    res.send({message: "Login successful", token});
})

/**
 * POST /post (POST Route)
 * Accepts JSON body and returns status
 * Testing endpoint for POST requests
 */
app.post("/post", (req, res) => {
    const requestContent = req.body;
    res.send({ status: "Post route working" });
})

/**
 * PATCH /patch (PATCH Route)
 * Testing endpoint for PATCH requests
 */
app.patch("/patch", (req, res) => {
    res.send({ status: "Patch route working" });
})

/**
 * DELETE /delete (DELETE Route)
 * Testing endpoint for DELETE requests
 */
app.delete("/delete", (req, res) => {
    res.send({ status: "Delete route working" });
})

export default app;
