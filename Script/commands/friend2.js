module.exports.config = {
  name: "friend2",
  version: "7.3.2",
  hasPermssion: 0,
  credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰", 
  description: "Get Pair From Mention",
  commandCategory: "🩵love🩵",
  usages: "[@mention/reply/UID/link/name]",
  cooldowns: 5, 
  dependencies: {
      "axios": "",
      "fs-extra": "",
      "path": "",
      "jimp": ""
  }
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

module.exports.onLoad = async() => {
  const { resolve } = global.nodemodule["path"];
  const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
  const { downloadFile } = global.utils;
  const dirMaterial = __dirname + `/cache/canvas/`;
  const path = resolve(__dirname, 'cache/canvas', 'bestu.png');
  if (!existsSync(dirMaterial + "canvas")) mkdirSync(dirMaterial, { recursive: true });
  if (!existsSync(path)) await downloadFile("https://i.imgur.com/RloX16v.jpg", path); 
}

async function makeImage({ one, two }) {
  const fs = global.nodemodule["fs-extra"];
  const path = global.nodemodule["path"];
  const axios = global.nodemodule["axios"]; 
  const jimp = global.nodemodule["jimp"];
  const __root = path.resolve(__dirname, "cache", "canvas");

  let batgiam_img = await jimp.read(__root + "/bestu.png");
  let pathImg = __root + `/batman${one}_${two}.png`;
  let avatarOne = __root + `/avt_${one}.png`;
  let avatarTwo = __root + `/avt_${two}.png`;

  let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));

  let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));

  let circleOne = await jimp.read(await circle(avatarOne));
  let circleTwo = await jimp.read(await circle(avatarTwo));
  batgiam_img.composite(circleOne.resize(191, 191), 93, 111).composite(circleTwo.resize(190, 190), 434, 107);

  let raw = await batgiam_img.getBufferAsync("image/png");

  fs.writeFileSync(pathImg, raw);
  fs.unlinkSync(avatarOne);
  fs.unlinkSync(avatarTwo);

  return pathImg;
}

async function circle(image) {
  const jimp = require("jimp");
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
}

module.exports.run = async function ({ event, api, args }) {    
  const fs = global.nodemodule["fs-extra"];
  const { threadID, messageID, senderID } = event;
  
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
    // No target specified - check traditional mentions
    const mention = Object.keys(event.mentions || {});
    if (!mention[0]) {
      return api.sendMessage("❌তোমার best friend কে ম্যানশন করো", threadID, messageID);
    }
    targetID = mention[0];
  }
  
  if (!targetID) {
    return api.sendMessage("❌রাহাদ বসকে ডাক দে🫩\nকীভাবে কমান্ড ব্যবহার করতে হয় শিখায় দিবো🥴", threadID, messageID);
  }
  
  // Check if trying to make bestie with oneself
  if (targetID === senderID) {
    return api.sendMessage("😅 তোমার মনে হয় best friend নাই🥹\nথাকলে ম্যানশন দিয়ো", threadID, messageID);
  }
  
  const one = senderID, two = targetID;
  
  try {
    const path = await makeImage({ one, two });
    return api.sendMessage({ 
      body: `✶⊶⊷⊷❍⊶⊷⊷✶\n❤️‍🔥Your Best Friend❤️‍🔥\n✶⊶⊷⊷❍⊶⊷⊷✶`, 
      attachment: fs.createReadStream(path) 
    }, threadID, () => fs.unlinkSync(path), messageID);
  } catch (error) {
    console.error("Error creating image:", error);
    return api.sendMessage("❌ ছবি তৈরি করতে সমস্যা হয়েছে!", threadID, messageID);
  }
};
