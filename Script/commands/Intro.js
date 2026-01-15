const axios = require("axios");
const request = require("request");
const fs = require("fs-extra");
const moment = require("moment-timezone");

module.exports.config = {
 name: "intro",
 version: "1.0.0",
 hasPermssion: 0,
 credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
 description: "Show  Info",
 commandCategory: "info",
 usages: "info",
 cooldowns: 2
};

module.exports.run = async function({ api, event }) {
 const time = moment().tz("Asia/Dhaka").format("DD/MM/YYYY hh:mm:ss A");

 const callback = () => api.sendMessage({
 body: `
┏━━━━━━━━━━━━━━━━━━┓
┃   🌟 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢 🌟    
┣━━━━━━━━━━━━━━━━━━┫
┃👤 𝗡𝗔𝗠𝗘      : 𝗥𝗔𝗛𝗔𝗧
┃🚹 𝗚𝗘𝗡𝗗𝗘𝗥    : 𝗠𝗔𝗟𝗘
┃🎂 𝗔𝗚𝗘       : 16
┃🕌 𝗥𝗘𝗟𝗜𝗚𝗜𝗢𝗡 : 𝗜𝗦𝗟𝗔𝗠
┃🏫 𝗘𝗗𝗨𝗖𝗔𝗧𝗜𝗢𝗡 : বয়ড়া ইসরাইল 
┃🏡 𝗔𝗗𝗗𝗥𝗘𝗦𝗦 : জামালপুর, বাংলাদেশ 
┣━━━━━━━━━━━━━━━━━━┫
┃𝗧𝗜𝗞𝗧𝗢𝗞 : @where.is.she15
┃📢 𝗧𝗘𝗟𝗘𝗚𝗥𝗔𝗠 : আছে 🥴🤪
┃🌐 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞 : বায়ো-তে আছে
┣━━━━━━━━━━━━━━━━━━┫
┃ 🕒 𝗨𝗣𝗗𝗔𝗧𝗘𝗗 𝗧𝗜𝗠𝗘: ${time}
┗━━━━━━━━━━━━━━━━━━┛ `,
 attachment: fs.createReadStream(__dirname + "/cache/owner.jpg")
 }, event.threadID, () => fs.unlinkSync(__dirname + "/cache/owner.jpg"));

 return request("https://i.imgur.com/FJI61jS.jpeg")
 .pipe(fs.createWriteStream(__dirname + '/cache/owner.jpg'))
 .on('close', () => callback());
};
