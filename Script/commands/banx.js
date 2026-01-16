const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
	name: "banx",
	version: "2.0.6",
	hasPermssion: 2,
	credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
	description: "Permanently ban members from the group",
	commandCategory: "group",
	usages: "[key]",
	cooldowns: 5,
	info: [
		{
			key: '[tag] or [reply message] "reason"',
			prompt: '1 more warning user',
			type: '',
			example: 'ban [tag] "reason for warning"'
  		},
		{
			key: 'listban',
			prompt: 'see the list of users banned from the group',
			type: '',
			example: 'ban listban'
  		},
		{
			key: 'list',
			prompt: 'see banned users with darknames',
			type: '',
			example: 'ban list'
  		},
		{
			key: 'uban',
			prompt: 'remove the user from the list of banned groups',
			type: '',
			example: 'ban unban [id of user to delete]'
  		},
		{
			key: 'view',
			prompt: '"tag" or "blank" or "view all", respectively used to see how many times the person tagged or yourself or a member of the box has been warned ',
			type: '',
			example: 'ban view [@tag] / warns view'
  		},
		{
			key: 'reset',
			prompt: 'Reset all data in your group',
			type: '',
			example: 'ban reset'
  		}
  	]
};

// ===== ডার্কনেম জেনারেটর =====
const DARK_NAMES = [
	"BANX_Shadow", "BANX_Phantom", "BANX_Ghost", "BANX_Wraith", "BANX_Spectre",
	"BANX_Void", "BANX_Abyss", "BANX_Eclipse", "BANX_Night", "BANX_Dark",
	"BANX_Reaper", "BANX_Slayer", "BANX_Executioner", "BANX_Exile", "BANX_Outcast",
	"BANX_Forsaken", "BANX_Deserter", "BANX_Banish", "BANX_Cursed", "BANX_Damned"
];

function generateDarkName() {
	return DARK_NAMES[Math.floor(Math.random() * DARK_NAMES.length)];
}

// ===== অটো জেনারেটেড JSON ফাইল =====
const BANX_DARK_FILE = path.join(__dirname, '../temp/banx_darklist.json');

function ensureDarkFile() {
	const dir = path.join(__dirname, '../temp');
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
	
	if (!fs.existsSync(BANX_DARK_FILE)) {
		fs.writeFileSync(BANX_DARK_FILE, JSON.stringify({}, null, 2));
	}
}

function getDarkList() {
	try {
		ensureDarkFile();
		const data = fs.readFileSync(BANX_DARK_FILE, 'utf8');
		return JSON.parse(data);
	} catch (error) {
		return {};
	}
}

function saveDarkList(data) {
	try {
		fs.writeFileSync(BANX_DARK_FILE, JSON.stringify(data, null, 2), 'utf8');
		return true;
	} catch (error) {
		console.error("Error saving dark list:", error);
		return false;
	}
}

function addToDarkList(threadID, userID, userName, reason) {
	const darkList = getDarkList();
	
	if (!darkList[threadID]) {
		darkList[threadID] = [];
	}
	
	// Check if user already exists
	const existingIndex = darkList[threadID].findIndex(u => u.id === userID);
	
	const userData = {
		id: userID,
		name: userName,
		darkName: generateDarkName(),
		reason: reason || "No reason given",
		date: new Date().toLocaleString(),
		timestamp: Date.now()
	};
	
	if (existingIndex !== -1) {
		darkList[threadID][existingIndex] = userData;
	} else {
		darkList[threadID].push(userData);
	}
	
	saveDarkList(darkList);
	return userData.darkName;
}

function removeFromDarkList(threadID, userID) {
	const darkList = getDarkList();
	
	if (darkList[threadID]) {
		darkList[threadID] = darkList[threadID].filter(u => u.id !== userID);
		saveDarkList(darkList);
		return true;
	}
	return false;
}

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

