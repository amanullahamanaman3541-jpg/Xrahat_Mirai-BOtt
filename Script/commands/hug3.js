const request = require("request");
const fs = require("fs");
const axios = require("axios");

module.exports.config = {
  name: "hug3",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
  description: "Hug the person you want",
  commandCategory: "🩵love🩵",
  usages: "[@mention/reply/UID/link/name]",
  cooldowns: 5,
  dependencies: { "request": "", "fs": "", "axios": "" }
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

module.exports.run = async({ api, event, args, client, Users, Threads, __GLOBAL, Currencies }) => {
    const request = require('request');
    const fs = require('fs');
    const { threadID, messageID, senderID } = event;
    
    // ===== Determine targetID in three ways =====
    let targetID;
    let tagName = "";
    
    if (event.type === "message_reply") {
        // Way 1: Reply to a message
        targetID = event.messageReply.senderID;
        try {
            const userInfo = await api.getUserInfo(targetID);
            tagName = userInfo[targetID]?.name || "Friend";
        } catch (e) {
            tagName = "Friend";
        }
    } else if (args[0]) {
        if (args[0].indexOf(".com/") !== -1) {
            // Way 2: Facebook profile link
            try {
                targetID = await api.getUID(args[0]);
                const userInfo = await api.getUserInfo(targetID);
                tagName = userInfo[targetID]?.name || "Friend";
            } catch (e) {
                console.error("Error getting UID from link:", e);
                return api.sendMessage("❌ Facebook লিঙ্ক থেকে আইডি পাওয়া যায়নি!", threadID, messageID);
            }
        } else if (args.join().includes("@")) {
            // Way 3: Mention or full name
            // 3a: Direct Facebook mention
            targetID = Object.keys(event.mentions || {})[0];
            if (targetID) {
                tagName = event.mentions[targetID] || "Friend";
                // Remove @ symbol if present
                tagName = tagName.replace("@", "");
            } else {
                // 3b: Full name detection
                targetID = await getUIDByFullName(api, threadID, args.join(" "));
                if (targetID) {
                    const userInfo = await api.getUserInfo(targetID);
                    tagName = userInfo[targetID]?.name || "Friend";
                }
            }
        } else {
            // Direct UID
            targetID = args[0];
            try {
                const userInfo = await api.getUserInfo(targetID);
                tagName = userInfo[targetID]?.name || "Friend";
            } catch (e) {
                tagName = "Friend";
            }
        }
    } else {
        // No target specified
        return api.sendMessage("❌যাকে hug করতে চান তাকে ম্যানশন করুন", threadID, messageID);
    }
    
    if (!targetID) {
        return api.sendMessage("❌রাহাদ বসকে ডাক দে🫩\nকীভাবে কমান্ড ব্যবহার করতে হয় শিখায় দিবো🥴", threadID, messageID);
    }
    
    // Check if trying to hug oneself
    if (targetID === senderID) {
        return api.sendMessage("🤗 নিজেকে জড়িয়ে ধরার মজা আলাদা!🐸🤣", threadID, messageID);
    }
    
    // List of hug GIFs (expanded list)
    var link = [
        "https://genk.mediacdn.vn/2016/04-1483112033497.gif",
        "https://i.giphy.com/media/od5H3PmEG5EVq/giphy.gif",
        "https://i.giphy.com/media/3ZnBrkqoaI2hq/giphy.gif",
        "https://i.giphy.com/media/l2QDM9Jnim1YVILXa/giphy.gif",
        "https://i.giphy.com/media/3o7abAHdYvZdBNnGZq/giphy.gif",
        "https://i.giphy.com/media/3o7TKsQ8gTp3WqXq1q/giphy.gif",
        "https://i.giphy.com/media/26tknCqiJrBQG6DrC/giphy.gif"
    ];

    // Randomly select a GIF
    var randomLink = link[Math.floor(Math.random() * link.length)];
    
    // List of hug messages
    const hugMessages = [
    `${tagName} 🤍,বউকে জড়িয়ে ধরা তোমার জন্য! 🤗💖`,
    `${tagName},কাছে এসো! 🤗 তোমাকে শক্ত করে জড়িয়ে ধরছি! ❤️`,
    `${tagName}ভার্চুয়াল জগতে জড়িয়ে ধরে তোমাকে আদর করতে চাই🥹`,
    `${tagName},এই জড়িয়ে ধরাটা শুধু তোমার জন্য💕`,
    `${tagName},তোমাকে জড়িয়ে ধরার পরে হার্ট অ্যাটাক হয়ে গেল🥹`,
`${tagName}, মন থেকে আমাকে আদর করে জড়িয়ে নাও😔🤍`,
    `${tagName} কে শক্ত করে জড়িয়ে ধরলাম!🥰💞`,
    `${tagName}, অনুভব করছো তো? এটাই আমার জড়িয়ে ধরা! 🫂💓`,
    `${tagName} একটা না, দুইটা না—অনেক বার তোমাকে জড়িয়ে ধরবো❤️‍🔥`,
    `${tagName}, এই মুহূর্তে তোমাকে শক্ত করে জড়িয়ে ধরছি! 🥰🤍`,
    `কারণ ছাড়াই ${tagName} কে একটা জড়িয়ে ধরলাম🥰😔`,
    `${tagName}, এই জড়িয়ে ধরা তোমার দিনটা সুন্দর করে দিক! 💝🤗`,
    `${tagName} কে চোখ বন্ধ করে শক্ত করে জড়িয়ে ধরলাম! 🥺🤍`,
    `${tagName}, এই জড়িয়ে ধরায় তুমি নিরাপদ হয়ে গেছো🙄🐸`,
    `${tagName} এর কাছে ভালোবাসা ভরা একটা জড়িয়ে ধরা পাঠালাম! 💕🤗`
];
    
    const randomMessage = hugMessages[Math.floor(Math.random() * hugMessages.length)];
    
    // Callback function to send the message with the GIF
    var callback = () => api.sendMessage({
        body: randomMessage,
        mentions: [{
            tag: tagName,
            id: targetID
        }],
        attachment: fs.createReadStream(__dirname + "/cache/hug.gif")
    }, threadID, () => fs.unlinkSync(__dirname + "/cache/hug.gif"), messageID);

    // Download the GIF and then call the callback
    return request(encodeURI(randomLink))
        .pipe(fs.createWriteStream(__dirname + "/cache/hug.gif"))
        .on("close", () => callback())
        .on("error", (err) => {
            console.error("Error downloading GIF:", err);
            api.sendMessage("❢❢━━━━━•『🚫』•━━━━━❢❢\n\n❌ GIF ডাউনলোড করতে সমস্যা হচ্ছে!\n\n❢❢━━━━━•『🚫』•━━━━━❢❢", threadID, messageID);
        });
};
