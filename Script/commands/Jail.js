const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const request = require("request");

module.exports.config = {
  name: "jail",
  version: "8.3",
  hasPermssion: 0,
  credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
  description: "Wanted with thin bars",
  commandCategory: "🤣Funny🤣",
  usages: "jail [@mention/reply/UID/link/name]",
  cooldowns: 10
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

// ===== Helper: Get Target User =====
async function getTargetUser(api, event, args) {
  let targetID;
  
  // ===== Determine targetID in three ways =====
  if (event.type === "message_reply") {
    // Way 1: Reply to a message
    targetID = event.messageReply.senderID;
  } else if (args[0]) {
    if (args[0].indexOf(".com/") !== -1) {
      // Way 2: Facebook profile link
      targetID = await api.getUID(args[0]);
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
    // No target specified - jail yourself
    targetID = event.senderID;
  }
  
  return targetID;
}

// ===== Image Generator =====
async function generateThinBarsImage(avatarPath, name, outPath) {
  const avatar = await loadImage(avatarPath);
  const width = 600;
  const height = 800;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, width, height);

  // WANTED
  ctx.font = "bold 100px Arial";
  ctx.fillStyle = "#ef4444";
  ctx.textAlign = "center";
  ctx.fillText("WANTED", width / 2, 120);

  // Avatar Circle
  const cx = width / 2;
  const cy = height / 2 + 20;
  const r = 200;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(avatar, cx - r, cy - r, r * 2, r * 2);
  ctx.restore();

  // Thin Bars
  ctx.globalAlpha = 0.8;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 20;
  const barCount = 8;
  const space = width / (barCount + 1);
  for (let i = 1; i <= barCount; i++) {
    const x = i * space;
    ctx.beginPath();
    ctx.moveTo(x, 180);
    ctx.lineTo(x, height - 180);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Locked Up Text
  ctx.font = "italic 50px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("Locked Up!", width / 2, height - 100);

  // Name
  ctx.font = "bold 40px Arial";
  ctx.fillStyle = "#cbd5e1";
  ctx.fillText(name.toUpperCase(), width / 2, height - 50);

  fs.writeFileSync(outPath, canvas.toBuffer());
}

module.exports.run = async function ({ api, event, args, Users }) {
  const { threadID, messageID, senderID } = event;

  // ===== Get target user using three-way detection =====
  const targetID = await getTargetUser(api, event, args);
  
  if (!targetID) {
    return api.sendMessage(
      "❌রাহাদ বসকে ডাক দে🫩\nকীভাবে কমান্ড ব্যবহার করতে হয় শিখায় দিবো🥴",
      threadID, 
      messageID
    );
  }

  const name = await Users.getNameUser(targetID);

  try {
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const avatarCache = path.join(cacheDir, `jail_avatar_${targetID}.jpg`);
    const wantedPath = path.join(cacheDir, `jail_${Date.now()}.png`);

    // ===== Download profile picture =====
    const fbPicUrl = `https://graph.facebook.com/${targetID}/picture?height=1500&width=1500&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;

    const downloadAvatar = () => new Promise((resolve, reject) => {
      request(encodeURI(fbPicUrl))
        .pipe(fs.createWriteStream(avatarCache))
        .on("close", resolve)
        .on("error", async () => {
          // fallback image
          const defaultImg = "https://i.imgur.com/8Q2Z3tI.png";
          request(defaultImg)
            .pipe(fs.createWriteStream(avatarCache))
            .on("close", resolve)
            .on("error", reject);
        });
    });

    await downloadAvatar();

    // ===== Generate Jail Poster =====
    await generateThinBarsImage(avatarCache, name, wantedPath);

    // ===== Check if jailing yourself =====
    let jailMessage;
    if (targetID === senderID) {
      jailMessage = `নিজেই নিজেকে পোদ মেরে জেলে ভরলো🤣`;
    } else {
      jailMessage = `@${name} পোদ মারার জন্য তোমাকে জেলে ভরা হলো🥹🙆`;
    }

    // ===== Send message =====
    api.sendMessage(
      {
        body: jailMessage,
        mentions: [{ tag: name, id: targetID }],
        attachment: fs.createReadStream(wantedPath)
      },
      threadID,
      () => {
        [avatarCache, wantedPath].forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
      },
      messageID
    );

  } catch (err) {
    console.error("Jail Error:", err);
    api.sendMessage("⚠️কমান্ড এর ফাইল নষ্ট হয়ে গেছে", threadID, messageID);
  }
};
