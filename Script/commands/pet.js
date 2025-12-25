const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "pet",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
  description: "Pet a tagged user",
  commandCategory: "fun",
  usages: "pet @user",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, Users }) {
  try {
    const mentionIDs = Object.keys(event.mentions || {});
    if (mentionIDs.length === 0)
      return api.sendMessage(
        "❌ একজন ইউজার ট্যাগ করো!",
        event.threadID,
        event.messageID
      );

    const userID = mentionIDs[0];
    const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/pet?userid=${userID}`;

    const res = await axios.get(apiUrl, { responseType: "arraybuffer" });
    const contentType = res.headers["content-type"] || "";

    let ext = "jpg";
    if (contentType.includes("gif")) ext = "gif";
    else if (contentType.includes("mp4")) ext = "mp4";

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const filePath = path.join(cacheDir, `pet_${userID}.${ext}`);
    fs.writeFileSync(filePath, res.data);

    const name = await Users.getNameUser(userID);

    api.sendMessage(
      {
        body: `🐾 ${name} কে আদর করা হচ্ছে`,
        attachment: fs.createReadStream(filePath)
      },
      event.threadID,
      () => fs.unlinkSync(filePath),
      event.messageID
    );
  } catch (err) {
    console.error("❌ pet command error:", err);
    api.sendMessage(
      "⚠️বস api মারা খাইছে ",
      event.threadID,
      event.messageID
    );
  }
};
