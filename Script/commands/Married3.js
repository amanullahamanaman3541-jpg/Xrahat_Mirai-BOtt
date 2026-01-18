module.exports.config = {
    name: "married3",
    version: "3.1.1",
    hasPermssion: 0,
    credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
    description: "married",
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
    const path = resolve(__dirname, 'cache/canvas', 'marriedv4.png');
    if (!existsSync(dirMaterial + "canvas")) mkdirSync(dirMaterial, { recursive: true });
    if (!existsSync(path)) await downloadFile("https://i.ibb.co/9ZZCSzR/ba6abadae46b5bdaa29cf6a64d762874.jpg", path);
}

async function makeImage({ one, two }) {
    const fs = global.nodemodule["fs-extra"];
    const path = global.nodemodule["path"];
    const axios = global.nodemodule["axios"]; 
    const jimp = global.nodemodule["jimp"];
    const __root = path.resolve(__dirname, "cache", "canvas");

    let batgiam_img = await jimp.read(__root + "/marriedv4.png");
    let pathImg = __root + `/batman${one}_${two}.png`;
    let avatarOne = __root + `/avt_${one}.png`;
    let avatarTwo = __root + `/avt_${two}.png`;
    
    let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));
    
    let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));
    
    let circleOne = await jimp.read(await circle(avatarOne));
    let circleTwo = await jimp.read(await circle(avatarTwo));
    batgiam_img.composite(circleOne.resize(130, 130), 200, 70).composite(circleTwo.resize(130, 130), 350, 150);
    
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
        // No target specified
        return api.sendMessage("❌যাকে বিয়ে করতে চাও তাকে ম্যানশন করো😜", threadID, messageID);
    }
    
    if (!targetID) {
        return api.sendMessage("❌রাহাদ বসকে ডাক দে🫩\nকীভাবে কমান্ড ব্যবহার করতে হয় শিখায় দিবো🥴", threadID, messageID);
    }
    
    // Check if trying to marry oneself
    if (targetID === senderID) {
        return api.sendMessage("🤣নিজেই নিজেকে কীভাবে বিয়ে করবি😕 \n অন্য জন কে ম্যানশন দাও", threadID, messageID);
    }
    
    const one = senderID, two = targetID;
    
    const captions = [
        "💟ღــ💘তোমার ভালোবাসা, আমার জীবনের সবথেকে বড় উপহার।💘ღ－－💟",
        "তোমার চোখে তাকালেই আমার যে একটা পৃথিবীর আছে সেটা আমি সবকিছু ভুলে যাই!💚❤️‍🩹💞",
        "তুমি আমার জীবনের সেই গল্প, যেই গল্প আমি কোন দিন শেষ করতে চাই না!🥰😘🌻",
        "I am so lucky person! তোমার মতো একজন ভালোবাসায়ী মানুষ আমার জীবন সঙ্গী হিসাবে পেয়ে!❤️‍🩹💞🌺",
        "I feel complete in my life, যখন ভাবি তোমার মতো একটা লক্ষ্মী মানুষ আমার জীবন সঙ্গী!💝",
        "তোমাতে শুরু তোমাতেই শেষ, তুমি না থাকলে আমাদের গল্প এখানেই শেষ!🌺",
        "আমি ছিলাম, আমি আছি আমি থাকবো, শুধু তোমারই জন্য!💞",
        "❥💙══ღ══❥তোমাকে জড়িয়ে ধরার সুখ এই পৃথিবীর কোনো কিছু দিয়ে কেনা যায় না প্রিয়তমা।══ღ══❥💙❥",
        "🌻•━এতো ভালোবাসি এতো যারে চাই…মনে হয় নাতো সে যে কাছে নাই!🌻•━",
        "🌼══ღ══❥চলার পথে আমার হাতে তোমার হাতটা গুঁজে দিও, হাঁটতে গিয়ে হোঁচট খেলে আমায় তুমি সামলে নিও।🌼══ღ══❥",
        "💠✦💟✦💠আমার মনে হয় আমার মনের মধ্যে একটা নরম জমিটায়, শুধু তোমার বসবাস।💠✦💟✦💠",
        "আমার জীবনে সুখ-শান্তি লাগবে না, আমি শুধু তোমাকে চাই!🌼"
    ];
    
    const caption = captions[Math.floor(Math.random() * captions.length)];
    
    return makeImage({ one, two }).then(path =>
        api.sendMessage(
            { body: caption, attachment: fs.createReadStream(path) },
            threadID,
            () => fs.unlinkSync(path),
            messageID
        )
    );
}