module.exports.run = async function({ api, args, Users, event, Threads, utils, client }) {
	let {messageID, threadID, senderID} = event;
	var info = await api.getThreadInfo(threadID);
	if (!info.adminIDs.some(item => item.id == api.getCurrentUserID())) 
		return api.sendMessage('The bot needs group admin rights to use this command\nPlease add and try again!', threadID, messageID);
	
	var fs = require("fs-extra");
	
	if (!fs.existsSync(__dirname + `/cache/bans.json`)) {
		const dataaa = {warns: {}, banned: {}};
		fs.writeFileSync(__dirname + `/cache/bans.json`, JSON.stringify(dataaa));
	}
	
	var bans = JSON.parse(fs.readFileSync(__dirname + `/cache/bans.json`));
	
	if(!bans.warns.hasOwnProperty(threadID)) {
		bans.warns[threadID] = {}; 
		fs.writeFileSync(__dirname + `/cache/bans.json`, JSON.stringify(bans, null, 2));
	}
	
	ensureDarkFile(); // অটো JSON ফাইল তৈরি
	
	// ===== banx list কমান্ড (নতুন) =====
	if(args[0] == "list") {
		const darkList = getDarkList();
		const threadBans = darkList[threadID] || [];
		
		if (threadBans.length === 0) {
			return api.sendMessage("📭 No banned users found in this group!", threadID, messageID);
		}
		
		let listMessage = "🔴 BANX LIST 🔴\n";
		listMessage += "╔══════════════════════════════╗\n";
		
		for (let i = 0; i < threadBans.length; i++) {
			const user = threadBans[i];
			listMessage += `║ ${i + 1}. ${user.name}\n`;
			listMessage += `║    🆔 UID: ${user.id}\n`;
			listMessage += `║    📝 Reason: ${user.reason}\n`;
			listMessage += `║    ────────────────────────\n`;
		}
		
		listMessage += `╚══════════════════════════════╝\n`;
		listMessage += `📊 Total: ${threadBans.length} banned users\n\n`;
		listMessage += `💡 Use "banx unban [UID]" to remove from list`;
		
		return api.sendMessage(listMessage, threadID, messageID);
	}
	// ===== Handle Different Commands =====
	else if(args[0] == "view") {
		if(!args[1]) {
			var msg = "";
			var mywarn = bans.warns[threadID][senderID];
			if(!mywarn) return api.sendMessage('✅You have never been warned', threadID, messageID);
			var num = 1;
			for(let reasonwarn of mywarn) {
				msg += `reasonwarn\n`;
			}
			api.sendMessage(`❎You have been warned for the reason : ${msg}`, threadID, messageID);
		}
		else if(Object.keys(event.mentions).length != 0) {
			var message = "";
			var mentions = Object.keys(event.mentions);
			for(let id of mentions) {
				var name = (await api.getUserInfo(id))[id].name;
				var msg = "";
				var so = 1;
				var reasonarr = bans.warns[threadID][id];
				if(typeof reasonarr != "object") {
					msg += " Never been warned\n"
				} else {
					for(let reason of reasonarr) {
						msg += ""+reason+"\n";
					}
				}
				message += "⭐️"+name+" :"+msg+"";
			}
			api.sendMessage(message, threadID, messageID);
		}
		else if(args[1] == "all") {
			var dtwbox = bans.warns[threadID];
			var allwarn = "";
			for(let idtvw in dtwbox) {
				var name = (await api.getUserInfo(idtvw))[idtvw].name, msg = "", solan = 1;
				for(let reasonwtv of dtwbox[idtvw]) {
					msg += `${reasonwtv}`
				}
				allwarn += `${name} : ${msg}\n`;
			}
			allwarn == "" ? api.sendMessage("✅No one in your group has been warned yet", threadID, messageID) : api.sendMessage("List of members who have been warned:\n"+allwarn, threadID, messageID);
		}
	}
	else if(args[0] == "unban") {
		var id = parseInt(args[1]), mybox = bans.banned[threadID];
		var info = await api.getThreadInfo(threadID);
		if (!info.adminIDs.some(item => item.id == senderID) && !(global.config.ADMINBOT).includes(senderID)) 
			return api.sendMessage('❎Right cunt border!', threadID, messageID);
		
		if(!id) return api.sendMessage("❎Need to enter the id of the person to be removed from the banned list of the group", threadID, messageID);
		bans.banned;
		if(!mybox.includes(id)) return api.sendMessage("✅This person hasn't been banned from your group yet", threadID, messageID);
		
		// ডার্ক লিস্ট থেকেও রিমুভ
		removeFromDarkList(threadID, id);
		
		api.sendMessage(`✅Removed the member with id ${id} from the group banned list`, threadID, messageID);
		mybox.splice(mybox.indexOf(id), 1);
		delete bans.warns[threadID][id]
		fs.writeFileSync(__dirname + `/cache/bans.json`, JSON.stringify(bans, null, 2));
	}
	else if(args[0] == "listban") {
		var mybox = bans.banned[threadID];
		if (!mybox || mybox.length === 0) {
			return api.sendMessage("✅No one in your group has been banned from the group yet", threadID, messageID);
		}
		var msg = "";
		for(let iduser of mybox) {
			var name = (await api.getUserInfo(iduser))[iduser].name;
			msg += "╔Name: " + name + "\n╚ID: " + iduser + "\n\n";
		}
		api.sendMessage("❎Members who have been banned from the group:\n"+msg, threadID, messageID);
	}
	else if(args[0] == "reset") {
		var info = await api.getThreadInfo(threadID);
		if (!info.adminIDs.some(item => item.id == senderID) && !(global.config.ADMINBOT).includes(senderID)) 
			return api.sendMessage('❎Right cunt border!', threadID, messageID);
		
		// ডার্ক লিস্টও রিসেট
		const darkList = getDarkList();
		delete darkList[threadID];
		saveDarkList(darkList);
		
		bans.warns[threadID] = {};
		bans.banned[threadID] = [];
		fs.writeFileSync(__dirname + `/cache/bans.json`, JSON.stringify(bans, null, 2));
		api.sendMessage("✅ Reset all data in your group including darkname list", threadID, messageID);
	}
	//◆━━━━━━━━━◆WARN◆━━━━━━━━━◆\\
	else { 
		// ===== Three Ways to Detect Mention =====
		var iduser = [];
		var reason = "";
		
		// Way 1: Reply to a message
		if (event.type == "message_reply") {
			iduser.push(event.messageReply.senderID);
			reason = (args.join(" ")).trim();
		}
		// Way 2: Traditional Facebook mention
		else if (Object.keys(event.mentions).length != 0) {
			iduser = Object.keys(event.mentions);
			var stringname = "";
			var nametaglength = (Object.values(event.mentions)).length;
			var namearr = Object.values(event.mentions);
			
			for(let i = 0; i < nametaglength; i++) {
				stringname += (Object.values(event.mentions))[i];
			}
			
			var message = args.join(" ");
			for(let valuemention of namearr) {
				vitrivalue = message.indexOf(valuemention);
				message = message.replace(valuemention,"");
			}
			reason = message.replace(/\s+/g, ' ');
		}
		// Way 3: Full name mention or other formats
		else if (args[0]) {
			// Check for Facebook profile link
			if (args[0].indexOf(".com/") !== -1) {
				try {
					const uid = await api.getUID(args[0]);
					if (uid) {
						iduser.push(uid);
						reason = args.slice(1).join(" ").trim();
					}
				} catch (e) {
					console.error(e);
				}
			}
			// Check for UID (numeric)
			else if (/^\d+$/.test(args[0]) && args[0].length > 5) {
				iduser.push(args[0]);
				reason = args.slice(1).join(" ").trim();
			}
			// Check for full name mention
			else if (args.join(" ").includes("@")) {
				// Try direct Facebook mention first
				if (Object.keys(event.mentions || {}).length > 0) {
					iduser = Object.keys(event.mentions);
				} 
				// Try full name detection
				else {
					const targetID = await getUIDByFullName(api, threadID, args.join(" "));
					if (targetID) {
						iduser.push(targetID);
						// Extract reason by removing the @mention part
						const match = args.join(" ").match(/@(.+?)(?=\s|$)/);
						if (match) {
							const fullMention = match[0];
							reason = args.join(" ").replace(fullMention, "").trim();
						}
					}
				}
			}
		}
		
		// If no user detected, throw error
		if (iduser.length === 0) {
			const helpMessage = "🔰BANX COMMAND USAGE🔰\n\n" +
				"🔴Ban User👇\n" +
				"• banx @mention\n" +
				"• banx (reply)\n" +
				"• banx list \n" +
				"• banx view\n" +
				"• banx view @mention\n" +
				"• banx view all\n\n" +
				"🟢Unban User👇\n" +
				"• banx unban [UID]\n\n" +
				"• banx reset";
			
			return api.sendMessage(helpMessage, threadID, messageID);
		}
		
		// Check admin permission
		var info = await api.getThreadInfo(threadID);
		if (!info.adminIDs.some(item => item.id == senderID) && !(global.config.ADMINBOT).includes(senderID)) {
			return api.sendMessage('Right cunt border!', threadID, messageID);
		}
		
		var arraytag = [];
		var arrayname = [];
		
		// Process each user
		for(let iid of iduser) {
			var id = parseInt(iid);
			var nametag = (await api.getUserInfo(id))[id].name;
			arraytag.push({id: id, tag: nametag});
			
			if(!reason || reason.trim() === "") reason = "No reason was given";
			
			var dtwmybox = bans.warns[threadID];
			if(!dtwmybox.hasOwnProperty(id)) { 
				dtwmybox[id] = [];
			}
			
			var solan = (bans.warns[threadID][id]).length;
			arrayname.push(nametag);
			var pushreason = bans.warns[threadID][id];
			pushreason.push(reason);
			
			if(!bans.banned[threadID]) {
				bans.banned[threadID] = [];
			}
			
			if((bans.warns[threadID][id]).length > 0) {
				try {
					api.removeUserFromGroup(parseInt(id), threadID);
					var banned = bans.banned[threadID];
					banned.push(parseInt(id));
					
					// 🔴 ডার্ক লিস্টে অ্যাড করুন
					const darkName = addToDarkList(threadID, id, nametag, reason);
					
					// ডার্কনেম সহ মেসেজ
					const banMessage = `🚫USER PERMANENTLY Banned🚫\n\n` +
						`👤 User: ${nametag}\n` +
						`🆔 UID: ${id}\n` +
						`📝 Reason: ${reason}\n` +
						`📁(use "banx list" to view)`;
					
					api.sendMessage(banMessage, threadID);
					
				} catch (e) {
					console.error("Error removing user:", e);
					// Still add to darklist even if removal fails
					const darkName = addToDarkList(threadID, id, nametag, reason);
					api.sendMessage(`⚠️ Could not remove ${nametag} from group but added to banx list\n🕶️ Darkname: ${darkName}`, threadID);
				}
			}
		}
		
		// Save data
		fs.writeFileSync(__dirname + `/cache/bans.json`, JSON.stringify(bans, null, 2));
		
		if (arrayname.length > 0) {
			api.sendMessage({
				body: `🚨 Banx command executed for ${arrayname.join(", ")}`,
				mentions: arraytag
			}, threadID, messageID);
		}
	}
};
