const net = require("net");
const crypto = require("crypto");

const ESP32_IP = "192.168.4.1"; // Default ESP32 AP IP
const ESP32_PORT = 3333;
const BUFFER_SIZE = 60 * 1000; // 60KB
const SEND_INTERVAL = 1000; // Send every 1 second

async function generateRandomData() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(BUFFER_SIZE, (err, buffer) => {
      if (err) reject(err);
      else resolve(buffer);
    });
  });
}
const data = await generateRandomData();

async function sendData(client) {
  return new Promise((resolve, reject) => {
    client.write(data, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`Sent ${data.length} bytes`);
        resolve();
      }
    });
  });
}

async function connectToESP32() {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();

    client.setNoDelay(true);
    // client.setRecvBufferSize(60000);
    // client.setSendBufferSize(60000);
    client.setKeepAlive(true, 10);
    client.on("error", (err) => {
      console.error("Connection error:", err);
      reject(err);
    });

    client.on("close", () => {
      console.log("Connection closed");
    });

    client.connect(ESP32_PORT, ESP32_IP, () => {
      console.log("Connected to ESP32");
      resolve(client);
    });
  });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  try {
    const client = await connectToESP32();

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      console.log("\nClosing connection...");
      client.destroy();
      process.exit();
    });

    // Continuous send loop
    while (true) {
      const startTime = process.hrtime();

      try {
        await sendData(client);
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const transferTimeMs = (seconds * 1000 + nanoseconds / 1000000).toFixed(
          2
        );
        const transferRateMbps = (
          (BUFFER_SIZE * 8) /
          (transferTimeMs / 1000) /
          1000000
        ).toFixed(2);
        console.log(
          `Transfer time: ${transferTimeMs}ms (${transferRateMbps} Mbps)`
        );
      } catch (err) {
        console.error("Error sending data:", err);
        break;
      }

      await sleep(SEND_INTERVAL);
    }

    client.destroy();
  } catch (err) {
    console.error("Failed to connect:", err);
  }
}

// Start the client
main().catch(console.error);
