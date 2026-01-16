const { join } = require('path');
const { writeFileSync, existsSync, createReadStream } = require('fs-extra');
const moment = require("moment-timezone");
const axios = require('axios')

module.exports.config = {
    name: "dating",
    version: "1.2.0",
    hasPermssion: 0,
    credits: "🔰𝐑𝐀𝐇𝐀𝐓 𝐈𝐒𝐋𝐀𝐌🔰",
    description: "Hẹn hò qua messenger with multiple mention detection",
    commandCategory: "game",
    usages: "[shop/info/breakup/daily/propose] [@mention/reply/UID/link/name]",
    cooldowns: 0
};

const _1DAY = 1000 * 60 * 60 * 24;

const thinh = ["Chocolate đắng đầu lưỡi nhưng ngọt ở cuống họng, như tình yêu em dành cho anh.", "Bên em thôi, đừng bên ai. Yêu em thôi, đừng thêm ai.", "Như lon coca mùa hè, hạt cacao mùa đông. Em đến bên anh thật nhanh và đúng lúc.", "Một cách đơn giản để hạnh phúc là tôn trọng những gì mình đang có.", "Khi yêu ai đó cách mà người ấy gọi tên bạn cũng khiến bạn mỉm cười hạnh phúc.", "Tình yêu không phải là những lời thề non hẹn biển, chỉ đơn giản là cùng nhau bình yên qua ngày.", "Muốn hạnh phúc trong tình yêu hãy cho đi nhiều hơn, hãy tha thứ, hãy thông cảm, và hãy yêu thương nhiều hơn.", "Em không cần một tình yêu quá lớn, nhưng em cần một tình yêu vừa đủ… để em cảm thấy an tâm.", "Yêu chính là muốn ở cạnh người đó không rời dù chỉ một phút một giây.", "Trăng dưới nước là trăng ngụ trên trời. Người đứng trước mặt là người ngụ ở trong tim.", "Chỉ cần chúng ta yêu ai đó bằng cả trái tim thì đó luôn được gọi là mối tình đầu.", "Nếu phải lựa chọn giữa việc yêu em và không khí để thở. Anh sẽ dùng hơi thở cuối cùng để nói lời yêu em.", "Anh thà làm một hồn ma, ở bên em như một linh hồn vất vưởng còn hơn là lên thiên đàng mà không có em.", "Mỗi ngày thức dậy anh được nghĩ đến em, khi đi ngủ anh có thể mơ về em đối với anh đó là 1 ngày trọn vẹn!", "Tình yêu giống như thiên đường, nhưng nỗi đau nó gây ra thì như địa ngục vậy.", "Đừng vì quá cô đơn mà nắm nhầm 1 bàn tay. Đừng vì quá lạnh mà vội ôm 1 bờ vai", "Sâu thẳm như mối tình đầu và điên cuồng bằng tất cả niềm nuối tiếc.", "Hãy chọn một kết thúc buồn thay vì một nỗi buồn không bao giờ kết thúc.", "Nếu mọi nỗi đau đều có thể quyên đi, thì đâu tồn tại làm gì cái thứ gọi là nước mắt…"];

const TextForHouse = ["Gia đình là điều quan trọng nhất trên thế giới này","Nhà là nơi để trở về","Nhà không cần quá lớn, miễn là trong đó có đủ yêu thương.","Gia đình – đó là nơi bình yên và an toàn nhất trong cuộc đời.","Gia đình là nơi mà khi nghĩ về bạn thấy tâm hồn mình thật bình yên…","Gia đình là nơi cuộc sống bắt đầu và tình yêu không bao giờ kết thúc.","Nhà không phải nơi trú ẩn tạm thời: điều cốt lõi của nó nằm trong tính cách của những người sống trong đó.","Bạn được sinh ra từ gia đình của mình và gia đình được sinh ra từ trong bạn. Không mưu cầu. Không đổi chác.","Yêu thương gia đình nhiều nhất bạn có thể vì đó là điều tuyệt vời nhất mà thượng đế ban tặng cho mỗi người.","Hãy dành thời gian cho gia đình ngay cả khi bạn không hề biết điều gì đã và đang xảy đến với cuộc đời của mình.","Điểm tựa quan trọng nhất trong cuộc đời bạn luôn là gia đình dù bạn có muốn thừa nhận hay không . Đó vẫn là sự thật.","Gia đình là duy nhất trên cuộc đời mà không gì có thể thay thế được, và cho dù bạn có đi bất cứ nơi đâu thì đây also là nơi duy nhất chờ mong bạn trở về."];

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

// Helper: Get UID from Facebook link
async function getUIDFromLink(link, api) {
    if (link.includes("facebook.com") || link.includes("fb.com")) {
        try {
            return await api.getUID(link);
        } catch {
            return null;
        }
    }
    return null;
}

module.exports.onLoad = function () {
    const path = join(__dirname, 'game', 'dating.json');
    if (!existsSync(path)) { 
        writeFileSync(path, JSON.stringify([], null, 4)) 
    }
    const dataDating = require('./game/dating.json');

    //UPDATE JSON FOR VERSION 1.1.0
    for (let user of dataDating) {
        if (user.data && user.data.pet) {
            for (let pet of user.data.pet) {
                if (!pet.health) pet.health = 'good';
            }
        }
    }
    writeFileSync(path, JSON.stringify(dataDating, null, 4));

    const get_day_of_time = (d1, d2) => {
        let ms1 = d1.getTime();
        let ms2 = d2.getTime();
        return Math.ceil((ms2 - ms1) / (24 * 60 * 60 * 1000));
    };
    
    setInterval(function () {
        for (let i of dataDating) {
            if (dataDating.length == 0) continue;
            let dayStart = new Date(i.data.timestamp);
            let today = new Date();
            let time = get_day_of_time(dayStart, today);
            i.data.countDays = time;
            //pet check
            if (i.data.pet && i.data.pet.length > 0 && i.data.petLastFeed) {
                if (Date.now() - i.data.petLastFeed > (_1DAY * 2)) {
                    i.data.pet = [];
                    delete i.data.petLastFeed;
                }
                for (pet of i.data.pet) {
                    if (!pet.timeHealtStartBeingBad) continue;
                    if (Date.now() - pet.timeHealtStartBeingBad > (_1DAY * 3)) {
                        delete pet.timeHealtStartBeingBad;
                    }
                }
            }
            writeFileSync(path, JSON.stringify(dataDating, null, 4));
        }
    }, 1000);

    setInterval(() => {
        for (let i of dataDating) {
            if (!i.data.pet) continue;
            for (const petData of i.data.pet) {
                if (Math.random() > 0.7) {
                    if (petData.health == 'good') {
                        petData.health = 'normal';
                    } else {
                        petData.health = 'bad';
                        petData.timeHealtStartBeingBad = Date.now();
                    }
                }
            }
            writeFileSync(path, JSON.stringify(dataDating, null, 4));
        }
    }, 4 * 60 * 60 * 1000);
}

function msgBreakup() {
    var msg = ['Thật sự 2 người không thể làm lành được sao?', 'Cứ như vậy mà buông tay nhau?', 'Không đau sao? Có chứ? Vậy sao còn muốn buông?', 'Vì một lí do nào đó... 2 người có thể cố gắng được không? ^^', 'Tình yêu là khi hai người quan tâm, chăm sóc lẫn nhau. Bây giờ cả 2 bạn đã hiều điều gì đã xảy ra, 2 bạn có thể quay về bên nhau được không', 'Giận để biết yêu nhau nhiều hơn phải không, cả 2 làm lành nhé vì khi giận nhau mới biết đối phương không thể sống thiếu nhau']
    return msg[Math.floor(Math.random() * msg.length)];
}

