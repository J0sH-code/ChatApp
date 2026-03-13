/**
 * AES-GCM Encryption Module for Socket.IO Chat
 * Uses the Web Crypto API for 256-bit AES-GCM encryption
 */

let aesKey = null; // Store the AES key in memory for reuse during the session

/**
 * Generate a 256-bit AES-GCM key once per session
 * The key is stored in memory and reused for all encrypt/decrypt operations
 * @returns {Promise<CryptoKey>} The AES key with encrypt and decrypt capabilities
 */
async function generateAESKey() {
  // Return existing key if already generated
  if (aesKey) {
    return aesKey;
  }

  // Generate a new 256-bit AES-GCM key
  aesKey = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256
    },
    true, 
    ["encrypt", "decrypt"]
  );

  return aesKey;
}

/**
 * Derive a shared AES-GCM key from a shared identifier string
 * Both clients with the same identifier will derive the same key
 * @param {string} sharedIdentifier - A shared string (e.g., sorted socket IDs or room name)
 * @returns {Promise<CryptoKey>} Derived AES-GCM key
 */
async function deriveKeyFromString(sharedIdentifier) {
  // Hash the identifier using SHA-256 to get a 256-bit key
  const encoder = new TextEncoder();
  const encodedId = encoder.encode(sharedIdentifier);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedId);
  
  // Import the hash as an AES-GCM key
  const derivedKey = await crypto.subtle.importKey(
    'raw',
    hashBuffer,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  );
  
  return derivedKey;
}

/**
 * Set the session key from a derived identifier
 * Store it in memory for reuse
 * @param {string} sharedIdentifier - A shared string (e.g., sorted socket IDs or room name)
 * @returns {Promise<CryptoKey>} The derived AES key
 */
async function setSharedKey(sharedIdentifier) {
  aesKey = await deriveKeyFromString(sharedIdentifier);
  return aesKey;
}

/**
 * Convert ArrayBuffer to Base64 string
 * @param {ArrayBuffer} buffer - The ArrayBuffer to encode
 * @returns {string} Base64 encoded string
 */
function base64Encode(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 string to ArrayBuffer
 * @param {string} base64 - The Base64 encoded string
 * @returns {ArrayBuffer} The decoded ArrayBuffer
 */
function base64Decode(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Encrypt a message using AES-GCM
 * Generates a random 12-byte IV for each encryption
 * @param {string} message - JSON string to encrypt
 * @param {CryptoKey} key - AES key from generateAESKey()
 * @returns {Promise<{iv: string, ciphertext: string}>} Encrypted data with IV and ciphertext as Base64 strings
 */
async function encryptMessage(message, key) {
  // Generate a random 12-byte IV for this message
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encode the message as UTF-8
  const encoder = new TextEncoder();
  const messageBuffer = encoder.encode(message);

  // Encrypt the message using AES-GCM
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    messageBuffer
  );

  // Return encrypted data with IV and ciphertext as Base64 strings
  return {
    iv: base64Encode(iv),
    ciphertext: base64Encode(ciphertext)
  };
}

/**
 * Decrypt a message using AES-GCM
 * @param {Object} encryptedData - Object containing iv and ciphertext as Base64 strings
 * @param {CryptoKey} key - AES key from generateAESKey()
 * @returns {Promise<string>} The decrypted original JSON string
 */
async function decryptMessage(encryptedData, key) {
  // Convert Base64 values back to ArrayBuffer
  const iv = base64Decode(encryptedData.iv);
  const ciphertext = base64Decode(encryptedData.ciphertext);

  // Decrypt the message using AES-GCM
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    ciphertext
  );

  // Decode the decrypted buffer as UTF-8 string
  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

/**
 * Get the current session AES key
 * @returns {CryptoKey} The current AES key stored in memory
 */
function getKey() {
  return aesKey;
}

/**
 * Create a user message object and convert to JSON string
 * @param {string} message - The message content
 * @param {string} senderID - The sender's socket ID
 * @returns {string} JSON stringified message object
 */
function userMessage(message, senderID) {
  let messageData = {
    type: "user",
    content: message,
    timestamp: Date.now(),
    senderID: senderID,
  };
  return JSON.stringify(messageData);
}

export { 
  generateAESKey, 
  deriveKeyFromString, 
  setSharedKey, 
  encryptMessage, 
  decryptMessage, 
  base64Encode, 
  base64Decode, 
  getKey, 
  userMessage 
};
