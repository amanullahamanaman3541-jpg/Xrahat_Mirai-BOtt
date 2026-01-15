module.exports.config = {
    name: "ckbot",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
    description: "Check bot, user, group information",
    commandCategory: "Media",
    usages: "user [@mention/reply/UID/link/name] | box | admin",
    cooldowns: 4,
    dependencies: {
        "request": "",
        "fs": ""
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

module.exports.run = async({api, event, args}) => {
    const fs = global.nodemodule["fs-extra"];
    const request = global.nodemodule["request"];
    const threadSetting = global.data.threadData.get(parseInt(event.threadID)) || {};
    const prefix = (threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX;
    
    if (args.length == 0) return api.sendMessage(
        `You can use:\n\n` +
        `${prefix}${this.config.name} user => it will take your own information.\n` +
        `${prefix}${this.config.name} user @[Tag] => it will get friend information tag.\n` +
        `${prefix}${this.config.name} user [UID/link/name] => it will get user information\n` +
        `${prefix}${this.config.name} box => it will get your box information\n` +
        `${prefix}${this.config.name} box [tid] => it will get specific group information\n` +
        `${prefix}${this.config.name} admin => Admin Bot's Personal Information`,
        event.threadID, event.messageID
    );
    
    // ===== BOX SUBCOMMAND =====
    if (args[0] == "box") {
        if(args[1]){ 
            let threadInfo = await api.getThreadInfo(args[1]);
            let imgg = threadInfo.imageSrc;
            var gendernam = [];
            var gendernu = [];
            for (let z in threadInfo.userInfo) {
                var gioitinhone = threadInfo.userInfo[z].gender;
                if(gioitinhone == "MALE"){
                    gendernam.push(gioitinhone);
                } else {
                    gendernu.push(gioitinhone);
                }
            };
            var nam = gendernam.length;
            var nu = gendernu.length;
            let sex = threadInfo.approvalMode;
            var pd = sex == false ? "Turn off" : sex == true ? "turn on" : "NS";
            
            if(!imgg) {
                api.sendMessage(
                    `Group name: ${threadInfo.threadName}\n` +
                    `TID: ${args[1]}\n` +
                    `Approved: ${pd}\n` +
                    `Emoji: ${threadInfo.emoji}\n` +
                    `Information:\n»${threadInfo.participantIDs.length} members and ${threadInfo.adminIDs.length} administrators.\n` +
                    `»Including ${nam} boy and ${nu} female.\n` +
                    `»Total number of messages: ${threadInfo.messageCount}.`,
                    event.threadID, event.messageID
                );
            } else {
                var callback = () => api.sendMessage({
                    body: `Group name: ${threadInfo.threadName}\n` +
                          `TID: ${args[1]}\n` +
                          `Approved: ${pd}\n` +
                          `Emoji: ${threadInfo.emoji}\n` +
                          `Information:\n»${threadInfo.participantIDs.length} members and ${threadInfo.adminIDs.length} administrators.\n` +
                          `»Including ${nam} boy and ${nu} female.\n` +
                          `»Total number of messages: ${threadInfo.messageCount}.`,
                    attachment: fs.createReadStream(__dirname + "/cache/1.png")
                }, event.threadID, () => fs.unlinkSync(__dirname + "/cache/1.png"), event.messageID); 
                
                return request(encodeURI(`${threadInfo.imageSrc}`))
                    .pipe(fs.createWriteStream(__dirname+'/cache/1.png'))
                    .on('close',() => callback());
            }
        } else {
            let threadInfo = await api.getThreadInfo(event.threadID);
            let img = threadInfo.imageSrc;
            var gendernam = [];
            var gendernu = [];
            for (let z in threadInfo.userInfo) {
                var gioitinhone = threadInfo.userInfo[z].gender;
                if(gioitinhone == "MALE"){
                    gendernam.push(gioitinhone);
                } else {
                    gendernu.push(gioitinhone);
                }
            };
            var nam = gendernam.length;
            var nu = gendernu.length;
            let sex = threadInfo.approvalMode;
            var pd = sex == false ? "Turn off" : sex == true ? "turn on" : "NS";
            
            if(!img) {
                api.sendMessage(
                    `Group name: ${threadInfo.threadName}\n` +
                    `TID: ${event.threadID}\n` +
                    `Approved: ${pd}\n` +
                    `Emoji: ${threadInfo.emoji}\n` +
                    `Information:\n»${threadInfo.participantIDs.length} members and ${threadInfo.adminIDs.length} administrators.\n` +
                    `»Including ${nam} boy and ${nu} female.\n` +
                    `»Total number of messages: ${threadInfo.messageCount}.`,
                    event.threadID, event.messageID
                );
            } else {
                var callback = () => api.sendMessage({
                    body: `Group name: ${threadInfo.threadName}\n` +
                          `TID: ${event.threadID}\n` +
                          `Approved: ${pd}\n` +
                          `Emoji: ${threadInfo.emoji}\n` +
                          `Information:\n»${threadInfo.participantIDs.length} members and ${threadInfo.adminIDs.length} administrators.\n` +
                          `»Including ${nam} boy and ${nu} female.\n` +
                          `»Total number of messages: ${threadInfo.messageCount}.`,
                    attachment: fs.createReadStream(__dirname + "/cache/1.png")
                }, event.threadID, () => fs.unlinkSync(__dirname + "/cache/1.png"), event.messageID); 
                
                return request(encodeURI(`${threadInfo.imageSrc}`))
                    .pipe(fs.createWriteStream(__dirname+'/cache/1.png'))
                    .on('close',() => callback());
            }
        }
    }
    
    // ===== ADMIN SUBCOMMAND =====
    if (args[0] == "admin") {
        var callback = () => api.sendMessage({
            body: `———»ADMIN BOT«———\n` +
                  `❯ Name:🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰\n` +
                  `❯ Facebook: https://www.facebook.com/profile.php?id=61582708907708\n` +
                  `❯ Thanks for using ${global.config.BOTNAME} bot`,
            attachment: fs.createReadStream(__dirname + "/cache/1.png")
        }, event.threadID, () => fs.unlinkSync(__dirname + "/cache/1.png"));  
        
        return request(encodeURI(`https://graph.facebook.com/61582708907708/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`))
            .pipe(fs.createWriteStream(__dirname+'/cache/1.png'))
            .on('close',() => callback());
    }
    
    // ===== USER SUBCOMMAND (with 3-way mention detection) =====
    if (args[0] == "user") { 
        let targetID;
        
        // ===== Determine targetID in three ways =====
        if (event.type === "message_reply") {
            // Way 1: Reply to a message
            targetID = event.messageReply.senderID;
        } else if (args[1]) {
            if (args[1].indexOf(".com/") !== -1) {
                // Way 2: Facebook profile link
                targetID = await api.getUID(args[1]);
            } else if (args.join().includes("@")) {
                // Way 3: Mention or full name
                // 3a: Direct Facebook mention
                targetID = Object.keys(event.mentions || {})[0];
                if (!targetID) {
                    // 3b: Full name detection
                    targetID = await getUIDByFullName(api, event.threadID, args.slice(1).join(" "));
                }
            } else {
                // Direct UID
                targetID = args[1];
            }
        } else {
            // No target specified - use sender's own ID
            targetID = event.senderID;
        }
        
        if (!targetID) {
            return api.sendMessage("❌ Could not detect the user. Usage: ckbot user [@mention/reply/UID/link/name]", event.threadID, event.messageID);
        }
        
        let data = await api.getUserInfo(targetID);
        let userData = data[targetID];
        
        if (!userData) {
            return api.sendMessage("❌ User not found.", event.threadID, event.messageID);
        }
        
        let url = userData.profileUrl;
        let b = userData.isFriend == false ? "No" : userData.isFriend == true ? "Yes" : "Unknown";
        let sn = userData.vanity || "Not set";
        let name = userData.name;
        var sex = userData.gender;
        var gender = sex == 2 ? "Male" : sex == 1 ? "Female" : "Unknown";
        
        var callback = () => api.sendMessage({
            body: `👤 User Information:\n` +
                  `Name: ${name}\n` +
                  `Profile URL: ${url}\n` +
                  `Username: ${sn}\n` +
                  `UID: ${targetID}\n` +
                  `Gender: ${gender}\n` +
                  `Friend with bot: ${b}`,
            attachment: fs.createReadStream(__dirname + "/cache/1.png")
        }, event.threadID, () => fs.unlinkSync(__dirname + "/cache/1.png"), event.messageID); 
        
        return request(encodeURI(`https://graph.facebook.com/${targetID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`))
            .pipe(fs.createWriteStream(__dirname+'/cache/1.png'))
            .on('close',() => callback());
    }
};