function getMsg() {
    return `𝐌𝐨̣𝐢 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐜𝐮̀𝐧𝐠 𝐭𝐨̛́𝐢 𝐜𝐡𝐮́𝐜 𝐦𝐮̛̀𝐧𝐠 𝐡𝐚̣𝐧𝐡 𝐩𝐡𝐮́𝐜 𝐜𝐡𝐨 𝟐 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐧𝐚̀𝐲 𝐧𝐚̀𝐨 🥰\n\𝐋𝐮̛𝐮 𝐘́:\n- 𝐂𝐚̉ 𝟐 𝐛𝐚̣𝐧 𝐬𝐞̃ 𝐤𝐡𝐨̂𝐧𝐠 𝐭𝐡𝐞̂̉ 𝐜𝐡𝐢𝐚 𝐭𝐚𝐲 𝐭𝐫𝐨𝐧𝐠 𝐯𝐨̀𝐧𝐠 𝟕 𝐧𝐠𝐚̀𝐲 𝐤𝐞̂̉ 𝐭𝐮̛̀ 𝐤𝐡𝐢 𝐲𝐞̂𝐮 𝐧𝐡𝐚𝐮\n- 𝐂𝐮𝐨̂́𝐢 𝐜𝐮̀𝐧𝐠 𝐜𝐡𝐮́𝐜 𝐜𝐚̉ 𝟐 𝐛𝐚̣𝐧 𝐜𝐨́ 𝐧𝐡𝐢𝐞̂̀𝐮 𝐧𝐢𝐞̂̀𝐦 𝐡𝐚̣𝐧𝐡 𝐩𝐡𝐮́𝐜 𝐤𝐡𝐢 𝐨̛̉ 𝐛𝐞̂𝐧 𝐧𝐡𝐚𝐮, 𝐜𝐚̉𝐦 𝐨̛𝐧 𝐯𝐢̀ 𝐭𝐢𝐧 𝐭𝐮̛𝐨̛̉𝐧𝐠 𝐯𝐚̀ 𝐬𝐮̛̉ 𝐝𝐮̣𝐧𝐠 𝐛𝐨𝐭 𝐜𝐮̉𝐚 𝐦𝐢̀𝐧𝐡\n- 𝐊𝐲́ 𝐭𝐞̂𝐧: 𝑵𝒈𝒖𝒚𝒆̂̃𝒏 𝑷𝒉𝒂̣𝒎 𝑴𝒊𝒏𝒉 𝑻𝒖𝒂̂́𝒏 ❤️`
}

