module.exports.config = {
    name: "ban",
    version: "8.0.0",
    hasPermssion: 2,
    credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
    description: "Global + Manual Ban System",
    commandCategory: "system",
    usages: "-ban on/off | -ban uid | -ban list",
    cooldowns: 0
};

module.exports.run = async ({ event, api, Users, args }) => {
    const { threadID, messageID } = event;

    // ================= GLOBAL BAN ON =================
    if (args[0] === "on") {
        global.data.globalBan = true;
        return api.sendMessage(
            "🚫 GLOBAL BAN ON\nসব UID এখন ব্যান!",
            threadID,
            messageID
        );
    }

    // ================= GLOBAL BAN OFF =================
    if (args[0] === "off" && !args[1]) {
        global.data.globalBan = false;
        return api.sendMessage(
            "✅ GLOBAL BAN OFF\nসব UID এখন আনব্যান!",
            threadID,
            messageID
        );
    }

    // ================= UNBAN SPECIFIC UID =================
    if (args[0] === "off" && args[1]) {
        const uid = args[1];

        let data = (await Users.getData(uid)).data || {};
        data.banned = 0;

        await Users.setData(uid, { data });
        global.data.userBanned.delete(uid);

        const name = await Users.getNameUser(uid);

        return api.sendMessage(
            `🔓 USER UNBANNED\n👤 ${name}\n🆔 ${uid}`,
            threadID,
            messageID
        );
    }

    // ================= BAN LIST =================
    if (args[0] === "list") {
        const banned = Array.from(global.data.userBanned.entries());

        if (banned.length === 0)
            return api.sendMessage("❎ কোনো manual ban নাই!", threadID, messageID);

        let msg = "📌 MANUAL BANNED USERS\n\n";
        let i = 1;

        for (const [uid] of banned) {
            const name = await Users.getNameUser(uid);
            msg += `${i}. 👤 ${name}\n🆔 ${uid}\n\n`;
            i++;
        }

        msg += "👉 Unban করতে চাইলে এই মেসেজে রিপ্লাই দিয়ে নাম্বার লেখো";

        return api.sendMessage(msg, threadID, (err, info) => {
            global.client.handleReply.push({
                name: "ban",
                messageID: info.messageID,
                author: event.senderID,
                banned
            });
        });
    }

    // ================= MANUAL BAN =================
    let targetID;

    if (Object.keys(event.mentions).length > 0)
        targetID = Object.keys(event.mentions)[0];
    else if (event.type === "message_reply")
        targetID = event.messageReply.senderID;
    else if (args[0])
        targetID = args[0];
    else
        return api.sendMessage(
            "❌ UID / mention / reply দাও!",
            threadID,
            messageID
        );

    let data = (await Users.getData(targetID)).data || {};

    data.banned = 1;
    data.reason = "Manual BAN";
    data.dateAdded = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Dhaka"
    });

    await Users.setData(targetID, { data });

    global.data.userBanned.set(targetID, {
        reason: data.reason,
        dateAdded: data.dateAdded
    });

    const name = await Users.getNameUser(targetID);

    return api.sendMessage(
        `🚫 USER BANNED\n👤 ${name}\n🆔 ${targetID}`,
        threadID,
        messageID
    );
};

// ================= HANDLE REPLY (UNBAN FROM LIST) =================
module.exports.handleReply = async ({ event, api, Users, handleReply }) => {
    if (event.senderID != handleReply.author) return;

    const index = parseInt(event.body);
    if (isNaN(index)) return;

    const user = handleReply.banned[index - 1];
    if (!user)
        return api.sendMessage("❌ ভুল নাম্বার!", event.threadID);

    const uid = user[0];

    let data = (await Users.getData(uid)).data || {};
    data.banned = 0;

    await Users.setData(uid, { data });
    global.data.userBanned.delete(uid);

    const name = await Users.getNameUser(uid);

    return api.sendMessage(
        `🔓 USER UNBANNED\n👤 ${name}\n🆔 ${uid}`,
        event.threadID
    );
};
