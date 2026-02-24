const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

// Initialize WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox"],
  },
});

// Show QR code for first-time login
client.on("qr", (qr) => {
  console.log("📱 Scan this QR code with your WhatsApp:");
  qrcode.generate(qr, { small: true });
});

// Once client is ready
client.on("ready", async () => {
  console.log("✅ WhatsApp client is ready.");

  const groupName = "Uvaish";
  const message = "ENV de de";

  const chat = await findGroupByName(groupName);
  if (!chat) {
    console.log(`❌ Group "${groupName}" not found.`);
    return;
  }

  // Controlled loop: 1000 messages with delay
  for (let i = 0; i < 500000; i++) {
    try {
      await chat.sendMessage(`${message} [${i + 1}]`);
      console.log(`✅ Sent message ${i + 1}`);
    } catch (err) {
      console.error(`❌ Error on message ${i + 1}:`, err.message);
    }
    await delay(1); // 500 ms delay between messages
  }
});

// Utility: Delay function
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Utility: Find group by name
async function findGroupByName(name) {
  const chats = await client.getChats();
  console.log(chats);
  return chats.find(
    (chat) =>  chat.name.toLowerCase() == name.toLowerCase()
  );
}

// Start the client!
client.initialize();
