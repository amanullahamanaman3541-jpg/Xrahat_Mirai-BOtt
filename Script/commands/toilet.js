module.exports.config = {
	name: "toilet",
	version: "2.0.0",
	hasPermssion: 0,
	credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
	description: "Toilet 🚽",
	commandCategory: "Image",
	usages: "[@mention/reply/UID/link/name]",
	cooldowns: 5,
	dependencies: {
	  "fs-extra": "",
	  "axios": "",
	  "canvas": "",
	  "jimp": "",
	  "path": ""
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
    const dirMaterial = __dirname + `/cache/`;
    const path = resolve(__dirname, 'cache', 'toilet.png');
    if (!existsSync(dirMaterial + "")) mkdirSync(dirMaterial, { recursive: true });
    if (!existsSync(path)) await downloadFile("https://i.imgur.com/BtSlsSS.jpg", path);
}

async function makeImage({ one, two }) {
    const fs = global.nodemodule["fs-extra"];
    const path = global.nodemodule["path"];
    const axios = global.nodemodule["axios"]; 
    const jimp = global.nodemodule["jimp"];
    const __root = path.resolve(__dirname, "cache");

    let hon_img = await jimp.read(__root + "/toilet.png");
    let pathImg = __root + `/toilet_${one}_${two}.png`;
    let avatarOne = __root + `/avt_${one}.png`;
    let avatarTwo = __root + `/avt_${two}.png`;
    
    let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));
    
    let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));
    
    let circleOne = await jimp.read(await circle(avatarOne));
    let circleTwo = await jimp.read(await circle(avatarTwo));
    hon_img.resize(292, 345).composite(circleOne.resize(70, 70), 100, 200).composite(circleTwo.resize(70, 70), 100, 200);
    
    let raw = await hon_img.getBufferAsync("image/png");
    
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

module.exports.run = async function ({ event, api, args, Currencies }) { 
    const fs = global.nodemodule["fs-extra"];
    const hc = Math.floor(Math.random() * 101);
    const rd = Math.floor(Math.random() * 100000) + 100000;
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
            return api.sendMessage("❌যাকে টয়লেট এ বসাতে চাও🐸\nতাকে ম্যানশন করো", threadID, messageID);
        }
        targetID = mention[0];
    }
    
    if (!targetID) {
        return api.sendMessage("❌রাহাদ বসকে ডাক দে🫩\nকীভাবে কমান্ড ব্যবহার করতে হয় শিখায় দিবো🥴", threadID, messageID);
    }
    
    // Check if trying to toilet oneself
    if (targetID === senderID) {
        return api.sendMessage("🚽নিজের ম্যাসেজ এর রিপ্লাই দিলে হবে না🤣", threadID, messageID);
    }
    
    // Give money to sender (original feature)
    try {
        await Currencies.increaseMoney(senderID, parseInt(hc * rd));
    } catch (e) {
        console.error("Error giving money:", e);
    }
    
    const one = senderID, two = targetID;
    
    // Get user names for message
    let userName = "Friend";
    try {
        const userInfo = await api.getUserInfo(targetID);
        userName = userInfo[targetID]?.name || "Friend";
    } catch (e) {
        userName = "Friend";
    }
    
    const toiletMessages = [
        `you deserve this place, ${userName}! 🚽`,
        `${userName}, এইটা তোমার জন্য উপযুক্ত জায়গা! 😂`,
        `টয়লেটে স্বাগতম, ${userName}! 🚽✨`,
        `${userName} এর জন্য টয়লেট রিজার্ভ করা হয়েছে! 🚽`,
        `এইবার টয়লেটে বসে চিন্তা করো, ${userName}! 😁`
    ];
    
    const randomMessage = toiletMessages[Math.floor(Math.random() * toiletMessages.length)];
    
    try {
        const path = await makeImage({ one, two });
        return api.sendMessage({ 
            body: randomMessage, 
            attachment: fs.createReadStream(path)
        }, threadID, () => fs.unlinkSync(path), messageID);
    } catch (error) {
        console.error("Error creating image:", error);
        return api.sendMessage("❌ ছবি তৈরি করতে সমস্যা হয়েছে!", threadID, messageID);
    }
}
