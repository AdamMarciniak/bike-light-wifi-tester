const http = require("http");
const image = require("./image");
const image2 = require("./image2");

const dataLen = 60480;
// const dataLen = 16;
const intArray = new Uint8Array(dataLen);

for (let i = 0; i < dataLen; i += 4) {
  // intArray[i] = 0b11100001;
  // Above is same as 225
  intArray[i] = 225;
  intArray[i + 1] = 0x00;
  intArray[i + 2] = 0;
  intArray[i + 3] = 255;
}

const buffer = Buffer.from(image2);
const buffer2 = Buffer.from(image);

let i = false;

setInterval(() => {
  if (i == false) {
    i = true;
    const options = {
      hostname: "192.168.4.1", // Replace with your ESP32's IP address
      port: 80,
      path: "/upload",
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": buffer.length,
        Connection: "close",
      },
    };

    const req = http.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);

      res.on("data", (chunk) => {
        console.log(`Response: ${chunk}`);
      });
    });

    req.on("error", (error) => {
      console.error("Error:", error);
    });
    req.write(buffer);
    console.log("Written");
    req.end();
  } else {
    const options = {
      hostname: "192.168.4.1", // Replace with your ESP32's IP address
      port: 80,
      path: "/upload",
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": buffer.length,
        Connection: "close",
      },
    };

    const req = http.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);

      res.on("data", (chunk) => {
        console.log(`Response: ${chunk}`);
      });
    });

    req.on("error", (error) => {
      console.error("Error:", error);
    });
    i = false;
    req.write(buffer2);
    console.log("Written");
    req.end();
  }
}, 500);
