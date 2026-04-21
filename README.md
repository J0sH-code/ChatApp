# CipherLink

A real-time encrypted chat application built with **Socket.IO**, featuring multiple communication modes (public, room-based, and direct messaging) and a custom **client-side AES-256-GCM encryption system**.

---

## Overview

CipherLink is a backend-focused project designed to explore:

- Real-time communication using WebSockets  
- Session-based message routing (public, rooms, direct)  
- Client-side encryption using the Web Crypto API  
- Modular backend architecture with Socket.IO and Express  

Messages are encrypted on the client before being sent and decrypted on receipt, ensuring that raw message content is not transmitted in plaintext.

---

## Features

- Real-time messaging using Socket.IO  
- Multiple communication modes:
  - Public broadcast  
  - Room-based messaging  
  - Direct messaging via socket IDs  
- Client-side encryption (AES-256-GCM)  
- Deterministic key derivation (SHA-256)  
- Session-based routing system (Map-based per-socket state)  
- Modular backend structure  

---

## Tech Stack

### Backend
- Node.js  
- Express  
- Socket.IO  

### Frontend
- Vanilla JavaScript  
- Web Crypto API  

---

## Encryption System

CipherLink uses a deterministic key derivation approach:

1. A shared identifier is created based on session type:
   - Public → `"public-shared-key"`
   - Room → `"room-{roomName}"`
   - Direct → `"direct-{socketIdA}-{socketIdB}"`

2. The identifier is hashed using SHA-256  

3. The resulting hash is used as a 256-bit AES-GCM key  

4. Messages are:
   - Encrypted using AES-GCM with a random IV  
   - Encoded in Base64  
   - Sent via Socket.IO  
   - Decrypted on the receiving client  

### Important Note

This system **does not implement full end-to-end encryption security**. Since keys are derived from predictable identifiers, they can be reproduced if the identifier is known. This project is intended for **learning and experimentation**, not production use.

---

## Project Structure
Server/
│
├── index.js # Entry point (server + socket initialization)
├── config.env # Environment variables
│
├── http/
│ └── express.js # Express app configuration
│
├── socket/
│ ├── socketServer.js # Socket.IO connection setup
│ ├── handlers.js # Event handlers
│ ├── sessions.js # Session state management
│ └── router.js # Message routing logic
│
Client/
│
├── index.html
├── socket.js # Socket client + listeners
├── encryption.js # AES encryption module
├── ui.js # UI logic
└── domElements.js # DOM references


---

## Getting Started

### 1. Clone the repository
git clone https://github.com/J0sH-code/ChatApp.git
cd ChatApp


### 2. Setup environment variables

Create a `config.env` file inside the `Server/` directory:
PORT_NUMBER=3000


### 3. Install dependencies
cd Server
npm install


### 4. Run the server
node index.js


### 5. Open the client

Open `Client/index.html` in your browser.

---

## Current Limitations

- No authentication or user identity system  
- No message persistence  
- Deterministic keys (not securely exchanged)  
- No forward secrecy or key rotation  
- Not production-ready security  

---

## Future Improvements

- Implement secure key exchange (Diffie-Hellman / ECDH)  
- Add authentication system  
- Integrate a database for message storage  
- Improve UI/UX  
- Add presence and typing indicators  
- Strengthen encryption model toward real end-to-end security  

---

## Author

**Josh Ryle R. Santeno**  
Aspiring backend developer focused on building real-world systems and understanding how things work under the hood.
