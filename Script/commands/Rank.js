module.exports.config = {
	name: "rank",
	version: "2.0.0",
	hasPermssion: 0,
	credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
	description: "View Member Rankings",
	commandCategory: "Group",
	usages: "[@mention/reply/UID/link/name]",
	cooldowns: 5,
	dependencies: {
		"fs-extra": "",
		"path": "",
		"jimp": "",
		"node-superfetch": "",
		"canvas": ""
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

// ===== Helper: Get Target User =====
async function getTargetUser(api, event, args, Users) {
	let targetID;
	let targetName;
	
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
			if (targetID) {
				targetName = event.mentions[targetID];
			} else {
				// 3b: Full name detection
				targetID = await getUIDByFullName(api, event.threadID, args.join(" "));
			}
		} else {
			// Direct UID
			targetID = args[0];
		}
	} else {
		// No arguments - show sender's own rank
		targetID = event.senderID;
	}
	
	// Get user name if not already available
	if (!targetName && targetID) {
		targetName = global.data.userName.get(targetID) || await Users.getNameUser(targetID);
	}
	
	return { targetID, targetName };
}

module.exports.makeRankCard = async (data) => {    
	const fs = global.nodemodule["fs-extra"];
	const path = global.nodemodule["path"];
	const Canvas = global.nodemodule["canvas"];
	const request = global.nodemodule["node-superfetch"];
	const __root = path.resolve(__dirname, "cache");
	const PI = Math.PI;

	const { id, name, rank, level, expCurrent, expNextLevel } = data;

	Canvas.registerFont(__root + "/regular-font.ttf", {
		family: "Manrope",
		weight: "regular",
		style: "normal"
	});
	Canvas.registerFont(__root + "/bold-font.ttf", {
		family: "Manrope",
		weight: "bold",
		style: "normal"
	});

	const pathCustom = path.resolve(__dirname, "cache", "customrank");
	var customDir = fs.readdirSync(pathCustom);
	var dirImage = __root + "/rankcard.png";
	customDir = customDir.map(item => item.replace(/\.png/g, ""));

	for (singleLimit of customDir) {
		var limitRate = false;
		const split = singleLimit.split(/-/g);
		var min = parseInt(split[0]), max = parseInt((split[1]) ? split[1] : min);
	
		for (; min <= max; min++) {
			if (level == min) {
				limitRate = true;
				break;
			}
		}

		if (limitRate == true) {
			dirImage = pathCustom + `/${singleLimit}.png`;
			break;
		}
	}

	let rankCard = await Canvas.loadImage(dirImage);
	const pathImg = __root + `/rank_${id}.png`;
	
	var expWidth = (expCurrent * 610) / expNextLevel;
	if (expWidth > 610 - 19.5) expWidth = 610 - 19.5;
	
	let avatar = await request.get(`https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);

	avatar = await this.circle(avatar.body);

	const canvas = Canvas.createCanvas(1000, 282);
	const ctx = canvas.getContext("2d");

	ctx.drawImage(rankCard, 0, 0, canvas.width, canvas.height);
	ctx.drawImage(await Canvas.loadImage(avatar), 70, 75, 150, 150);

	ctx.font = `bold 36px Manrope`;
	ctx.fillStyle = "#FFFFFF";
	ctx.textAlign = "start";
	ctx.fillText(name, 270, 164);
	ctx.font = `42px Manrope`;
	ctx.fillStyle = "#FF7F24";
	ctx.textAlign = "center";

	ctx.font = `bold 38px Manrope`;
	ctx.fillStyle = "#FF0000";
	ctx.textAlign = "end";
	ctx.fillText(level, 934 - 68, 82);
	ctx.fillStyle = "#FF0000";
	ctx.fillText("Lv.", 934 - 55 - ctx.measureText(level).width - 10, 82);

	ctx.font = `bold 39px Manrope`;
	ctx.fillStyle = "#FF0000";
	ctx.textAlign = "end";
	ctx.fillText(rank, 934 - 55 - ctx.measureText(level).width - 16 - ctx.measureText(`Lv.`).width - 25, 82);
	ctx.fillStyle = "#FF0000";
	ctx.fillText("#", 934 - 55 - ctx.measureText(level).width - 16 - ctx.measureText(`Lv.`).width - 16 - ctx.measureText(rank).width - 16, 82);

	ctx.font = `bold 40px Manrope`;
	ctx.fillStyle = "#1874CD";
	ctx.textAlign = "start";
	ctx.fillText("/ " + expNextLevel, 710 + ctx.measureText(expCurrent).width + 10, 164);
	ctx.fillStyle = "#00BFFF";
	ctx.fillText(expCurrent, 710, 164);

	ctx.beginPath();
	ctx.fillStyle = "#FFB90F";
	ctx.arc(257 + 18.5, 147.5 + 18.5 + 36.25, 18.5, 1.5 * PI, 0.5 * PI, true);
	ctx.fill();
	ctx.fillRect(257 + 18.5, 147.5 + 36.25, expWidth, 37.5);
	ctx.arc(257 + 18.5 + expWidth, 147.5 + 18.5 + 36.25, 18.75, 1.5 * PI, 0.5 * PI, false);
	ctx.fill();

	const imageBuffer = canvas.toBuffer();
	fs.writeFileSync(pathImg, imageBuffer);
	return pathImg;
}

module.exports.circle = async (image) => {
	const jimp = global.nodemodule["jimp"];
	image = await jimp.read(image);
	image.circle();
	return await image.getBufferAsync("image/png");
}

module.exports.expToLevel = (point) => {
	if (point < 0) return 0;
	return Math.floor((Math.sqrt(1 + (4 * point) / 3) + 1) / 2);
}

module.exports.levelToExp = (level) => {
	if (level <= 0) return 0;
	return 3 * level * (level - 1);
}

module.exports.getInfo = async (uid, Currencies) => {
	let point = (await Currencies.getData(uid)).exp;
	const level = this.expToLevel(point);
	const expCurrent = point - this.levelToExp(level);
	const expNextLevel = this.levelToExp(level + 1) - this.levelToExp(level);
	return { level, expCurrent, expNextLevel };
}

module.exports.onLoad = async function () {
	const { resolve } = global.nodemodule["path"];
	const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
	const { downloadFile } = global.utils;
	const path = resolve(__dirname, "cache", "customrank");
	if (!existsSync(path)) mkdirSync(path, { recursive: true });

	if (!existsSync(resolve(__dirname, 'cache', 'regular-font.ttf'))) await downloadFile("https://raw.githubusercontent.com/catalizcs/storage-data/master/rank/fonts/regular-font.ttf", resolve(__dirname, 'cache', 'regular-font.ttf'));
	if (!existsSync(resolve(__dirname, 'cache', 'bold-font.ttf'))) await downloadFile("https://raw.githubusercontent.com/catalizcs/storage-data/master/rank/fonts/bold-font.ttf", resolve(__dirname, 'cache', 'bold-font.ttf'));
	if (!existsSync(resolve(__dirname, 'cache', 'rankcard.png'))) await downloadFile("https://raw.githubusercontent.com/catalizcs/storage-data/master/rank/rank_card/rankcard.png", resolve(__dirname, 'cache', 'rankcard.png'));
}

module.exports.run = async ({ event, api, args, Currencies, Users }) => {
	const fs = global.nodemodule["fs-extra"];
	
	// ===== Get target user using three-way detection =====
	const { targetID, targetName } = await getTargetUser(api, event, args, Users);
	
	if (!targetID) {
		const usageMessage = `╔══════════❖
║🔰𝐑𝐚𝐧𝐤 𝐔𝐬𝐚𝐠𝐞 𝐆𝐮𝐢𝐝𝐞🔰
╠══════════❖
║ • rank
║ • rank @mention
║ • rank [reply]
║ • rank [UID] 
║ • rank [link] 
╚══════════❖`;
		
		return api.sendMessage(usageMessage, event.threadID, event.messageID);
	}
	
	// Get all user data for ranking
	let dataAll = (await Currencies.getAll(["userID", "exp"]));
	dataAll.sort((a, b) => {
		if (a.exp > b.exp) return -1;
		if (a.exp < b.exp) return 1;
	});
	
	// Find rank of target user
	const rank = dataAll.findIndex(item => parseInt(item.userID) == parseInt(targetID)) + 1;
	
	if (rank == 0) {
		return api.sendMessage("❌ User not found in ranking database!", event.threadID, event.messageID);
	}
	
	const name = targetName || global.data.userName.get(targetID) || await Users.getNameUser(targetID);
	const point = await this.getInfo(targetID, Currencies);
	const timeStart = Date.now();
	
	try {
		let pathRankCard = await this.makeRankCard({ 
			id: targetID, 
			name, 
			rank, 
			...point 
		});
		
		const messageBody = targetID === event.senderID 
			? `🏆 Your Rank Card` 
			: `🏆 ${name} your Rank Card`;
		
		return api.sendMessage({
			body: messageBody,
			attachment: fs.createReadStream(pathRankCard, {'highWaterMark': 128 * 1024})
		}, event.threadID, () => fs.unlinkSync(pathRankCard), event.messageID);
		
	} catch (error) {
		console.error("Rank card generation error:", error);
		return api.sendMessage("❌ Error generating rank card!", event.threadID, event.messageID);
	}
}

// =================== LEVEL UP SYSTEM ===================
module.exports.checkLevelUp = async function (uid, Currencies, api, threadID, Users) {
	const fs = global.nodemodule["fs-extra"];
	let userData = await Currencies.getData(uid);
	let point = userData.exp;

	const newLevel = this.expToLevel(point);
	if (!userData.level) userData.level = 0;

	if (newLevel > userData.level) {
		userData.level = newLevel;
		await Currencies.setData(uid, userData);

		let allData = (await Currencies.getAll(["userID", "exp"]));
		allData.sort((a, b) => b.exp - a.exp);
		const rank = allData.findIndex(item => parseInt(item.userID) == parseInt(uid)) + 1;

		const name = global.data.userName.get(uid) || await Users.getNameUser(uid);
		let pointInfo = await this.getInfo(uid, Currencies);
		let pathRankCard = await this.makeRankCard({ id: uid, name, rank, ...pointInfo });

		api.sendMessage({
			body: `🎉 Congrats @${name}, You just leveled up to **Level ${newLevel}**! 🚀`,
			mentions: [{ tag: name, id: uid }],
			attachment: fs.createReadStream(pathRankCard)
		}, threadID, () => fs.unlinkSync(pathRankCard));
	}
};
