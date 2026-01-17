module.exports.config = {
  name: "hack",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
  description: "hack",
  commandCategory: "hack",
  usages: "[@mention/reply/UID/link/name]",
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "canvas": ""
  },
  cooldowns: 5
};

// ===== Helper: Full Name Mention Detection =====
async function getUIDByFullName(api, threadID, body) {
  if (!body.includes("@")) return null;
  
  const match = body.match(/@(.+)/);
  if (!match) return null;
  
  const targetName = match[1].trim().toLowerCase().replace(/\s+/g, " ");
  const threadInfo = await api.getThreadInfo(threadID);
  const users = threadInfo.userInfo || [];
  
  const user = users.find(u => {
    if (!u.name) return false;
    const fullName = u.name.trim().toLowerCase().replace(/\s+/g, " ");
    return fullName === targetName;
  });
  
  return user ? user.id : null;
}

module.exports.wrapText = (ctx, name, maxWidth) => {
  return new Promise(resolve => {
    if (ctx.measureText(name).width < maxWidth) return resolve([name]);
    if (ctx.measureText('W').width > maxWidth) return resolve(null);
    const words = name.split(' ');
    const lines = [];
    let line = '';
    while (words.length > 0) {
      let split = false;
      while (ctx.measureText(words[0]).width >= maxWidth) {
        const temp = words[0];
        words[0] = temp.slice(0, -1);
        if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
        else {
          split = true;
          words.splice(1, 0, temp.slice(-1));
        }
      }
      if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) line += `${words.shift()} `;
      else {
        lines.push(line.trim());
        line = '';
      }
      if (words.length === 0) lines.push(line.trim());
    }
    return resolve(lines);
  });
} 

module.exports.run = async function ({ args, Users, Threads, api, event, Currencies }) {
  const { loadImage, createCanvas } = require("canvas");
  const fs = global.nodemodule["fs-extra"];
  const axios = global.nodemodule["axios"];
  let pathImg = __dirname + "/cache/background.png";
  let pathAvt1 = __dirname + "/cache/Avtmot.png";
  
  // ===== Determine targetID in three ways =====
  let targetID;
  
  if (event.type === "message_reply") {
    // Way 1: Reply to a message
    targetID = event.messageReply.senderID;
  } else if (args[0]) {
    if (args[0].indexOf(".com/") !== -1) {
      // Way 2: Facebook profile link
      try {
        targetID = await api.getUID(args[0]);
      } catch (e) {
        console.error("Error getting UID from link:", e);
        targetID = null;
      }
    } else if (args.join().includes("@")) {
      // Way 3: Mention or full name
      // 3a: Direct Facebook mention
      targetID = Object.keys(event.mentions || {})[0];
      if (!targetID) {
        // 3b: Full name detection
        targetID = await getUIDByFullName(api, event.threadID, args.join(" "));
      }
    } else {
      // Direct UID
      targetID = args[0];
    }
  } else {
    // No target specified - default to sender
    targetID = event.senderID;
  }
  
  if (!targetID) {
    return api.sendMessage("❌রাহাদ বসকে ডাক দে🫩\nকীভাবে কমান্ড ব্যবহার করতে হয় শিখায় দিবো🥴", event.threadID, event.messageID);
  }
  
  try {
    var name = await Users.getNameUser(targetID);
  } catch (e) {
    var name = "Unknown User";
  }
  
  var ThreadInfo = await api.getThreadInfo(event.threadID);
  
  var background = [
    "https://i.imghippo.com/files/yYX4554yLo.jpeg"
  ];
  
  var rd = background[Math.floor(Math.random() * background.length)];
  
  let getAvtmot = (
    await axios.get(
      `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: "arraybuffer" }
    )
  ).data;
  fs.writeFileSync(pathAvt1, Buffer.from(getAvtmot, "utf-8"));

  let getbackground = (
    await axios.get(`${rd}`, {
      responseType: "arraybuffer",
    })
  ).data;
  fs.writeFileSync(pathImg, Buffer.from(getbackground, "utf-8"));

  let baseImage = await loadImage(pathImg);
  let baseAvt1 = await loadImage(pathAvt1);
 
  let canvas = createCanvas(baseImage.width, baseImage.height);
  let ctx = canvas.getContext("2d");
  ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
  ctx.font = "400 23px Arial";
  ctx.fillStyle = "#1878F3";
  ctx.textAlign = "start";
  
  const lines = await this.wrapText(ctx, name, 1160);
  ctx.fillText(lines.join('\n'), 200, 497);
  ctx.beginPath();

  ctx.drawImage(baseAvt1, 83, 437, 100, 101);
  
  const imageBuffer = canvas.toBuffer();
  fs.writeFileSync(pathImg, imageBuffer);
  fs.removeSync(pathAvt1);
  
  const hackMessages = [
    `🔐 ${name} এর অ্যাকাউন্ট হ্যাক করা হচ্ছে...`,
    `📱 ${name} এর মোবাইল ব্রাউজিং হিস্টরি সংগ্রহ করা হচ্ছে...`,
    `💬 ${name} এর সকল মেসেজ চুরি করা হচ্ছে...`,
    `📸 ${name} এর প্রাইভেট ফটো ডাউনলোড করা হচ্ছে...`,
    `✅ ${name} এর অ্যাকাউন্ট হ্যাক সম্পূর্ণ!`,
    `🚨 ${name} এর সব ডাটা চুরি হয়ে গেছে!`
  ];
  
  return api.sendMessage({ 
    body: hackMessages.join('\n'),
    attachment: fs.createReadStream(pathImg) 
  }, event.threadID, () => fs.unlinkSync(pathImg), event.messageID);
};
