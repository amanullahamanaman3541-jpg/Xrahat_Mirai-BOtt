module.exports.config = {
  name: "pair1",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
  description: "Pair two users with a fun compatibility score",
  commandCategory: "🩵love🩵",
  usages: "[@mention/reply/UID/link/name]",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "jimp": "",
    "path": ""
  }
};

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

module.exports.onLoad = async () => {
  const { resolve } = global.nodemodule["path"];
  const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
  const { downloadFile } = global.utils;
  const dirMaterial = __dirname + `/cache/canvas/`;
  const path = resolve(__dirname, 'cache/canvas', 'maria.png');
  if (!existsSync(dirMaterial + "canvas")) mkdirSync(dirMaterial, { recursive: true });
  if (!existsSync(path)) await downloadFile("https://i.postimg.cc/TPKqsZ0L/r07qxo-R-Download.jpg", path);
};

async function makeImage({ one, two }) {
  const fs = global.nodemodule["fs-extra"];
  const path = global.nodemodule["path"];
  const axios = global.nodemodule["axios"];
  const jimp = global.nodemodule["jimp"];
  const __root = path.resolve(__dirname, "cache", "canvas");

  let pairing_img = await jimp.read(__root + "/maria.png");
  let pathImg = __root + `/pairing_${one}_${two}.png`;
  let avatarOne = __root + `/avt_${one}.png`;
  let avatarTwo = __root + `/avt_${two}.png`;

  let getAvatarOne = (await axios.get(
    `https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
    { responseType: 'arraybuffer' }
  )).data;
  fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));

  let getAvatarTwo = (await axios.get(
    `https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
    { responseType: 'arraybuffer' }
  )).data;
  fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));

  let circleOne = await jimp.read(await circle(avatarOne));
  let circleTwo = await jimp.read(await circle(avatarTwo));
  pairing_img
    .composite(circleOne.resize(145, 145), 159, 167)
    .composite(circleTwo.resize(145, 145), 442, 172);

  let raw = await pairing_img.getBufferAsync("image/png");
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

module.exports.run = async function ({ api, event, args }) {
  const fs = require("fs-extra");
  const { threadID, messageID, senderID } = event;

  let partnerID, partnerName;
  let senderName;

  if (event.type === "message_reply") {
    partnerID = event.messageReply.senderID;
  } else if (args[0]) {
    if (args[0].includes(".com/")) {
      partnerID = await api.getUID(args[0]);
    } else if (args.join().includes("@")) {
      partnerID = Object.keys(event.mentions || {})[0]
        || await getUIDByFullName(api, event.threadID, args.join(" "));
    } else {
      partnerID = args[0];
    }
  }

  if (!partnerID) {
    const threadInfo = await api.getThreadInfo(threadID);
    const list = threadInfo.participantIDs.filter(id => id !== senderID);
    partnerID = list[Math.floor(Math.random() * list.length)];
  }

  if (partnerID === senderID) {
    return api.sendMessage("❌নিজের মেসেজ এর রিপ্লাই দিলে হবে না বলদ🤣\nঅন্য জনের মেসেজ এ রিপ্লাই দাও", threadID, messageID);
  }

  const percentages = ['21%','67%','19%','37%','17%','96%','52%','62%','76%','83%','100%','99%','0%','48%'];
  const matchRate = percentages[Math.floor(Math.random() * percentages.length)];

  const senderInfo = await api.getUserInfo(senderID);
  senderName = senderInfo[senderID]?.name || "You";

  const partnerInfo = await api.getUserInfo(partnerID);
  partnerName = partnerInfo[partnerID]?.name || "Partner";

  // ===== বাংলা Compatibility Comments =====
  const compatibilityComments = {
    '100%': '💯একদম পারফেক্ট ম্যাচ! তোমরা সত্যিই আত্মার সঙ্গী!',
    '99%': '😍প্রায় নিখুঁত! সামান্য বোঝাপড়া হলেই সব ঠিক!',
    '96%': '❤️‍🔥দারুণ কেমিস্ট্রি! একে অপরকে সম্পূর্ণ করো!',
    '83%': '💖খুব ভালো ম্যাচ! সম্পর্কটা সুন্দর হবে!',
    '76%': '💕ভালো মিল! একটু চেষ্টা করলেই সফল!',
    '67%': '😊ভালো সম্ভাবনা আছে! একে অপরকে বোঝার চেষ্টা করো!',
    '62%': '🙂মোটামুটি মিল! সময় দিলে সব ঠিক হবে!',
    '52%': '😐৫০-৫০ চান্স! সবকিছু তোমাদের উপর!',
    '48%': '🤔একটু কঠিন হতে পারে! আরও চেষ্টা দরকার!',
    '37%': '😅মিল কম! ভালোভাবে ভেবে দেখো!',
    '21%': '😬খুব কম মিল! অন্য কাউকে চেষ্টা করাই ভালো!',
    '19%': '😕প্রায় কোনো মিল নেই!',
    '17%': '😔ভালো ম্যাচ নয়!',
    '0%': '😭একদমই মিল নেই! ভুলে যাও একে অপরকে!'
  };

  const matchComment = compatibilityComments[matchRate];

  const imgPath = await makeImage({ one: senderID, two: partnerID });

  return api.sendMessage({
    body:
`🥰 Successful pairing
• ${senderName} 🎀
• ${partnerName} 🎀

💌 Wish you two hundred years of happiness ❤️❤️

Love percentage: ${matchRate} 💙
💬 ${matchComment}`,
    attachment: fs.createReadStream(imgPath),
    mentions: [
      { id: senderID, tag: senderName },
      { id: partnerID, tag: partnerName }
    ]
  }, threadID, () => fs.unlinkSync(imgPath), messageID);
};
