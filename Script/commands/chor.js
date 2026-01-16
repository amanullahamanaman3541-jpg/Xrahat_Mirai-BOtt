module.exports.config = {
	name: "chor",
	version: "1.0.2",
	hasPermssion: 0,
	credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
	description: "scooby doo template memes",
	commandCategory: "🤣Funny🤣",
	usages: "[@mention/reply/UID/link/name]",
	cooldowns: 5,
	dependencies: {
		"fs-extra": "",
		"axios": "",
		"canvas": "",
		"jimp": "",
		"node-superfetch": ""
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

module.exports.circle = async (image) => {
	const jimp = global.nodemodule['jimp'];
	image = await jimp.read(image);
	image.circle();
	return await image.getBufferAsync("image/png");
};

module.exports.run = async ({ event, api, args, Users }) => {
	try {
		const Canvas = global.nodemodule['canvas'];
		const request = global.nodemodule["node-superfetch"];
		const jimp = global.nodemodule["jimp"];
		const fs = global.nodemodule["fs-extra"];
		var path_toilet = __dirname + '/cache/damma.jpg';
		
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
			targetID = Object.keys(event.mentions || {})[0] || event.senderID;
		}
		
		if (!targetID) {
			return api.sendMessage("📌 ব্যবহারের নিয়ম:\n- chor @মেনশন\n- chor [রিপ্লাই]", event.threadID, event.messageID);
		}
		
		// Get user info for the target
		const userInfo = await api.getUserInfo(targetID);
		const userName = userInfo[targetID]?.name || "ইউজার";
		
		const canvas = Canvas.createCanvas(500, 670);
		const ctx = canvas.getContext('2d');
		const background = await Canvas.loadImage('https://i.imgur.com/ES28alv.png');
		
		var avatar = await request.get(`https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
		avatar = await this.circle(avatar.body);
		ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
		ctx.drawImage(await Canvas.loadImage(avatar), 48, 410, 111, 111);
		
		const imageBuffer = canvas.toBuffer();
		fs.writeFileSync(path_toilet, imageBuffer);
		
		const messages = [
			`বলদ মেয়েদের চিপায় ধরা খাইছে 😁😁`,
			`${userName} তোর চুরির ক্যারিয়ার শেষ! 🚔`,
			`চোর ধরা পড়েছে! ${userName} এখন জেলে যাবে! ⚖️`,
			`${userName} এর চুরির দিন শেষ! 👮‍♂️`,
			`এইবার ধরা পড়ে গেলি ${userName}! চোর চোর! 🚨`
		];
		
		const randomMessage = messages[Math.floor(Math.random() * messages.length)];
		
		api.sendMessage({
			body: randomMessage,
			attachment: fs.createReadStream(path_toilet, { 'highWaterMark': 128 * 1024 })
		}, event.threadID, () => fs.unlinkSync(path_toilet), event.messageID);
		
	} catch (e) {
		console.error(e);
		api.sendMessage("❌ ছবি তৈরি করতে সমস্যা হয়েছে!", event.threadID, event.messageID);
	}
};
