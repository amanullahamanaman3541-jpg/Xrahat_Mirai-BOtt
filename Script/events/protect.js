const fs = require("fs");
const path = require("path");

const protectFile = path.join(__dirname, "rx", "protect.json");

function loadProtect() {
  if (!fs.existsSync(protectFile)) return {};
  return JSON.parse(fs.readFileSync(protectFile, "utf-8"));
}

function saveProtect(data) {
  fs.writeFileSync(protectFile, JSON.stringify(data, null, 2), "utf-8");
}

module.exports.config = {
  name: "protect",
  eventType: ["log:thread-name", "log:thread-icon", "log:thread-image"],
  version: "2.5.0",
  credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
  description: "Manual + Auto-save group protection"
};

// 🚀 Run on bot start → auto-save all groups
module.exports.run = async function({ api }) {
  try {
    const allThreads = await api.getThreadList(100, null, ["INBOX"]); // fetch top 100 threads
    const protect = loadProtect();

    for (let thread of allThreads) {
      if (!protect[thread.threadID]) {
        protect[thread.threadID] = {
          name: thread.name || null,
          emoji: thread.emoji || null
        };
      }
    }

    saveProtect(protect);
    console.log("🛡️ Protect system active & groups auto-saved.");
  } catch (err) {
    console.error("❌ Auto-save error:", err);
  }
};

// ⚡ Event handler
module.exports.runEvent = async function({ event, api }) {
  try {
    const protect = loadProtect();
    const threadID = event.threadID;

    if (!protect[threadID]) return; // ignore if thread not in JSON

    const info = protect[threadID];
    const threadInfo = await api.getThreadInfo(threadID);
    const isAdmin = threadInfo.adminIDs.some(adm => adm.id == event.author);

    if (isAdmin) return; // admin allowed

    // ❌ Non-admin → restore if custom value exists
    if (event.logMessageType === "log:thread-name" && info.name) {
      await api.setTitle(info.name, threadID);
      await api.sendMessage(`⚠️একটা আবাল গুপের নাম পরিবর্তন করার চেষ্টা করছে🤣\nআমি থাকতে কীভাবে পরিবর্তন করবি😝`, threadID);
    } 
    else if (event.logMessageType === "log:thread-icon" && info.emoji) {
      await api.changeThreadEmoji(info.emoji, threadID);
      await api.sendMessage("⚠️আমি থাকতে গ্রুপের ইমোজি পরিবর্তন করতে পারবি না🐸\n🩷 This group is protected", threadID);
    } 
    else if (event.logMessageType === "log:thread-image") {
      const pathImg = path.join(__dirname, "rx", "cache", threadID + ".png");
      if (fs.existsSync(pathImg)) {
        await api.changeGroupImage(fs.createReadStream(pathImg), threadID);
      }
      await api.sendMessage("⚠️গ্রুপ ছবির পরিবর্তন করতে পারবি না\n🩷 This group is protected", threadID);
    }

  } catch (err) {
    console.error("[Protect Event Error]", err);
  }
};
