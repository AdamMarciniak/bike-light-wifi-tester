const WebSocket = require("ws");

// Configuration
const ESP32_IP = "192.168.4.1"; // Default IP for ESP32 in AP mode
const ESP32_PORT = 80;
const BUFFER_SIZE = 60480;
const SEND_INTERVAL = 1000; // Send every 1 second

// Create WebSocket connection
const ws = new WebSocket(`ws://${ESP32_IP}:${ESP32_PORT}/ws`);

// Generate random bytes
function generateRandomBuffer() {
  const arr = Array(BUFFER_SIZE)
    .fill()
    .map(() => Math.floor(Math.random() * 256));
  console.log(arr.slice(0, 10));
  return Buffer.from(arr);
}

// Connection opened
ws.on("open", function open() {
  console.log("Connected to ESP32");

  // Send random data periodically

  if (ws.readyState === WebSocket.OPEN) {
    const data = generateRandomBuffer();
    ws.send(data);
    console.log(`Sent ${data.length} bytes`);
  }
  //   setInterval(() => {

  //   }, SEND_INTERVAL);
  ws.close();
  process.exit();
});

// Handle messages from the server
ws.on("message", function incoming(data) {
  console.log("Received acknowledgment:", data);
});

// Handle errors
ws.on("error", function error(err) {
  console.error("WebSocket error:", err);
});

// Handle connection close
ws.on("close", function close() {
  console.log("Disconnected from ESP32");
});

// Handle process termination
process.on("SIGINT", () => {
  console.log("\nClosing connection...");
  ws.close();
  process.exit();
});
