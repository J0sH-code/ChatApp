/**
 * DOM Elements Module
 * Exports all DOM queries used throughout the chat application
 */

export const messageInput = document.getElementById("message-input");
export const sendMessageBTN = document.getElementById("send-message");
export const roomInput = document.getElementById("room-input");
export const sendRoomBTN = document.getElementById("send-room");
export const idInput = document.getElementById("id-input");
export const sendIdBTN = document.getElementById("send-id");
export const messageView = document.querySelector("#show-content");
export const socketView = document.querySelector(".socket-holder");
export const popUpId = document.getElementById("request-id");
export const popUpOverlay = document.querySelector(".popup-overlay");
export const popUpAcceptBtn = document.getElementById("accept-btn");
export const popUpIgnoreBtn = document.getElementById("ignore-btn");
