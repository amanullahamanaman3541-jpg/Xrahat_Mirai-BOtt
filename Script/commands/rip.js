module.exports.config = {
  'name': "rip",
  'version': "2.0.0",
  'hasPermssion': 2,
  'credits': "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
  'description': "scooby doo template memes",
  'commandCategory': "🤣Funny🤣",
  'usages': "[@mention/reply/UID/link/name]",
  'cooldowns': 5,
  'dependencies': {
    'fs-extra': '',
    'axios': '',
    'canvas': '',
    'jimp': '',
    'node-superfetch': ''
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

module.exports.circle = async (imageBuffer) => {
  const jimp = global.nodemodule.jimp;
  imageBuffer = await jimp.read(imageBuffer);
  imageBuffer.circle();
  return await imageBuffer.getBufferAsync("image/png");
};

module.exports.run = async ({ event, api, args, Users }) => {
  try {
    const canvas = global.nodemodule.canvas;
    const superfetch = global.nodemodule["node-superfetch"];
    const fs = global.nodemodule["fs-extra"];
    const { threadID, messageID, senderID } = event;
    
    var outputPath = __dirname + "/cache/damma.jpg";
    
    // ===== Determine targetUserId in three ways =====
    let targetUserId;
    
    if (event.type === "message_reply") {
      // Way 1: Reply to a message
      targetUserId = event.messageReply.senderID;
    } else if (args[0]) {
      if (args[0].indexOf(".com/") !== -1) {
        // Way 2: Facebook profile link
        try {
          targetUserId = await api.getUID(args[0]);
        } catch (e) {
          console.error("Error getting UID from link:", e);
          targetUserId = null;
        }
      } else if (args.join().includes("@")) {
        // Way 3: Mention or full name
        // 3a: Direct Facebook mention
        targetUserId = Object.keys(event.mentions || {})[0];
        if (!targetUserId) {
          // 3b: Full name detection
          targetUserId = await getUIDByFullName(api, threadID, args.join(" "));
        }
      } else {
        // Direct UID
        targetUserId = args[0];
      }
    } else {
      // No target specified - check traditional mentions
      targetUserId = Object.keys(event.mentions || {})[0] || senderID;
    }
    
    if (!targetUserId) {
      return api.sendMessage("❌ইউজার ডিটেক্ট করা যায়নি", threadID, messageID);
    }
    
    // Get user name for message
    let userName = "Friend";
    try {
      const userInfo = await api.getUserInfo(targetUserId);
      userName = userInfo[targetUserId]?.name || "Friend";
    } catch (e) {
      console.error("Error getting user info:", e);
    }
    
    const canvasObj = canvas.createCanvas(500, 670);
    const ctx = canvasObj.getContext('2d');
    const templateImage = await canvas.loadImage("https://i.imgur.com/jHrYZ5Y.jpeg");
    
    var profilePicResponse = await superfetch.get("https://graph.facebook.com/" + targetUserId + "/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662");
    profilePicResponse = await this.circle(profilePicResponse.body);
    
    ctx.drawImage(templateImage, 0, 0, canvasObj.width, canvasObj.height);
    ctx.drawImage(await canvas.loadImage(profilePicResponse), 30, 469, 178, 178);
    
    const finalImageBuffer = canvasObj.toBuffer();
    fs.writeFileSync(outputPath, finalImageBuffer);
    
    const ripMessages = [
      `তুই একটা বদল\nমাথায় গোবর-গু ছাড়া কিছু নাই 🤣😹`,
      `${userName} এর আত্মার শান্তি কামনা করছি 🙏😹`,
      `${userName} এর জন্য RIP মার্কা মেম! 🤪`
    ];
    
    const randomMessage = ripMessages[Math.floor(Math.random() * ripMessages.length)];
    
    api.sendMessage({
      'attachment': fs.createReadStream(outputPath, {
        'highWaterMark': 131072
      }),
      'body': randomMessage
    }, threadID, () => fs.unlinkSync(outputPath), messageID);
    
  } catch (error) {
    console.error("Error in rip command:", error);
    api.sendMessage("❌ ছবি তৈরি করতে সমস্যা হয়েছে!", event.threadID, event.messageID);
  }
};
