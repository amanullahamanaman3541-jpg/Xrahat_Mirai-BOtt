module.exports.config = {
	name: "uid",
	version: "2.0.0",
	hasPermssion: 0,
	credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
	description: "Get User ID.",
	commandCategory: "Tools",
	usages: "[@mention/reply/UID/link/name]",
	cooldowns: 5
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

module.exports.run = async function({ api, event, args }) {
	const { threadID, messageID, senderID } = event;
	
	// ===== Determine target in three ways =====
	let targetIDs = [];
	let userNames = [];
	let responseMessage = "";
	
	// Way 1: Reply to a message
	if (event.type === "message_reply") {
		targetIDs.push(event.messageReply.senderID);
		try {
			const userInfo = await api.getUserInfo(event.messageReply.senderID);
			userNames.push(userInfo[event.messageReply.senderID]?.name || "Unknown");
		} catch (e) {
			userNames.push("Unknown");
		}
	} 
	// Way 2: Check if there are arguments
	else if (args[0]) {
		// Check for Facebook profile link
		if (args[0].indexOf(".com/") !== -1) {
			try {
				const uid = await api.getUID(args[0]);
				if (uid) {
					targetIDs.push(uid);
					try {
						const userInfo = await api.getUserInfo(uid);
						userNames.push(userInfo[uid]?.name || "Unknown");
					} catch (e) {
						userNames.push("Unknown");
					}
				}
			} catch (e) {
				return api.sendMessage("❌ Facebook লিঙ্ক থেকে আইডি পাওয়া যায়নি!", threadID, messageID);
			}
		}
		// Check for UID (numeric string)
		else if (/^\d+$/.test(args[0]) && args[0].length > 5) {
			targetIDs.push(args[0]);
			try {
				const userInfo = await api.getUserInfo(args[0]);
				userNames.push(userInfo[args[0]]?.name || "Unknown");
			} catch (e) {
				userNames.push("Unknown");
			}
		}
		// Check for full name mention or traditional mention
		else if (args.join().includes("@")) {
			// Try traditional Facebook mentions first
			if (Object.keys(event.mentions || {}).length > 0) {
				for (let id in event.mentions) {
					targetIDs.push(id);
					userNames.push(event.mentions[id] || "Unknown");
				}
			} else {
				// Try full name detection
				const targetID = await getUIDByFullName(api, threadID, args.join(" "));
				if (targetID) {
					targetIDs.push(targetID);
					try {
						const userInfo = await api.getUserInfo(targetID);
						userNames.push(userInfo[targetID]?.name || "Unknown");
					} catch (e) {
						userNames.push("Unknown");
					}
				}
			}
		}
		// If multiple traditional mentions are present
		else if (Object.keys(event.mentions || {}).length > 0) {
			for (let id in event.mentions) {
				targetIDs.push(id);
				userNames.push(event.mentions[id] || "Unknown");
			}
		}
	}
	// Way 3: Traditional mentions (without args)
	else if (Object.keys(event.mentions).length > 0) {
		for (let id in event.mentions) {
			targetIDs.push(id);
			userNames.push(event.mentions[id] || "Unknown");
		}
	}
	
	// If no targets found, show sender's UID
	if (targetIDs.length === 0) {
		targetIDs.push(senderID);
		try {
			const userInfo = await api.getUserInfo(senderID);
			userNames.push(userInfo[senderID]?.name || "You");
		} catch (e) {
			userNames.push("You");
		}
	}
	

	if (targetIDs.length === 1) {
		try {
			const userInfo = await api.getUserInfo(targetIDs[0]);
			const userName = userInfo[targetIDs[0]]?.name || userNames[0];
			
			await api.sendMessage(`👤𝗨𝘀𝗲𝗿: ${userName}👇🏼`, threadID);
			
			return api.sendMessage(`${targetIDs[0]}`, threadID);
		} catch (e) {
		
			await api.sendMessage(`👤𝗨𝘀𝗲𝗿: ${userNames[0]}👇🏼`, threadID);
			
			return api.sendMessage(`${targetIDs[0]}`, threadID);
		}
	} else {
		// প্রথম মেসেজ: সব User এর নাম
		let nameMessage = "📋 Multiple Users:\n\n";
		for (let i = 0; i < targetIDs.length; i++) {
			nameMessage += `${i+1}. ${userNames[i]}\n`;
		}
		await api.sendMessage(nameMessage, threadID);
		
		// দ্বিতীয় মেসেজ: সব UID
		let uidMessage = "📋 Multiple UIDs:\n\n";
		for (let i = 0; i < targetIDs.length; i++) {
			uidMessage += `${i+1}. ${targetIDs[i]}\n`;
		}
		return api.sendMessage(uidMessage, threadID);
	}
};