module.exports.run = async function ({ api, event, args, Users, Currencies }) {
    const { threadID, messageID, senderID } = event;
    const dataDating = require('./game/dating.json');
    const type = (args[0] || 'false').toLowerCase();
    const input = type
        .replace('nữ', 1)
        .replace('gái', 1)
        .replace('nam', 2)
        .replace('trai', 2)
        .replace('breakup', 3)
        .replace('chiatay', 3)
        .replace('ct', 3)
        .replace('info', 4)
        .replace('-i', 4)
        .replace('shop', 5)
        .replace('-s', 5)
        .replace('daily', 6)
        .replace('diemdanh', 6)
        .replace('top', 7)
        .replace('rank', 7)
        .replace('-r', 7)
        .replace('-t', 7)
        .replace('house', 8)
        .replace('-h', 8)
        .replace('pet', 9)
        .replace('-p', 9)
        .replace('exchange', 10)
        .replace('-e', 10)
        .replace('propose', 11)
        .replace('-p', 11)
        .replace('invite', 11)
        .replace('ask', 11)

    const dataUser = await Users.getData(senderID)
    const author = dataDating.find(i => i.ID_one == senderID || i.ID_two == senderID);
    
    // ===== New: PROPOSE with multiple mention detection =====
    if (input == 11) {
        const { money } = await Currencies.getData(senderID);
        if (money < 2000) return api.sendMessage(`𝐁𝐚̣𝐧 𝐜𝐚̂̀𝐧 𝟐𝟎𝟎𝟎 𝐕𝐍𝐃 𝐭𝐢𝐞̂̀𝐧 𝐩𝐡𝐢́ 𝐦𝐮𝐚 𝐧𝐡𝐚̂̃𝐧 𝐏𝐍𝐉 𝐭𝐚̣̆𝐧𝐠 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐝𝐚𝐭𝐢𝐧𝐠 𝐯𝐨̛́𝐢 𝐛𝐚̣𝐧 💍`, threadID, messageID);
        
        if (author && author.status == true) return api.sendMessage(`𝐁𝐚̣𝐧 đ𝐚̃ 𝐜𝐨́ 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐲𝐞̂𝐮 𝐫𝐨̂̀𝐢 𝐤𝐡𝐨̂𝐧𝐠 𝐭𝐡𝐞̂̉ 𝐩𝐫𝐨𝐩𝐨𝐬𝐞 𝐭𝐡𝐞̂𝐦 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐤𝐡𝐚́𝐜!`, threadID, messageID);
        
        let targetID = null;
        let targetName = "Người ấy";
        
        // ===== Determine targetID in three ways =====
        if (event.type === "message_reply") {
            // Way 1: Reply to a message
            targetID = event.messageReply.senderID;
        } else if (args[1]) {
            const targetArg = args.slice(1).join(" ");
            
            if (targetArg.includes(".com/")) {
                // Way 2: Facebook profile link
                targetID = await getUIDFromLink(targetArg, api);
            } else if (targetArg.includes("@")) {
                // Way 3: Mention or full name
                // 3a: Direct Facebook mention
                targetID = Object.keys(event.mentions || {})[0];
                if (!targetID) {
                    // 3b: Full name detection
                    targetID = await getUIDByFullName(api, threadID, targetArg);
                }
            } else {
                // Direct UID
                targetID = targetArg;
            }
        } else {
            return api.sendMessage(
                "❌📝type\n" +
                "• dating propose @mention\n" +
                "• dating propose (uid)\n" +
                "• dating propose https://facebook.com/username",
                threadID, messageID
            );
        }
        
        if (!targetID || isNaN(targetID)) {
            return api.sendMessage("❌ 𝐊𝐡𝐨̂𝐧𝐠 𝐭𝐡𝐞̂̉ 𝐱𝐚́𝐜 đ𝐢̣𝐧𝐡 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐧𝐚̀𝐲. 𝐕𝐮𝐢 𝐥𝐨̀𝐧𝐠 𝐭𝐡𝐮̛̉ 𝐥𝐚̣𝐢!", threadID, messageID);
        }
        
        // Check if target is already in a relationship
        const targetInRelationship = dataDating.find(i => (i.ID_one == targetID || i.ID_two == targetID) && i.status == true);
        if (targetInRelationship) {
            return api.sendMessage(`😔 𝐍𝐠𝐮̛𝐨̛̀𝐢 𝐧𝐚̀𝐲 đ𝐚̃ 𝐜𝐨́ 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐲𝐞̂𝐮 𝐫𝐨̂̀𝐢!`, threadID, messageID);
        }
        
        // Check if trying to propose to self
        if (targetID == senderID) {
            return api.sendMessage("💝 𝐓𝐮̛̣ 𝐲𝐞̂𝐮 𝐛𝐚̉𝐧 𝐭𝐡𝐚̂𝐧 𝐥𝐚̀ 𝐪𝐮𝐚𝐧 𝐭𝐫𝐨̣𝐧𝐠, 𝐧𝐡𝐮̛𝐧𝐠 𝐡𝐚̃𝐲 𝐭𝐢̀𝐦 𝐦𝐨̣̂𝐭 𝐧𝐮̛̉𝐚 𝐤𝐢𝐚 𝐧𝐡𝐞́! 😊", threadID, messageID);
        }
        
        // Get target name
        try {
            const targetInfo = await Users.getData(targetID);
            targetName = targetInfo.name || "Người ấy";
        } catch (error) {
            console.error("Error getting target info:", error);
        }
        
        const senderName = dataUser.name;
        
        return api.sendMessage(
            `💝 𝐏𝐑𝐎𝐏𝐎𝐒𝐀𝐋 𝐓𝐈𝐌𝐄 💝\n\n` +
            `🎯 ${senderName} đã mời ${targetName} hẹn hò!\n` +
            `💌 Tỉ lệ hợp nhau: ${Math.floor(Math.random() * (80 - 30) + 30)}%\n` +
            `💵 Phí nhẫn PNJ: 2000 VNĐ (đã trừ từ tài khoản ${senderName})\n\n` +
            `𝐍𝐞̂́𝐮 𝐜𝐚̉ 𝟐 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐜𝐡𝐚̂́𝐩 𝐧𝐡𝐚̣̂𝐧 𝐡𝐞̣𝐧 𝐡𝐨̀, 𝐡𝐚̃𝐲 𝐜𝐮̀𝐧𝐠 𝐧𝐡𝐚𝐮 𝐭𝐡𝐚̉ 𝐜𝐚̉𝐦 𝐱𝐮́𝐜 𝐭𝐫𝐚́𝐢 𝐭𝐢𝐦 [❤] 𝐯𝐚̀𝐨 𝐭𝐢𝐧 𝐧𝐡𝐚̆́𝐧 𝐧𝐚̀𝐲!`,
            threadID, 
            async (error, info) => {
                // Deduct money
                await Currencies.setData(senderID, { money: money - 2000 });
                
                global.client.handleReaction.push({
                    name: this.config.name,
                    messageID: info.messageID,
                    senderID: senderID,
                    type: "propose",
                    author: {
                        ID: senderID,
                        name: senderName,
                        accept: false
                    },
                    love: {
                        ID: targetID,
                        name: targetName,
                        accept: false
                    }
                });
            },
            messageID
        );
    }
    
    switch (input) {
        case '1': {
            if (author == undefined) break
            if (author.status == true) return api.sendMessage(`𝐌𝐮𝐨̂́𝐧 𝐜𝐚̆́𝐦 𝐬𝐮̛̀𝐧𝐠 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐭𝐚 𝐡𝐚𝐲 𝐬𝐚𝐨 ?, 𝐡𝐚̃𝐲 𝐥𝐚̀𝐦 𝐦𝐨̣̂𝐭 𝐜𝐨𝐧 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐜𝐨́ 𝐭𝐫𝐚́𝐜𝐡 𝐧𝐡𝐢𝐞̣̂𝐦 𝐧𝐚̀𝐨. 𝐁𝐚̣𝐧 𝐡𝐢𝐞̣̂𝐧 𝐨̛̉ 𝐭𝐫𝐚̣𝐧𝐠 𝐭𝐡𝐚́𝐢 𝐃𝐚𝐭𝐢𝐧𝐠 𝐫𝐨̂̀𝐢 𝐜𝐨̀𝐧 𝐦𝐮𝐨̂́𝐧 𝐤𝐢𝐞̂́𝐦 𝐭𝐡𝐞̂𝐦 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐤𝐡𝐚́𝐜 𝐚̀ 😈`, threadID, messageID);
            break;
        }
        case '2': {
            if (author == undefined) break
            if (author.status == true) return api.sendMessage(`𝐌𝐮𝐨̂́𝐧 𝐜𝐚̆́𝐦 𝐬𝐮̛̀𝐧𝐠 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐭𝐚 𝐡𝐚𝐲 𝐬𝐚𝐨 ?, 𝐡𝐚̃𝐲 𝐥𝐚̀𝐦 𝐦𝐨̣̂𝐭 𝐜𝐨𝐧 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐜𝐨́ 𝐭𝐫𝐚́𝐜𝐡 𝐧𝐡𝐢𝐞̣̂𝐦 𝐧𝐚̀𝐨. 𝐁𝐚̣𝐧 𝐡𝐢𝐞̣̂𝐧 𝐨̛̉ 𝐭𝐫𝐚̣𝐧𝐠 𝐭𝐡𝐚́𝐢 𝐃𝐚𝐭𝐢𝐧𝐠 𝐫𝐨̂̀𝐢 𝐜𝐨̀𝐧 𝐦𝐮𝐨̂́𝐧 𝐤𝐢𝐞̂́𝐦 𝐭𝐡𝐞̂𝐦 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐤𝐡𝐚́𝐜 𝐚̀ 😈`, threadID, messageID);
            break;
        }
        case '3': {
            if (author == undefined || author.status == false) return api.sendMessage(`𝐁𝐚̣𝐧 𝐜𝐡𝐮̛𝐚 𝐡𝐞̣𝐧 𝐡𝐨̀ 𝐯𝐨̛́𝐢 𝐚𝐢 𝐭𝐡𝐢̀ 𝐜𝐡𝐢𝐚 𝐭𝐚𝐲 𝐜𝐚́𝐢 𝐠𝐢̀ ?`, threadID, messageID);
            if (author.data.countDays < 3) return api.sendMessage(`𝐂𝐨̀𝐧 𝐜𝐡𝐮̛𝐚 𝐭𝐨̛́𝐢 3 𝐧𝐠𝐚̀𝐲 𝐦𝐚̀ 𝐦𝐮𝐨̂́𝐧 𝐜𝐡𝐢𝐚 𝐭𝐚𝐲 𝐥𝐚̀ 𝐬𝐚𝐨? 🥺\n\n${msgBreakup()}\n\n𝐇𝐚̃𝐲 𝐜𝐮̛́ 𝐛𝐢̀𝐧𝐡 𝐭𝐢̃𝐧𝐡 𝐬𝐮𝐲 𝐧𝐠𝐡𝐢̃, 𝐜𝐡𝐨 𝐦𝐨̣𝐢 𝐜𝐡𝐮𝐲𝐞̣̂𝐧 𝐝𝐚̂̀𝐧 𝐥𝐚̆́𝐧𝐠 𝐱𝐮𝐨̂́𝐧𝐠 𝐫𝐨̂̀𝐢 𝐠𝐢𝐚̉𝐢 𝐪𝐮𝐲𝐞̂́𝐭 𝐜𝐮̀𝐧𝐠 𝐧𝐡𝐚𝐮 𝐧𝐡𝐞́ 𝐯𝐢̀ 𝐭𝐢̀𝐧𝐡 𝐲𝐞̂𝐮 𝐤𝐡𝐨̂𝐧𝐠 𝐩𝐡𝐚̉𝐢 𝐚𝐢 𝐜𝐮̃𝐧𝐠 𝐦𝐚𝐲 𝐦𝐚̆́𝐧 𝐭𝐢̀𝐦 𝐭𝐡𝐚̂́𝐲 𝐧𝐡𝐚𝐮 𝐦𝐚̀ ^^`, threadID, messageID);
            return api.sendMessage(`𝐂𝐚̉ 𝟐 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐭𝐡𝐚̣̂𝐭 𝐬𝐮̛̣ 𝐤𝐡𝐨̂𝐧𝐠 𝐭𝐡𝐞̂̉ 𝐭𝐢𝐞̂́𝐩 𝐭𝐮̣𝐜 𝐧𝐮̛̃𝐚 𝐡𝐚𝐲 𝐬𝐚𝐨 ?\n𝐂𝐡𝐨 𝐛𝐨𝐭 𝐱𝐢𝐧 𝐩𝐡𝐞́𝐩 𝐱𝐞𝐧 𝐯𝐚̀𝐨 𝐦𝐨̣̂𝐭 𝐜𝐡𝐮́𝐭 𝐧𝐡𝐞́:\n\n${msgBreakup()}\n\n𝐍𝐞̂́𝐮 𝐜𝐨́ 𝐱𝐞𝐦 𝐭𝐡𝐚̂́𝐲 𝐝𝐨̀𝐧𝐠 𝐭𝐢𝐧 𝐧𝐡𝐚̆́𝐧 𝐧𝐚̀𝐲, 𝐡𝐚̃𝐲 𝐜𝐮̛́ 𝐜𝐡𝐨 𝐦𝐨̣𝐢 𝐜𝐡𝐮𝐲𝐞̣̂𝐧 𝐥𝐚̆́𝐧𝐠 𝐱𝐮𝐨̂́𝐧𝐠...𝐘𝐞̂𝐧 𝐥𝐚̣̆𝐧𝐠 𝐦𝐨̣̂𝐭 𝐜𝐡𝐮́𝐭, 𝐬𝐮𝐲 𝐧𝐠𝐡𝐢̃ 𝐜𝐡𝐨 𝐤𝐢̃ 𝐧𝐚̀𝐨...\n𝐂𝐨́ 𝐧𝐡𝐢𝐞̂̀𝐮 𝐭𝐡𝐮̛́...𝐌𝐨̣̂𝐭 𝐤𝐡𝐢 𝐦𝐚̂́𝐭 đ𝐢 𝐭𝐡𝐢̀ 𝐬𝐞̃ 𝐤𝐡𝐨̂𝐧𝐠 𝐭𝐡𝐞̂̉ 𝐭𝐢̀𝐦 𝐥𝐚̣𝐢 𝐧𝐮̛̃𝐚. ^^\n\n𝐂𝐨̀𝐧 𝐧𝐞̂́𝐮...𝐕𝐚̂̃𝐧 𝐤𝐡𝐨̂𝐧𝐠 𝐭𝐡𝐞̂̉ 𝐭𝐢𝐞̂́𝐩 𝐭𝐮̣𝐜 𝐜𝐮̀𝐧𝐠 𝐧𝐡𝐚𝐮 𝐧𝐮̛̃𝐚...𝐂𝐚̉ 𝟐 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐡𝐚̃𝐲 𝐭𝐡𝐚̉ 𝐜𝐚̉𝐦 𝐱𝐮́𝐜 𝐯𝐚̀𝐨 𝐭𝐢𝐧 𝐧𝐡𝐚̆́𝐧 𝐧𝐚̀𝐲 𝐧𝐡𝐞́ !`, threadID, (error, info) => {
                global.client.handleReaction.push({
                    name: this.config.name,
                    messageID: info.messageID,
                    senderID: senderID,
                    type: input,
                    data: {
                        ID_one: author.ID_one,
                        accept_one: false,
                        ID_two: author.ID_two,
                        accept_two: false
                    }
                });
            }, messageID);
        }
        case '4': {
            if (author == undefined || author.status == false) return api.sendMessage(`𝐁𝐚̣𝐧 𝐅.𝐀 𝐬𝐦𝐥 𝐫𝐚 𝐦𝐚̀ 𝐱𝐞𝐦 𝐢𝐧𝐟𝐨 𝐜𝐚́𝐢 𝐠𝐢̀ 𝐳𝐚̣̂𝐲 𝐡𝐮̛̉ ?`, threadID, messageID);
            const your_name = author.ID_one == senderID ? author.name_one : author.name_two;
            const partner_name = author.ID_two == senderID ? author.name_one : author.name_two;
            var msg = `💓==『 𝐁𝐞𝐞𝐧 𝐓𝐨𝐠𝐞𝐭𝐡𝐞𝐫 』==💓\n\n` + `» ❤️ 𝗧𝗲̂𝗻 𝗰𝘂̉𝗮 𝗯𝗮̣𝗻: ${your_name}\n` + `» 🤍 𝗧𝗲̂𝗻 𝗰𝘂̉𝗮 𝗻𝗴𝘂̛𝗼̛̀𝗶 𝗮̂́𝘆: ${partner_name}\n` + `» 💌 𝗛𝗲̣𝗻 𝗵𝗼̀ 𝘃𝗮̀𝗼 𝗹𝘂́𝗰: \n${author.data.days}\n` + `» 📆 𝗬𝗲̂𝘂 𝗻𝗵𝗮𝘂: ${author.data.countDays} 𝗻𝗴𝗮̀𝘆\n` + `» 🎁 𝗘𝘅𝗽 𝘁𝗵𝗮̂𝗻 𝗺𝗮̣̂𝘁: ${author.data.point} 𝗲𝘅𝗽\n` + `» 🎐 𝗫𝗲̂́𝗽 𝗵𝗮̣𝗻𝗴: ${getRank(senderID)}\n` + `──────────────\n` + `» 💘 𝗖𝗵𝗮̂𝗺 𝗻𝗴𝗼̂𝗻 𝘁𝗶̀𝗻𝗵 𝘆𝗲̂𝘂: ${thinh[Math.floor(Math.random() * thinh.length)]}`;
            return api.sendMessage({ body: msg, attachment: await this.canvas(author.ID_two, author.ID_one, 1) }, threadID, messageID);
        }
        case '5': {
            if (author == undefined || author.status == false) return api.sendMessage(`𝐁𝐚̣𝐧 𝐅.𝐀 𝐬𝐦𝐥 𝐫𝐚 𝐦𝐚̀ 𝗺𝘂𝗮 𝐜𝐚́𝐢 𝐠𝐢̀ 𝐳𝐚̣̂𝐲 𝐡𝐮̛̉ ?`, threadID, messageID);
            var shop = [
                { name: 'Hoa', point: 10, money: 1000 },
                { name: 'Nhẫn', point: 20, money: 2000 },
                { name: 'Socola', point: 30, money: 3000 },
                { name: 'Mỹ phẩm', point: 40, money: 4000 },
                { name: 'Vé xem phim', point: 50, money: 5500 },
                { name: 'Sextoy', point: 100, money: 10000 }
            ]
            return api.sendMessage({
                body: "== 𝐒𝐖𝐄𝐄𝐓 𝐋𝐎𝐕𝐄 𝐒𝐇𝐎𝐏 ==\n\n𝟭. 𝗛𝗼𝗮 (𝟭𝟬𝟬𝟬$)\n𝟮. 𝗡𝗵𝗮̂̃𝗻 (𝟮𝟬𝟬𝟬$)\n𝟯. 𝗦𝗼𝗰𝗼𝗹𝗮 (𝟯𝟬𝟬𝟬$)\n𝟰. 𝗠𝘆̃ 𝗽𝗵𝗮̂̉𝗺 (𝟰𝟬𝟬𝟬$)\n𝟱. 𝗩𝗲́ 𝘅𝗲𝗺 𝗽𝗵𝗶𝗺 (𝟱𝟬𝟬𝟬$)\n𝟲. 𝗦𝗲𝘅𝘁𝗼𝘆 (𝟭𝟬𝟬𝟬𝟬$)\n\n\n𝐑𝐞𝐩𝐥𝐲 𝐯𝐚̀ 𝐜𝐡𝐨̣𝐧 𝐭𝐡𝐞𝐨 𝐬𝐨̂́ 𝐭𝐡𝐮̛ 𝐭𝐮̛̣",
                attachment: await this.image('https://i.imgur.com/lYLFJ8G.jpg')
            },
                threadID, (error, info) => global.client.handleReply.push({
                    type: input,
                    name: this.config.name,
                    messageID: info.messageID,
                    author: event.senderID,
                    shop,
                    data: author
                }), messageID);
        }
        case '6': {
            if (author == undefined || author.status == false) return api.sendMessage(`𝐅𝐀 𝐦𝐚̀ 𝐝𝐢𝐞𝐦𝐝𝐚𝐧𝐡 𝐜𝐚́𝐢 𝐠𝐢̀ 𝐜𝐨̛ ?`, threadID, messageID);
            if (author.data.daily != null && Date.now() - author.data.daily < 86400000)
                return api.sendMessage(`𝐇𝐨̂𝐦 𝐧𝐚𝐲 𝐜𝐚̉ 𝟐 𝐛𝐚̣𝐧 𝐝𝐢𝐞𝐦𝐝𝐚𝐧𝐡 𝐫𝐨̂̀𝐢 𝐡𝐚̃𝐲 𝐪𝐮𝐚𝐲 𝐥𝐚̣𝐢 𝐬𝐚𝐮 𝟐𝟒 𝐭𝐢𝐞̂́𝐧𝐠 𝐧𝐮̛̃𝐚 𝐧𝐡𝐞́`, threadID, messageID)
            return api.sendMessage(`𝐂𝐚̉ 𝟐 𝐜𝐮̀𝐧𝐠 𝐭𝐡𝐚̉ 𝐜𝐚̉𝐦 𝐱𝐮́𝐜 [❤] 𝐯𝐚̀𝐨 𝐭𝐢𝐧 𝐧𝐡𝐚̆́𝐧 𝐧𝐚̀𝐲 𝐯𝐚̀ 𝐜𝐮̀𝐧𝐠 𝐝𝐢𝐞𝐦𝐝𝐚𝐧𝐡 !`, threadID, (error, info) => {
                global.client.handleReaction.push({
                    name: this.config.name,
                    type: input,
                    messageID: info.messageID,
                    senderID: senderID,
                    author: author,
                    data: {
                        ID_one: author.ID_one,
                        accept_one: false,
                        ID_two: author.ID_two,
                        accept_two: false
                    }
                })
            }, messageID);
        }
        case '7': {
            if (dataDating.length == 0) return api.sendMessage('𝐂𝐡𝐮̛𝐚 𝐜𝐨́ 𝐜𝐚̣̆𝐩 𝐧𝐚̀𝐨 𝐭𝐫𝐨𝐧𝐠 𝐝𝐮̛̃ 𝐥𝐢𝐞̣̂𝐮 𝐜𝐮̉𝐚 𝐛𝐨𝐭', threadID, messageID);
            dataDating.sort(function (a, b) { return b.data.point - a.data.point });
            var msg = '️🏆=== [ 𝐓𝐎𝐏 𝐂𝐎𝐔𝐏𝐋𝐄 ] ===️🏆\n\n'
            for (let i = 0; i <= 10; i++) {
                if (dataDating[i] == undefined) continue
                msg += `${i + 1}. ${dataDating[i].name_one} 💓 ${dataDating[i].name_two}\nSố điểm: ${dataDating[i].data.point}\nSố ngày: ${dataDating[i].data.countDays}\n\n`
            }
            return api.sendMessage(msg, threadID, messageID);
        }
        case '8': {
            if (author == undefined || author.status == false) return api.sendMessage(`𝐁𝐚̣𝐧 𝐅.𝐀 𝐬𝐦𝐥 𝐫𝐚 𝐦𝐚̀ 𝗺𝘂𝗮 𝐜𝐚́𝐢 𝐠𝐢̀ 𝐳𝐚̣̂𝐲 𝐡𝐮̛̉ ?`, threadID, messageID);
            var msg = "🏚==== [ 𝐇𝐎𝐔𝐒𝐄 ] ====🏚\n\n𝟏. 𝐍𝐡𝐚̀ 𝐜𝐮̉𝐚 𝐛𝐚̣𝐧 🏡\n𝟐. 𝐍𝐚̂𝐧𝐠 𝐂𝐚̂́𝐩/𝐌𝐮𝐚 𝐧𝐡𝐚̀ 🏗\n𝟑. 𝐁𝐚́𝐧 𝐧𝐡𝐚̀ 💸\n\n𝐑𝐞𝐩𝐥𝐲 𝐯𝐚̀ 𝐜𝐡𝐨̣𝐧 𝐭𝐡𝐞𝐨 𝐬𝐨̂́ 𝐭𝐡𝐮̛́ 𝐭𝐮̛̣";
            return api.sendMessage(msg, threadID, (err, info) => {
                global.client.handleReply.push({
                    name: this.config.name,
                    type: 'house',
                    messageID: info.messageID,
                    author: senderID,
                    authorData: author
                });
            }, messageID);
        }
        case '9': {
            if (author == undefined || author.status == false) return api.sendMessage(`𝐁𝐚̣𝐧 𝐅.𝐀 𝐬𝐦𝐥 𝐫𝐚 𝐦𝐚̀ 𝗺𝘂𝗮 𝐜𝐚́𝐢 𝐠𝐢̀ 𝐳𝐚̣̂𝐲 𝐡𝐮̛̉ ?`, threadID, messageID);
            var msg = "🐰 ==== [ 𝐏𝐄𝐓 ] ==== 🐰\n\n𝟏. 𝐏𝐞𝐭 𝐜𝐮̉𝐚 𝐛𝐚̣𝐧\n𝟐. 𝐊𝐡𝐚́𝐦 𝐁𝐞̣̂𝐧𝐡\n𝟑. 𝐌𝐮𝐚 𝐏𝐞𝐭\n\n𝐑𝐞𝐩𝐥𝐲 𝐯𝐚̀ 𝐜𝐡𝐨̣𝐧 𝐭𝐡𝐞𝐨 𝐬𝐨̂́ 𝐭𝐡𝐮̛ 𝐭𝐮̛̣";
            return api.sendMessage(msg, threadID, (err, info) => {
                global.client.handleReply.push({
                    name: this.config.name,
                    type: 'pet',
                    messageID: info.messageID,
                    author: senderID,
                    authorData: author
                });
            }, messageID);
        }
        case '10': {
            if (!author) return;
            let authorPoint = author.data.point;
            var msg = `𝐁𝐚̣𝐧 𝐡𝐢𝐞̣̂𝐧 𝐜𝐨́ ${authorPoint} 𝐩𝐨𝐢𝐧𝐭, 𝐫𝐞𝐩𝐥𝐲 𝐬𝐨̂́ 𝐩𝐨𝐢𝐧𝐭 𝐛𝐚̣𝐧 𝐦𝐮𝐨̂́𝐧 𝐭𝐡𝐚̀𝐧𝐡 𝐭𝐢𝐞̂̀𝐧 𝐦𝐚̣̆𝐭 💵`;
            return api.sendMessage(msg, threadID, (err, info) => {
                global.client.handleReply.push({
                    name: this.config.name,
                    type: 'convertToMoney',
                    messageID: info.messageID,
                    authorPoint,
                    author: senderID,
                });
            }, messageID);
        }
        default:
            return api.sendMessage(`⚙️ 𝐃𝐀𝐓𝐈𝐍𝐆 𝐒𝐘𝐒𝐓𝐄𝐌 ⚙️\n\n` +
                `📋 𝐂𝐚́𝐜 𝐥𝐞̣̂𝐧𝐡 𝐜𝐨́ 𝐬𝐚̆̃𝐧:\n` +
                `• dating nam/nữ - Tìm người hẹn hò ngẫu nhiên\n` +
                `• dating propose [@tên/UID/link] - Mời người cụ thể hẹn hò\n` +
                `• dating info - Xem thông tin mối quan hệ\n` +
                `• dating shop - Mua quà tặng người yêu\n` +
                `• dating daily - Điểm danh hàng ngày\n` +
                `• dating breakup - Chia tay\n` +
                `• dating top - Xem top cặp đôi\n` +
                `• dating house - Quản lý nhà\n` +
                `• dating pet - Quản lý thú cưng\n` +
                `• dating exchange - Đổi exp thành tiền\n\n` +
                `🎯 𝐏𝐫𝐨𝐩𝐨𝐬𝐞 𝐯𝐨̛́𝐢 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐜𝐮̣ 𝐭𝐡𝐞̂̉:\n` +
                `• dating propose @[tên]\n` +
                `• dating propose (trả lời tin nhắn)\n` +
                `• dating propose [UID]\n` +
                `• dating propose [link facebook]\n` +
                `• dating propose @[tên đầy đủ]`,
                threadID, messageID);
    }
    
    var { money } = await Currencies.getData(senderID);
    if (money < 2000) return api.sendMessage(`𝐁𝐚̣𝐧 𝐜𝐚̂̀𝐧 𝟐𝟎𝟎𝟎 𝐕𝐍𝐃 𝐭𝐢𝐞̂̀𝐧 𝐩𝐡𝐢́ 𝐦𝐮𝐚 𝐧𝐡𝐚̂̃𝐧 𝐏𝐍𝐉 𝐭𝐚̣̆𝐧𝐠 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐝𝐚𝐭𝐢𝐧𝐠 𝐯𝐨̛́𝐢 𝐛𝐚̣𝐧 💍`, threadID, messageID);
    
    return api.sendMessage(`𝐁𝐚̣𝐧 𝐬𝐞̃ 𝐛𝐢̣ 𝐭𝐫𝐮̛̀ 𝟐𝟎𝟎𝟎 𝐕𝐍𝐃 𝐭𝐢𝐞̂̀𝐧 𝐩𝐡𝐢́ 𝐦𝐮𝐚 𝐧𝐡𝐚̂̃𝐧 𝐏𝐍𝐉 𝐭𝐚̣̆𝐧𝐠 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐝𝐚𝐭𝐢𝐧𝐠 𝐯𝐨̛́𝐢 𝐛𝐚̣𝐧 💍\n𝐒𝐨̂́ 𝐭𝐢𝐞̂̀𝐧 𝐧𝐚̀𝐲 𝐬𝐞̃ 𝐤𝐡𝐨̂𝐧𝐠 𝐡𝐨𝐚̀𝐧 𝐭𝐫𝐚̉ 𝐧𝐞̂́𝐮 𝟏 𝐭𝐫𝐨𝐧𝐠 𝟐 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐤𝐡𝐨̂𝐧𝐠 𝐜𝐡𝐚̂́𝐩 𝐧𝐡𝐚̣̂𝐧 𝐭𝐢𝐞̂́𝐧 𝐯𝐚̀𝐨 𝐭𝐫𝐚̣𝐧𝐠 𝐭𝐡𝐚́𝐢 𝐃𝐚𝐭𝐢𝐧𝐠 💜\n\n𝐓𝐡𝐚̉ 𝐜𝐚̉𝐦 𝐱𝐮́𝐜 𝐯𝐚̀𝐨 𝐭𝐢𝐧 𝐧𝐡𝐚̆́𝐧 𝐧𝐚̀𝐲 𝐧𝐞̂́𝐮 𝐜𝐡𝐚̂́𝐩 𝐧𝐡𝐚̣̂𝐧 𝐭𝐢̀𝐦 𝐤𝐢𝐞̂́𝐦 𝐦𝐨̣̂𝐭 𝐧𝐠𝐮̛𝐨̛̀𝐢.`, threadID, (error, info) => {
        global.client.handleReaction.push({
            name: this.config.name,
            type: input,
            messageID: info.messageID,
            senderID: senderID,
            author: dataUser
        });
    }, messageID);
}

