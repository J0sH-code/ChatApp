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

/**
 * Authentication middleware for JWT validation
 * Extracts and validates JWT token from Authorization header
 * Attaches decoded user information to request object
 * 
 * BUG: Current implementation has a critical flaw - it attempts to split the authHeader 
 * before checking if it exists, which will cause a server crash if no Authorization 
 * header is provided. The check for authHeader should come before attempting to split it.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    // BUG: This line will throw an error if authHeader is undefined
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

app.get("/login", authenticateToken, (req, res) => {
    console.log(req.user);
    console.log(users.filter(user => user.username === req.user.username));
    
    res.json(users.filter(user => user.username === req.user.username));
})

//LOGIN endpoint for future log in page functionality
//BUG: Parameters are swapped in the callback function (req, res) vs (res, req)
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