function getRank(senderID) {
    var dataDating = require('./game/dating.json');
    dataDating.sort(function (a, b) { return b.data.point - a.data.point })
    var rank = dataDating.findIndex(i => i.ID_one == senderID || i.ID_two == senderID);
    return rank + 1
}

// ... [Rest of the code remains the same, only handleReaction needs to be updated for the new propose type] ...

module.exports.handleReaction = async function ({ api, event, Threads, Users, Currencies, handleReaction }) {
    var { threadID, reaction, messageID, userID } = event;
    var { type, senderID, author, love, data, houseCost, moneyForFeed, chosenPoint, medicalCost } = handleReaction;
    var dataDating = require('./game/dating.json');
    var path = join(__dirname, 'game', 'dating.json');
    var { money } = await Currencies.getData(senderID);
    
    // ===== NEW: PROPOSE REACTION HANDLER =====
    if (type == 'propose') {
        if (reaction != '❤') return;
        if (userID == author.ID) author.accept = true;
        if (userID == love.ID) love.accept = true;
        
        if (author.accept == true && love.accept == true) {
            api.unsendMessage(handleReaction.messageID);
            const dataUser = await Users.getData(love.ID);
            
            var userTwo = {
                name_one: dataUser.name,
                ID_one: love.ID,
                name_two: author.name,
                ID_two: author.ID,
                status: true,
                data: {
                    days: moment.tz("Asia/Ho_Chi_minh").format("hh:mm:ss DD/MM/YYYY"),
                    countDays: 0,
                    point: 0,
                    daily: null,
                    timestamp: Date.now()
                }
            }
            
            dataDating.push(userTwo)
            writeFileSync(path, JSON.stringify(dataDating, null, 4));
            
            return api.sendMessage(`𝐂𝐚̉ 𝟐 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐯𝐮̛̀𝐚 𝐜𝐮̀𝐧𝐠 𝐧𝐡𝐚𝐮 𝐭𝐡𝐚̉ 𝐜𝐚̉𝐦 𝐱𝐮́𝐜, 𝐧𝐠𝐡𝐢̃𝐚 𝐥𝐚̀ 𝐜𝐚̉ 𝟐 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐜𝐡𝐚̂́𝐩 𝐧𝐡𝐚̣̂𝐧 𝐭𝐢𝐞̂́𝐧 𝐭𝐨̛́𝐢 𝐡𝐞̣𝐧 𝐡𝐨̀ 💓`, threadID, async (error, info) => {
                let one_name = await Users.getNameUser(userTwo.ID_one);
                let two_name = await Users.getNameUser(userTwo.ID_two);
                api.changeNickname(`𝐃𝐚𝐭𝐢𝐧𝐠 𝐰𝐢𝐭𝐡 - ${one_name}`, threadID, userTwo.ID_two);
                api.changeNickname(`𝐃𝐚𝐭𝐢𝐧𝐠 𝐰𝐢𝐭𝐡 - ${two_name}`, threadID, userTwo.ID_one);
                api.sendMessage({ body: getMsg(), attachment: await this.canvas(love.ID, author.ID, 1) }, threadID);
            });
        }
        break;
    }
    
    // ... [Rest of the handleReaction code remains the same] ...
    
    switch (type) {
        case '1': {
            if (senderID != userID) return;
            api.unsendMessage(handleReaction.messageID)
            var dataGroup = (await Threads.getInfo(threadID)).userInfo;
            await Currencies.setData(senderID, { money: money - 2000 });
            var genderFilter = [];
            for (var i of dataGroup) {
                if (i.gender == 'FEMALE' && i.id != api.getCurrentUserID() && i.id != senderID) {
                    var a = dataDating.some(i => i.ID_one == i.id || i.ID_two == i.id);
                    if (a != true) {
                        genderFilter.push({
                            ID: i.id,
                            name: i.name
                        })
                    }
                }
            }
            if (genderFilter.length == 0) return api.sendMessage(`𝐑𝐚̂́𝐭 𝐭𝐢𝐞̂́𝐜, 𝐤𝐡𝐨̂𝐧𝐠 𝐜𝐨́ 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐦𝐚̀ 𝐛𝐚̣𝐧 𝐜𝐚̂̀𝐧 𝐭𝐢̀𝐦 𝐡𝐨𝐚̣̆𝐜 𝐡𝐨̣ 𝐜𝐨́ 𝐡𝐞̣𝐧 𝐡𝐨̀ 𝐯𝐨̛́𝐢 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐤𝐡𝐚́𝐜 𝐦𝐚̂́𝐭 𝐫𝐨̂̀𝐢 ^^`, threadID);
            var random = genderFilter[Math.floor(Math.random() * genderFilter.length)];
            var msg = {
                body: `[💏] ${author.name} - 𝐍𝐠𝐮̛𝐨̛̀𝐢 𝐦𝐚̀ 𝐡𝐞̣̂ 𝐭𝐡𝐨̂́𝐧𝐠 𝐜𝐡𝐨̣𝐧 𝐜𝐡𝐨 𝐛𝐚̣𝐧 𝐥𝐚̀: ${random.name}\n[💌] 𝐏𝐡𝐮̀ 𝐇𝐨̛̣𝐩: ${Math.floor(Math.random() * (80 - 30) + 30)}%\n\n𝐍𝐞̂́𝐮 𝐜𝐚̉ 𝟐 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐜𝐡𝐚̂́𝐩 𝐧𝐡𝐚̣̂𝐧 𝐝𝐚𝐭𝐢𝐧𝐠, 𝐡𝐚̃𝐲 𝐜𝐮̀𝐧𝐠 𝐧𝐡𝐚𝐮 𝐭𝐡𝐚̉ 𝐜𝐚̉𝐦 𝐱𝐮́𝐜 𝐭𝐫𝐚́𝐢 𝐭𝐢𝐦 [❤] 𝐯𝐚̀𝐨 𝐭𝐢𝐧 𝐧𝐡𝐚̆́𝐧 𝐧𝐚̀𝐲 𝐯𝐚̀ 𝐜𝐡𝐢́𝐧𝐡 𝐭𝐡𝐮̛́𝐜 𝐭𝐫𝐚̣𝐧𝐠 𝐭𝐡𝐚́𝐢 𝐝𝐚𝐭𝐢𝐧𝐠 𝐯𝐨̛́𝐢 𝐧𝐡𝐚𝐮`,
                mentions: [{ tag: random.name, id: random.ID }, { tag: author.name, id: senderID }]
            }
            return api.sendMessage(msg, threadID, (error, info) => {
                global.client.handleReaction.push({
                    name: this.config.name,
                    messageID: info.messageID,
                    senderID: senderID,
                    type: "8",
                    author: {
                        ID: senderID,
                        name: author.name,
                        accept: false
                    },
                    love: {
                        ID: random.ID,
                        name: random.name,
                        accept: false
                    }
                });
            });
        }
        case '2': {
            if (senderID != userID) return;
            api.unsendMessage(handleReaction.messageID)
            var dataGroup = (await Threads.getInfo(threadID)).userInfo;
            await Currencies.setData(senderID, { money: money - 2000 });
            var genderFilter = [];
            for (var i of dataGroup) {
                if (i.gender == 'MALE' && i.id != api.getCurrentUserID() && i.id != senderID) {
                    var a = dataDating.some(i => i.ID_one == i.id || i.ID_two == i.id);
                    if (a != true) {
                        genderFilter.push({
                            ID: i.id,
                            name: i.name
                        })
                    }
                }
            }
            if (genderFilter.length == 0) return api.sendMessage(`𝐑𝐚̂́𝐭 𝐭𝐢𝐞̂́𝐜, 𝐤𝐡𝐨̂𝐧𝐠 𝐜𝐨́ 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐦𝐚̀ 𝐛𝐚̣𝐧 𝐜𝐚̂̀𝐧 𝐭𝐢̀𝐦 𝐡𝐨𝐚̣̆𝐜 𝐡𝐨̣ 𝐜𝐨́ 𝐡𝐞̣𝐧 𝐡𝐨̀ 𝐯𝐨̛́𝐢 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐤𝐡𝐚́𝐜 𝐦𝐚̂́𝐭 𝐫𝐨̂̀𝐢 ^^`, threadID);
            var random = genderFilter[Math.floor(Math.random() * genderFilter.length)];
            var msg = {
                body: `[💏] ${author.name} - 𝐍𝐠𝐮̛𝐨̛̀𝐢 𝐦𝐚̀ 𝐡𝐞̣̂ 𝐭𝐡𝐨̂́𝐧𝐠 𝐜𝐡𝐨̣𝐧 𝐜𝐡𝐨 𝐛𝐚̣𝐧 𝐥𝐚̀: ${random.name}\n[💌] 𝐏𝐡𝐮̀ 𝐇𝐨̛̣𝐩: ${Math.floor(Math.random() * (80 - 30) + 30)}%\n\n𝐍𝐞̂́𝐮 𝐜𝐚̉ 𝟐 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐜𝐡𝐚̂́𝐩 𝐧𝐡𝐚̣̂𝐧 𝐝𝐚𝐭𝐢𝐧𝐠, 𝐡𝐚̃𝐲 𝐜𝐮̀𝐧𝐠 𝐧𝐡𝐚𝐮 𝐭𝐡𝐚̉ 𝐜𝐚̉𝐦 𝐱𝐮́𝐜 𝐭𝐫𝐚́𝐢 𝐭𝐢𝐦 [❤] 𝐯𝐚̀𝐨 𝐭𝐢𝐧 𝐧𝐡𝐚̆́𝐧 𝐧𝐚̀𝐲 𝐯𝐚̀ 𝐜𝐡𝐢́𝐧𝐡 𝐭𝐡𝐮̛́𝐜 𝐭𝐫𝐚̣𝐧𝐠 𝐭𝐡𝐚́𝐢 𝐝𝐚𝐭𝐢𝐧𝐠 𝐯𝐨̛́𝐢 𝐧𝐡𝐚𝐮`,
                mentions: [{ tag: random.name, id: random.ID }, { tag: author.name, id: senderID }]
            }
            return api.sendMessage(msg, threadID, (error, info) => {
                global.client.handleReaction.push({
                    name: this.config.name,
                    messageID: info.messageID,
                    senderID: senderID,
                    type: "8",
                    author: {
                        ID: senderID,
                        name: author.name,
                        accept: false
                    },
                    love: {
                        ID: random.ID,
                        name: random.name,
                        accept: false
                    }
                });
            });
        }
        case '3': {
            if (userID == data.ID_one) data.accept_one = true;
            if (userID == data.ID_two) data.accept_two = true;
            var findIndex = dataDating.find(i => i.ID_one == userID || i.ID_two == userID);
            if (data.accept_one == true && data.accept_two == true) {
                api.changeNickname('', threadID, data.ID_one);
                api.changeNickname('', threadID, data.ID_two);
                dataDating.splice(findIndex, 1);
                writeFileSync(path, JSON.stringify(dataDating, null, 4));
                var msg = { body: '𝐁𝐞̂𝐧 𝐧𝐡𝐚𝐮 𝐯𝐚̀𝐨 𝐧𝐡𝐮̛̃𝐧𝐠 𝐥𝐮́𝐜 𝐠𝐢𝐨̂𝐧𝐠 𝐛𝐚̃𝐨, 𝐧𝐡𝐮̛𝐧𝐠 𝐥𝐚̣𝐢 𝐜𝐡𝐚̆̉𝐧𝐠 𝐭𝐡𝐞̂̉ 𝐜𝐨́ 𝐧𝐡𝐚𝐮 𝐯𝐚̀𝐨 𝐥𝐮́𝐜 𝐦𝐮̛𝐚 𝐭𝐚𝐧 🙁\n𝐇𝐚̃𝐲 𝐯𝐮𝐢 𝐥𝐞̂𝐧 𝐧𝐡𝐞́, 𝐜𝐨́ 𝐧𝐡𝐮̛̃𝐧𝐠 𝐥𝐮́𝐜 𝐡𝐨̛̣𝐩 𝐫𝐨̂̀𝐢 𝐥𝐚̣𝐢 𝐭𝐚𝐧 𝐦𝐨̛́𝐢 𝐤𝐡𝐢𝐞̂́𝐧 𝐛𝐚̉𝐧 𝐭𝐡𝐚̂𝐧 𝐦𝐢̀𝐧𝐡 𝐦𝐚̣𝐧𝐡 𝐦𝐞̃ 𝐡𝐨̛𝐧 𝐧𝐮̛̃𝐚 𝐜𝐡𝐮̛́', attachment: await this.canvas(data.ID_one, data.ID_two, 0) }
                return api.sendMessage(msg, threadID, messageID)
            }
            break
        }
        case '8': {
            if (reaction != '❤') return;
            if (userID == author.ID) author.accept = true;
            if (userID == love.ID) love.accept = true;
            if (author.accept == true && love.accept == true) {
                api.unsendMessage(handleReaction.messageID);
                const dataUser = await Users.getData(love.ID);
                var userTwo = {
                    name_one: dataUser.name,
                    ID_one: love.ID,
                    name_two: author.name,
                    ID_two: author.ID,
                    status: true,
                    data: {
                        days: moment.tz("Asia/Ho_Chi_minh").format("hh:mm:ss DD/MM/YYYY"),
                        countDays: 0,
                        point: 0,
                        daily: null,
                        timestamp: Date.now()
                    }
                }
                dataDating.push(userTwo)
                writeFileSync(path, JSON.stringify(dataDating, null, 4));
                return api.sendMessage(`𝐂𝐚̉ 𝟐 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐯𝐮̛̀𝐚 𝐜𝐮̀𝐧𝐠 𝐧𝐡𝐚𝐮 𝐭𝐡𝐚̉ 𝐜𝐚̉𝐦 𝐱𝐮́𝐜, 𝐧𝐠𝐡𝐢̃𝐚 𝐥𝐚̀ 𝐜𝐚̉ 𝟐 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐜𝐡𝐚̂́𝐩 𝐧𝐡𝐚̣̂𝐧 𝐭𝐢𝐞̂́𝐧 𝐭𝐨̛́𝐢 𝐡𝐞̣𝐧 𝐡𝐨̀ 💓`, threadID, async (error, info) => {
                    let one_name = await Users.getNameUser(userTwo.ID_one);
                    let two_name = await Users.getNameUser(userTwo.ID_two);
                    api.changeNickname(`𝐃𝐚𝐭𝐢𝐧𝐠 𝐰𝐢𝐭𝐡 - ${one_name}`, threadID, userTwo.ID_two);
                    api.changeNickname(`𝐃𝐚𝐭𝐢𝐧𝐠 𝐰𝐢𝐭𝐡 - ${two_name}`, threadID, userTwo.ID_one);
                    api.sendMessage({ body: getMsg(), attachment: await this.canvas(love.ID, author.ID, 1) }, threadID);
                });
            }
            break;
        }
        case '6': {
            if (reaction != '❤') return;
            if (userID == data.ID_one) data.accept_one = true;
            if (userID == data.ID_two) data.accept_two = true;
            if (data.accept_one && data.accept_two) {
                api.unsendMessage(handleReaction.messageID);
                let pointToIncrease = 10;
                let bonusPercent = 0;
                let isHungry = false;
                let lastFeed = dataDating.find(i => i.ID_one == data.ID_one).data.petLastFeed;
                if (lastFeed && lastFeed != NaN && !isNaN(lastFeed)) {
                    let timeNow = Date.now();
                    if (lastFeed < timeNow - (24 * 60 * 60 * 1000)) {
                        isHungry = true;
                    }
                }
                if (author.data.pet && author.data.pet.length > 0 && isHungry == false) {
                    bonusPercent += this.getPetBonus(author.data.pet, author);
                }
                if (author.data.house && author.data.house != NaN && !isNaN(author.data.house)) {
                    bonusPercent += this.getHouseBonus(author.data.house);
                }
                pointToIncrease = Math.floor(pointToIncrease * (1 + bonusPercent));
                author.data.point += pointToIncrease;
                author.data.daily = Date.now();
                dataDating[dataDating.findIndex(i => i.ID_one == author.ID_one)] = author;
                writeFileSync(path, JSON.stringify(dataDating, null, 4));
                return api.sendMessage(`𝐃𝐢𝐞𝐦𝐝𝐚𝐧𝐡 𝐭𝐡𝐚̀𝐧𝐡 𝐜𝐨̂𝐧𝐠! 𝐄𝐱𝐩 𝐭𝐡𝐚̂𝐧 𝐦𝐚̣̂𝐭 𝐜𝐮̉𝐚 𝐛𝐚̣𝐧 𝐛𝐚̣𝐧 𝐭𝐚̆𝐧𝐠 𝐭𝐡𝐞̂𝐦 ${pointToIncrease}, 𝐭𝐨̂̉𝐧𝐠: ${author.data.point} 💜`, threadID, () => {
                    if (isHungry == true) api.sendMessage(`𝐂𝐨́ 𝐯𝐞̉ 𝐩𝐞𝐭 𝐜𝐮̉𝐚 𝐛𝐚̣𝐧 𝐜𝐚̂̀𝐧 𝐜𝐡𝐨 𝐚̆𝐧, 𝐧𝐞̂́𝐮 𝐤𝐡𝐨̂𝐧𝐠 𝐜𝐡𝐨 𝐩𝐞𝐭 𝐚̆𝐧 𝐪𝐮𝐚́ 𝐦𝐨̣̂𝐭 𝐧𝐠𝐚̀𝐲 𝐛𝐚̣𝐧 𝐬𝐞̃ 𝐦𝐚̂́𝐭 𝐩𝐞𝐭`, threadID);
                });
            }
        }
        case '9': {
            if (reaction != '👍') return;
            else if (userID == senderID) {
                api.unsendMessage(handleReaction.messageID);
                await Currencies.setData(senderID, { money: money + houseCost });
                delete dataDating[dataDating.findIndex(i => i.ID_one == senderID || i.ID_two == senderID)].data.house;
                writeFileSync(path, JSON.stringify(dataDating, null, 4));
                return api.sendMessage(`𝐁𝐚́𝐧 𝐭𝐡𝐚̀𝐧𝐡 𝐜𝐨̂𝐧𝐠 𝐯𝐚̀ 𝐧𝐡𝐚̣̂𝐧 𝐯𝐞̂̀ ${houseCost}$`, threadID);
            }
            break;
        }
        case '10': {
            if (reaction != '👍' || moneyForFeed === 0) return;
            else if (userID == senderID) {
                api.unsendMessage(handleReaction.messageID);
                await Currencies.setData(senderID, { money: money - moneyForFeed });
                dataDating[dataDating.findIndex(i => i.ID_one == senderID || i.ID_two == senderID)].data.petLastFeed = Date.now();
                writeFileSync(path, JSON.stringify(dataDating, null, 4));
                return api.sendMessage(`𝐁𝐚̣𝐧 𝐯𝐮̛̀𝐚 𝐜𝐡𝐨 𝐩𝐞𝐭 𝐚̆𝐧 𝐭𝐡𝐚̀𝐧𝐡 𝐜𝐨̂𝐧𝐠!`, threadID);
            }
            break;
        }
        case '11': {
            if (reaction != '👍') return;
            else if (userID == senderID) {
                let authorPoint = dataDating[dataDating.findIndex(i => i.ID_one == senderID || i.ID_two == senderID)].data.point;
                api.unsendMessage(handleReaction.messageID);
                if (authorPoint < chosenPoint) return api.sendMessage("𝐁𝐚̣𝐧 𝐤𝐡𝐨̂𝐧𝐠 đ𝐮̉ 𝐞𝐱𝐩 đ𝐞̂̉ đ𝐨̂̉𝐢!", threadID);
                await Currencies.setData(senderID, { money: money + (chosenPoint * 20) });
                dataDating[dataDating.findIndex(i => i.ID_one == senderID || i.ID_two == senderID)].data.point -= chosenPoint;
                writeFileSync(path, JSON.stringify(dataDating, null, 4));
                return api.sendMessage(`𝐁𝐚̣𝐧 đ𝐚̃ đ𝐨̂̉𝐢 𝐭𝐡𝐚̀𝐧𝐡 𝐜𝐨̂𝐧𝐠 ${chosenPoint} 𝐞𝐱𝐩 𝐯𝐚̀ 𝐧𝐡𝐚̣̂𝐧 ${chosenPoint * 20}$`, threadID);
            }
        }
        case '12': {
            if (reaction != '👍') return;
            else if (userID == senderID) {
                api.unsendMessage(handleReaction.messageID);
                await Currencies.setData(senderID, { money: money - medicalCost });
                for (i of dataDating[dataDating.findIndex(i => i.ID_one == senderID || i.ID_two == senderID)].data.pet) {
                    i.health = 'good';
                }
                writeFileSync(path, JSON.stringify(dataDating, null, 4));
                return api.sendMessage(`𝐁𝐚̣𝐧 𝐯𝐮̛̀𝐚 𝐜𝐡𝐮̛̃𝐚 𝐛𝐞̣̂𝐧𝐡 𝐜𝐡𝐨 𝐩𝐞𝐭 𝐭𝐡𝐚̀𝐧𝐡 𝐜𝐨̂𝐧𝐠!`, threadID);
            }
        }
        default:
            break;
    }
}

// ... [Rest of the code remains exactly the same] ...
