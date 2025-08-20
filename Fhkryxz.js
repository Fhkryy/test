const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const path = require("path");
const settings = require("./database/settings.js");
const owner = settings.adminId;
const botToken = settings.token;
const adminfile = "./database/adminID.json";
const premiumUsersFile = "./database/premiumUsers.json";
const domain = settings.domain;
const plta = settings.plta;
const pltc = settings.pltc;

const allowedGroupIds = [
  "-1002616189033", // Ganti dengan ID grup Anda
  "-1002658747465",
  "-1002728688433" // Tambahkan lebih banyak jika perlu
];

let premiumUsers = [];
let adminUsers = [];

const startTime = Date.now();

try {
  premiumUsers = JSON.parse(fs.readFileSync(premiumUsersFile));
} catch (error) {
  console.error("Error reading premiumUsers file:", error);
}

try {
  adminUsers = JSON.parse(fs.readFileSync(adminfile));
} catch (error) {
  console.error("Error reading adminUsers file:", error);
}

const sendMessage = (chatId, text) => bot.sendMessage(chatId, text);

let videoCache = null;
let videoCachePath = null;

function loadVideoToCache() {
  if (videoCache) return videoCache;

  const videoPath = path.join(__dirname, "./database/media/video.mp4");
  if (fs.existsSync(videoPath)) {
    videoCachePath = videoPath;
    videoCache = fs.readFileSync(videoPath);
    return videoCache;
  }
  return null;
}

const bot = new TelegramBot(botToken, { polling: true });

// Helper functions
function getRuntime(startTime) {
  const uptime = process.uptime();
  const days = Math.floor(uptime / (3600 * 24));
  const hours = Math.floor((uptime % (3600 * 24)) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  return `${days} Hari ${hours} Jam ${minutes} Menit ${seconds} Detik`;
}

function checkGroupOnly(msg) {
  const chatId = msg.chat.id;
  const chatType = msg.chat.type;
  const userId = msg.from.id;
  const command = msg.text?.split(' ')[0] || '';
  
  const isOwner = adminUsers.includes(String(userId)) || String(userId) === owner;
  const allowedPrivateCommands = ['/start', '/cekid'];
  
  if (isOwner) return true;
  
  if (chatType === 'private' && !allowedPrivateCommands.includes(command)) {
    bot.sendMessage(chatId, "❌ Perintah ini hanya untuk grup yang diizinkan", {
      reply_markup: {
        inline_keyboard: [[{ text: "Hubungi Owner", url: "https://t.me/Fhkryxz" }]]
      }
    });
    return false;
  }
  
  if ((chatType === 'group' || chatType === 'supergroup') && !allowedGroupIds.includes(String(chatId))) {
    bot.sendMessage(chatId, "❌ Bot tidak diizinkan di grup ini", {
      reply_markup: {
        inline_keyboard: [[{ text: "Hubungi Owner", url: "https://t.me/Fhkryxz" }]]
      }
    });
    return false;
  }
  
  return true;
}

// Start command
bot.onText(/\/start/, (msg) => {
  if (!checkGroupOnly(msg)) return;
  
  const chatId = msg.chat.id;
  const startTime = Date.now();
  const cachedVideo = loadVideoToCache();
  const menuText = `
\`\`\`
|[ I N F O ]|
✚ Developer :: @Fhkryxz
✚ Version :: 2.0
✚ Language :: Javascript
✚ Runtime :: ${getRuntime(startTime)}
\`\`\`
`;

  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "MENU", callback_data: "mainmenu" }]
      ]
    }
  };

  bot.sendChatAction(chatId, "typing"); // efek mengetik
  setTimeout(() => {
    bot.sendVideo(chatId, cachedVideo, {
      caption: menuText,
      parse_mode: "Markdown",
      ...keyboard
    });
  }, 1000); // delay 1 detik untuk efek real
});

bot.on("callback_query", async (callbackQuery) => {
  const data = callbackQuery.data;
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;

  await bot.answerCallbackQuery(callbackQuery.id);
  let message = "";

  switch (data) {
    case "mainmenu":
      message = `
\`\`\`
|[ I N F O ]|
✚ Developer :: @Fhkryxz
✚ Version :: 2.0
✚ Language :: Javascript
✚ Runtime :: ${getRuntime(startTime)}

Silahkan pilih menu di bawah ini:
\`\`\`
`;
break;
case "cekid":
      message = `
\`\`\`
|[ I N F O ]|
✚ Developer :: @Fhkryxz
✚ Version :: 2.0
✚ Language :: Javascript
✚ Runtime :: ${getRuntime(startTime)}

|[ 𝗖𝗘𝗞𝗜𝗗 ]|
ᝰ.ᐟ /CEKID
\`\`\`
`;
break;
case "createpanel":
      message = `
\`\`\`
|[ I N F O ]|
✚ Developer :: @Fhkryxz
✚ Version :: 2.0
✚ Language :: Javascript
✚ Runtime :: ${getRuntime(startTime)}

|[ 𝗖𝗣𝗔𝗡𝗘𝗟 ]|
ᝰ.ᐟ /1GB USER,ID
ᝰ.ᐟ /2GB USER,ID
ᝰ.ᐟ /3GB USER,ID
ᝰ.ᐟ /4GB USER,ID
ᝰ.ᐟ /5GB USER,ID
ᝰ.ᐟ /6GB USER,ID
ᝰ.ᐟ /7GB USER,ID
ᝰ.ᐟ /8GB USER,ID
ᝰ.ᐟ /9GB USER,ID
ᝰ.ᐟ /10GB USER,ID
ᝰ.ᐟ /11GB USER,ID
ᝰ.ᐟ /UNLI USER,ID
ᝰ.ᐟ /CADMIN USER,ID
\`\`\`
`;
break;
case "ownermenu":
      message = `
\`\`\`
|[ I N F O ]|
✚ Developer :: @Fhkryxz
✚ Version :: 2.0
✚ Language :: Javascript
✚ Runtime :: ${getRuntime(startTime)}

|[ 𝗦𝗘𝗧𝗧𝗜𝗡𝗚 ]|
ᝰ.ᐟ /ADDOWNER
ᝰ.ᐟ /ADDPREM
ᝰ.ᐟ /DELOWNER
ᝰ.ᐟ /DELPREM
ᝰ.ᐟ /LISTSRV
ᝰ.ᐟ /DELSRV
ᝰ.ᐟ /LISTADMIN
ᝰ.ᐟ /LISTUSR
ᝰ.ᐟ /DELUSR
\`\`\`
`;
break;

default:
      return; // Unknown action
  }

  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "CEKID", callback_data: "cekid" },
          { text: "CPANEL", callback_data: "createpanel" }
        ],
        [
          { text: "SETTING", callback_data: "ownermenu" },
        ]
      ]
    }
  };

  bot.editMessageCaption(message, {
    chat_id: chatId,
    message_id: messageId,
    parse_mode: "Markdown",
    ...keyboard
  });
});
//===================MENU CPANEL===≈====≈============//
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// addprem
bot.onText(/\/addprem (.+)/, (msg, match) => {
  if (!checkGroupOnly(msg)) return;
  
  const chatId = msg.chat.id;
  const userId = match[1];

  if (msg.from.id.toString() === owner) {
    if (!premiumUsers.includes(userId)) {
      premiumUsers.push(userId);
      fs.writeFileSync(premiumUsersFile, JSON.stringify(premiumUsers));
      bot.sendMessage(chatId, `User ${userId} Dapet Mengakses Fitur Premium.`);
    } else {
      bot.sendMessage(chatId, `User ${userId} is already a premium user.`);
    }
  } else {
    bot.sendMessage(chatId, "Only the owner can perform this action.");
  }
});

//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// cekid
bot.onText(/\/cekid/, async (msg) => {
  if (!checkGroupOnly(msg)) return;
  
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const firstName = msg.from.first_name || '';
  const lastName = msg.from.last_name || '';
  const username = msg.from.username ? '@' + msg.from.username : 'Tidak ada';

  const caption = `\`\`\`👤\nUSERNAME : ${username}\nID : ${userId}\`\`\``;

  try {
    const userProfilePhotos = await bot.getUserProfilePhotos(userId, { limit: 1 });

    if (userProfilePhotos.total_count === 0) throw new Error("No profile photo");

    const fileId = userProfilePhotos.photos[0][0].file_id;

    await bot.sendPhoto(chatId, fileId, {
      caption: caption,
      parse_mode: 'Markdown',
      reply_to_message_id: msg.message_id,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `${firstName} ${lastName}`,
              url: `tg://user?id=${userId}`
            }
          ]
        ]
      }
    });
  } catch (err) {
    await bot.sendMessage(chatId, `ID : \`${userId}\``, {
      parse_mode: 'Markdown',
      reply_to_message_id: msg.message_id
    });
  }
});

//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// delprem
bot.onText(/\/delprem (.+)/, (msg, match) => {
  if (!checkGroupOnly(msg)) return;
  
  const chatId = msg.chat.id;
  const userId = match[1];
  if (msg.from.id.toString() === owner) {
    const index = premiumUsers.indexOf(userId);
    if (index !== -1) {
      premiumUsers.splice(index, 1);
      fs.writeFileSync(premiumUsersFile, JSON.stringify(premiumUsers));
      bot.sendMessage(
        chatId,
        `User ${userId} Tidak Dapet Mengakses Fitur Premium`
      );
    } else {
      bot.sendMessage(chatId, `User ${userId} is not a premium user.`);
    }
  } else {
    bot.sendMessage(chatId, "Only the owner can perform this action.");
  }
});
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// addowner
bot.onText(/\/addowner (.+)/, (msg, match) => {
  if (!checkGroupOnly(msg)) return;
  
  const chatId = msg.chat.id;
  const userId = match[1];

  if (msg.from.id.toString() === owner) {
    if (!adminUsers.includes(userId)) {
      adminUsers.push(userId);
      fs.writeFileSync(adminfile, JSON.stringify(adminUsers));
      bot.sendMessage(
        chatId,
        `User ${userId} Dapet Mengakses Fitur Owner.`
      );
    } else {
      bot.sendMessage(chatId, `User ${userId} is already an admin user.`);
    }
  } else {
    bot.sendMessage(chatId, "Only the owner can perform this action.");
  }
});

//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// delowner
bot.onText(/\/delowner (.+)/, (msg, match) => {
  if (!checkGroupOnly(msg)) return;
  
  const chatId = msg.chat.id;
  const userId = match[1];

  if (msg.from.id.toString() === owner) {
    const index = adminUsers.indexOf(userId);
    if (index !== -1) {
      adminUsers.splice(index, 1);
      fs.writeFileSync(adminfile, JSON.stringify(adminUsers));
      bot.sendMessage(chatId, `User ${userId} Tidak Dapet Lagi Mengakses Fitur Owner`);
    } else {
      bot.sendMessage(chatId, `User ${userId} is not an admin user.`);
    }
  } else {
    bot.sendMessage(chatId, "Only the owner can perform this action.");
  }
});

bot.onText(/\/1gb (.+)/, async (msg, match) => {
  if (!checkGroupOnly(msg)) return;
  
  const chatId = msg.chat.id;
  const text = match[1];
  const premiumUsers = JSON.parse(fs.readFileSync(premiumUsersFile));
  const isPremium = premiumUsers.includes(String(msg.from.id));
  if (!isPremium) {
    bot.sendMessage(chatId, "KHUSUS PREMIUM ❌", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "OWNER", url: "https://t.me/Fhkryxz" }],
        ],
      },
    });
    return;
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /1gb namapanel,idtele");
    return;
  }
  const username = t[0];
  const u = t[1];
  const name = username + "1gb";
  const egg = settings.eggs;
  const loc = settings.loc;
  const memo = "1024";
  const cpu = "30";
  const disk = "1024";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}@Fhkry.xyz`;
  const akunlo = settings.pp;
  const password = `${username}001`;
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(
          chatId,
          "Email already exists. Please use a different email."
        );
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_18",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
      `BERIKUT DATA PANEL ANDA
NAMA: ${username}
EMAIL: ${email}
ID: ${user.id}
MEMORY: ${server.limits.memory === 0 ? "Unlimited" : server.limits.memory} MB
DISK: ${server.limits.disk === 0 ? "Unlimited" : server.limits.disk} MB
CPU: ${server.limits.cpu}%`
    );
    if (akunlo) {
      bot.sendAnimation(u, akunlo, {
        caption: `Hai @${u}

 |[ DATA PANEL KAMU ]|
🌐 Login : ${domain}
👤 Username : ${user.username}
🔐 Password : ${password} 
Jangan Ddos Server
Wajib tutup domain saat screenshot

CPANEL BY @Fhkryxz`,
      });
      bot.sendMessage(
        chatId,
        "Data panel berhasil dikirim ke ID Telegram yang dimaksud."
      );
    }
  } else {
    bot.sendMessage(chatId, "Gagal membuat data panel. Silakan coba lagi.");
  }
});
// 2gb
bot.onText(/\/2gb (.+)/, async (msg, match) => {
  if (!checkGroupOnly(msg)) return;
  
  const chatId = msg.chat.id;
  const text = match[1];
  const premiumUsers = JSON.parse(fs.readFileSync(premiumUsersFile));
  const isPremium = premiumUsers.includes(String(msg.from.id));
  if (!isPremium) {
    bot.sendMessage(chatId, "KHUSUS PREMIUM ❌", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "OWNER", url: "https://t.me/Fhkryxz" }],
        ],
      },
    });
    return;
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /2gb namapanel,idtele");
    return;
  }
  const username = t[0];
  const u = t[1];
  const name = username + "2gb";
  const egg = settings.eggs;
  const loc = settings.loc;
  const memo = "2048";
  const cpu = "60";
  const disk = "2048";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}_${u}@Fhkry.xyz`;
  const akunlo = settings.pp;
  const password = `${username}001`;
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(
          chatId,
          "Email already exists. Please use a different email."
        );
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_18",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
      `BERIKUT DATA PANEL ANDA
NAMA: ${username}
EMAIL: ${email}
ID: ${user.id}
MEMORY: ${server.limits.memory === 0 ? "Unlimited" : server.limits.memory} MB
DISK: ${server.limits.disk === 0 ? "Unlimited" : server.limits.disk} MB
CPU: ${server.limits.cpu}%`
    );
    if (akunlo) {
      bot.sendAnimation(u, akunlo, {
        caption: `Hai @${u}

 |[ DATA PANEL KAMU ]|
🌐 Login : ${domain}
👤 Username : ${user.username}
🔐 Password : ${password} 

JANGAN DDOS SERVER 
WAJIB TUTUP DOMAIN SAAT SCREENSHOT
JNGAN BAGIKAN DOMAIN KE SIAPAPUN
JANGAN LUPA GANTI PASSWORD PANEL
ADMIN CUMA KASIH DATA 1X
NO RUSUH MAKASIH ITU AJA

CPANEL BY @Fhkryxz`,
      });
      bot.sendMessage(
        chatId,
        "Data panel berhasil dikirim ke ID Telegram yang dimaksud."
      );
    }
  } else {
    bot.sendMessage(chatId, "Gagal membuat data panel. Silakan coba lagi.");
  }
});
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// 3gb
bot.onText(/\/3gb (.+)/, async (msg, match) => {
  if (!checkGroupOnly(msg)) return;
  
  const chatId = msg.chat.id;
  const text = match[1];
  const premiumUsers = JSON.parse(fs.readFileSync(premiumUsersFile));
  const isPremium = premiumUsers.includes(String(msg.from.id));
  if (!isPremium) {
    bot.sendMessage(chatId, "KHUSUS PREMIUM ❌", {
      reply_markup: {
        inline_keyboard: [[{ text: "OWNER", url: "@Fhkryxz" }]],
      },
    });
    return;
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /3gb namapanel,idtele");
    return;
  }
  const username = t[0];
  const u = t[1];
  const name = username + "3gb";
  const egg = settings.eggs;
  const loc = settings.loc;
  const memo = "3072";
  const cpu = "90";
  const disk = "3072";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}@Fhkry.xyz`;
  const akunlo = settings.pp;
  const password = `${username}001`;
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(chatId, "Email&user telah ada di data panel vemos.");
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_18",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
      `BERIKUT DATA PANEL ANDA
NAMA: ${username}
EMAIL: ${email}
ID: ${user.id}
MEMORY: ${server.limits.memory === 0 ? "Unlimited" : server.limits.memory} MB
DISK: ${server.limits.disk === 0 ? "Unlimited" : server.limits.disk} MB
CPU: ${server.limits.cpu}%`
    );
    if (akunlo) {
      bot.sendAnimation(u, akunlo, {
        caption: `Hai @${u}

|[ DATA PANEL KAMU ]|
🌐 Login : ${domain}
👤 Username : ${user.username}
🔐 Password : ${password} 

|[ RULES ]|
JANGAN DDOS SERVER 
WAJIB TUTUP DOMAIN SAAT SCREENSHOT
JNGAN BAGIKAN DOMAIN KE SIAPAPUN
JANGAN LUPA GANTI PASSWORD PANEL
ADMIN CUMA KASIH DATA 1X
NO RUSUH MAKASIH ITU AJA

CPANEL BY @Fhkryxz`,
      });
      bot.sendMessage(
        chatId,
        "Data panel berhasil dikirim ke ID Telegram yang dimaksud."
      );
    }
  } else {
    bot.sendMessage(chatId, "Gagal membuat data panel. Silakan coba lagi.");
  }
});
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// 4gb
bot.onText(/\/4gb (.+)/, async (msg, match) => {
  if (!checkGroupOnly(msg)) return;
  
  const chatId = msg.chat.id;
  const text = match[1];
  const premiumUsers = JSON.parse(fs.readFileSync(premiumUsersFile));
  const isPremium = premiumUsers.includes(String(msg.from.id));
  if (!isPremium) {
    bot.sendMessage(chatId, "KHUSUS PREMIUM ❌", {
      reply_markup: {
        inline_keyboard: [[{ text: "OWNER", url: "@Fhkryxz" }]],
      },
    });
    return;
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /4gb namapanel,idtele");
    return;
  }
  const username = t[0];
  const u = t[1];
  const name = username + "4gb";
  const egg = settings.eggs;
  const loc = settings.loc;
  const memo = "4048";
  const cpu = "110";
  const disk = "4048";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}@Fhkry.xyz`;
  const akunlo = settings.pp;
  const password = `${username}001`;
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(
          chatId,
          "Email already exists. Please use a different email."
        );
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_18",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
      `BERIKUT DATA PANEL ANDA
NAMA: ${username}
EMAIL: ${email}
ID: ${user.id}
MEMORY: ${server.limits.memory === 0 ? "Unlimited" : server.limits.memory} MB
DISK: ${server.limits.disk === 0 ? "Unlimited" : server.limits.disk} MB
CPU: ${server.limits.cpu}%`
    );
    if (akunlo) {
      bot.sendAnimation(u, akunlo, {
        caption: `Hai @${u}

 |[ DATA PANEL KAMU ]|
🌐 Login : ${domain}
👤 Username : ${user.username}
🔐 Password : ${password} 
|[ RULES ]| :
JANGAN DDOS SERVER 
WAJIB TUTUP DOMAIN SAAT SCREENSHOT
JNGAN BAGIKAN DOMAIN KE SIAPAPUN
JANGAN LUPA GANTI PASSWORD PANEL
ADMIN CUMA KASIH DATA 1X
NO RUSUH MAKASIH ITU AJA

CPANEL BY @Fhkryxz`,
      });
      bot.sendMessage(
        chatId,
        "Data panel berhasil dikirim ke ID Telegram yang dimaksud."
      );
    }
  } else {
    bot.sendMessage(chatId, "Gagal membuat data panel. Silakan coba lagi.");
  }
});
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// 5gb
bot.onText(/\/5gb (.+)/, async (msg, match) => {
  if (!checkGroupOnly(msg)) return;
  
  const chatId = msg.chat.id;
  const text = match[1];
  const premiumUsers = JSON.parse(fs.readFileSync(premiumUsersFile));
  const isPremium = premiumUsers.includes(String(msg.from.id));
  if (!isPremium) {
    bot.sendMessage(chatId, "KHUSUS PREMIUM ❌", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "OWNER", url: "https://t.me/Fhkryxz" }],
        ],
      },
    });
    return;
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /5gb namapanel,idtele");
    return;
  }
  const username = t[0];
  const u = t[1];
  const name = username + "5gb";
  const egg = settings.eggs;
  const loc = settings.loc;
  const memo = "5048";
  const cpu = "140";
  const disk = "5048";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}@Fhkry.xyz`;
  const akunlo = settings.pp;
  const password = `${username}001`;
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(chatId, "Email&user telah ada di panel vemos.");
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_18",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
      `BERIKUT DATA PANEL ANDA
NAMA: ${username}
EMAIL: ${email}
ID: ${user.id}
MEMORY: ${server.limits.memory === 0 ? "Unlimited" : server.limits.memory} MB
DISK: ${server.limits.disk === 0 ? "Unlimited" : server.limits.disk} MB
CPU: ${server.limits.cpu}%`
    );
    if (akunlo) {
      bot.sendAnimation(u, akunlo, {
        caption: `Hai @${u}

|[ DATA PANEL KAMU ]|
🌐 Login : ${domain}
👤 Username : ${user.username}
🔐 Password : ${password} 

|[ RULES ]|
JANGAN DDOS SERVER 
WAJIB TUTUP DOMAIN SAAT SCREENSHOT
JNGAN BAGIKAN DOMAIN KE SIAPAPUN
JANGAN LUPA GANTI PASSWORD PANEL
ADMIN CUMA KASIH DATA 1X
NO RUSUH MAKASIH ITU AJA

CPANEL BY @Fhkryxz`,
      });
      bot.sendMessage(
        chatId,
        "Data panel berhasil dikirim ke ID Telegram yang dimaksud."
      );
    }
  } else {
    bot.sendMessage(chatId, "Gagal membuat data panel. Silakan coba lagi.");
  }
});
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
bot.onText(/\/delsrv (.+)/, async (msg, match) => {
  if (!checkGroupOnly(msg)) return;
  
  const chatId = msg.chat.id;
  const srv = match[1].trim();

  const adminUsers = JSON.parse(fs.readFileSync(adminfile));
  const isAdmin = adminUsers.includes(String(msg.from.id));

  if (!isAdmin) {
    bot.sendMessage(
      chatId,
      "Perintah hanya untuk Owner, OWNER Saya Untuk Menjadi Owner atau Users Premium...",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "OWNER", url: "https://t.me/Fhkryxz" }],
          ],
        },
      }
    );
    return;
  }

  if (!srv) {
    bot.sendMessage(
      chatId,
      "Mohon masukkan ID server yang ingin dihapus, contoh: /delsrv 1234"
    );
    return;
  }

  try {
    let f = await fetch(domain + "/api/application/servers/" + srv, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
    });

    let res = f.ok ? { errors: null } : await f.json();

    if (res.errors) {
      bot.sendMessage(chatId, "SERVER TIDAK ADA");
    } else {
      bot.sendMessage(chatId, "SUCCESFULLY DELETE SERVER");
    }
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "Terjadi kesalahan saat menghapus server.");
  }
});
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// 6gb
bot.onText(/\/6gb (.+)/, async (msg, match) => {
  if (!checkGroupOnly(msg)) return;
  
  const chatId = msg.chat.id;
  const text = match[1];
  const premiumUsers = JSON.parse(fs.readFileSync(premiumUsersFile));
  const isPremium = premiumUsers.includes(String(msg.from.id));
  if (!isPremium) {
    bot.sendMessage(chatId, "KHUSUS PREMIUM ❌", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "OWNER", url: "https://t.me/Fhkryxz" }],
        ],
      },
    });
    return;
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /6gb namapanel,idtele");
    return;
  }
  const username = t[0];
  const u = t[1];
  const name = username + "6gb";
  const egg = settings.eggs;
  const loc = settings.loc;
  const memo = "6048";
  const cpu = "170";
  const disk = "6048";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}@Fhkry.xyz`;
  const akunlo = settings.pp;
  const password = `${username}001`;
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(chatId, "Email&user telah ada di panel vemos.");
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_18",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
      `BERIKUT DATA PANEL ANDA
NAMA: ${username}
EMAIL: ${email}
ID: ${user.id}
MEMORY: ${server.limits.memory === 0 ? "Unlimited" : server.limits.memory} MB
DISK: ${server.limits.disk === 0 ? "Unlimited" : server.limits.disk} MB
CPU: ${server.limits.cpu}%`
    );
    if (akunlo) {
      bot.sendAnimation(u, akunlo, {
        caption: `Hai @${u}

 |[ DATA PANEL KAMU ]|
🌐 Login : ${domain}
👤 Username : ${user.username}
🔐 Password : ${password} 

|[ RULES ]|
JANGAN DDOS SERVER 
WAJIB TUTUP DOMAIN SAAT SCREENSHOT
JNGAN BAGIKAN DOMAIN KE SIAPAPUN
JANGAN LUPA GANTI PASSWORD PANEL
ADMIN CUMA KASIH DATA 1X
NO RUSUH MAKASIH ITU AJA

CPANEL BY @Fhkryxz`,
      });
      bot.sendMessage(
        chatId,
        "Data panel berhasil dikirim ke ID Telegram yang dimaksud."
      );
    }
  } else {
    bot.sendMessage(chatId, "Gagal membuat data panel. Silakan coba lagi.");
  }
});
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// 7gb
bot.onText(/\/7gb (.+)/, async (msg, match) => {
  if (!checkGroupOnly(msg)) return;
  
  const chatId = msg.chat.id;
  const text = match[1];
  const premiumUsers = JSON.parse(fs.readFileSync(premiumUsersFile));
  const isPremium = premiumUsers.includes(String(msg.from.id));
  if (!isPremium) {
    bot.sendMessage(chatId, "KHUSUS PREMIUM ❌", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "OWNER", url: "https://t.me/Fhkryxz" }],
        ],
      },
    });
    return;
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /7gb namapanel,idtele");
    return;
  }
  const username = t[0];
  const u = t[1];
  const name = username + "7gb";
  const egg = settings.eggs;
  const loc = settings.loc;
  const memo = "7048";
  const cpu = "200";
  const disk = "7048";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}@Fhkry.xyz`;
  const akunlo = settings.pp;
  const password = `${username}001`;
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(chatId, "Email&user telah ada di panel vemos.");
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_18",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
      `BERIKUT DATA PANEL ANDA
NAMA: ${username}
EMAIL: ${email}
ID: ${user.id}
MEMORY: ${server.limits.memory === 0 ? "Unlimited" : server.limits.memory} MB
DISK: ${server.limits.disk === 0 ? "Unlimited" : server.limits.disk} MB
CPU: ${server.limits.cpu}%`
    );
    if (akunlo) {
      bot.sendAnimation(u, akunlo, {
        caption: `Hai @${u}

 |[ DATA PANEL KAMU ]|
🌐 Login : ${domain}
👤 Username : ${user.username}
🔐 Password : ${password} 

JANGAN DDOS SERVER 
WAJIB TUTUP DOMAIN SAAT SCREENSHOT
JNGAN BAGIKAN DOMAIN KE SIAPAPUN
JANGAN LUPA GANTI PASSWORD PANEL
ADMIN CUMA KASIH DATA 1X
NO RUSUH MAKASIH ITU AJA

CPANEL BY @Fhkryxz`,
      });
      bot.sendMessage(
        chatId,
        "Data panel berhasil dikirim ke ID Telegram yang dimaksud."
      );
    }
  } else {
    bot.sendMessage(chatId, "Gagal membuat data panel. Silakan coba lagi.");
  }
});
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// 8gb
bot.onText(/\/8gb (.+)/, async (msg, match) => {
  if (!checkGroupOnly(msg)) return;
  
  const chatId = msg.chat.id;
  const text = match[1];
  const premiumUsers = JSON.parse(fs.readFileSync(premiumUsersFile));
  const isPremium = premiumUsers.includes(String(msg.from.id));
  if (!isPremium) {
    bot.sendMessage(chatId, "KHUSUS PREMIUM ❌", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "OWNER", url: "https://t.me/Fhkryxz" }],
        ],
      },
    });
    return;
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /8gb namapanel,idtele");
    return;
  }
  const username = t[0];
  const u = t[1];
  const name = username + "8gb";
  const egg = settings.eggs;
  const loc = settings.loc;
  const memo = "8048";
  const cpu = "230";
  const disk = "8048";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}@Fhkry.xyz`;
  const akunlo = settings.pp;
  const password = `${username}001`;
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(
          chatId,
          "Email already exists. Please use a different email."
        );
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_18",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
      `BERIKUT DATA PANEL ANDA
NAMA: ${username}
EMAIL: ${email}
ID: ${user.id}
MEMORY: ${server.limits.memory === 0 ? "Unlimited" : server.limits.memory} MB
DISK: ${server.limits.disk === 0 ? "Unlimited" : server.limits.disk} MB
CPU: ${server.limits.cpu}%`
    );
    if (akunlo) {
      bot.sendAnimation(u, akunlo, {
        caption: `Hai @${u}

 |[ DATA PANEL KAMU ]|
🌐 Login : ${domain}
👤 Username : ${user.username}
🔐 Password : ${password} 

|[ RULES ]|
JANGAN DDOS SERVER 
WAJIB TUTUP DOMAIN SAAT SCREENSHOT
JNGAN BAGIKAN DOMAIN KE SIAPAPUN
JANGAN LUPA GANTI PASSWORD PANEL
ADMIN CUMA KASIH DATA 1X
NO RUSUH MAKASIH ITU AJA

CPANEL BY @Fhkryxz`,
      });
      bot.sendMessage(
        chatId,
        "Data panel berhasil dikirim ke ID Telegram yang dimaksud."
      );
    }
  } else {
    bot.sendMessage(chatId, "Gagal membuat data panel. Silakan coba lagi.");
  }
});
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// 9gb
bot.onText(/\/9gb (.+)/, async (msg, match) => {
  if (!checkGroupOnly(msg)) return;
  
  const chatId = msg.chat.id;
  const text = match[1];
  const premiumUsers = JSON.parse(fs.readFileSync(premiumUsersFile));
  const isPremium = premiumUsers.includes(String(msg.from.id));
  if (!isPremium) {
    bot.sendMessage(chatId, "KHUSUS PREMIUM ❌", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "OWNER", url: "https://t.me/Fhkryxz" }],
        ],
      },
    });
    return;
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /9gb namapanel,idtele");
    return;
  }
  const username = t[0];
  const u = t[1];
  const name = username + "9gb";
  const egg = settings.eggs;
  const loc = settings.loc;
  const memo = "9048";
  const cpu = "260";
  const disk = "9048";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}@Fhkry.xyz`;
  const akunlo = settings.pp;
  const password = `${username}001`;
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(
          chatId,
          "Email already exists. Please use a different email."
        );
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_18",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
      `BERIKUT DATA PANEL ANDA
NAMA: ${username}
EMAIL: ${email}
ID: ${user.id}
MEMORY: ${server.limits.memory === 0 ? "Unlimited" : server.limits.memory} MB
DISK: ${server.limits.disk === 0 ? "Unlimited" : server.limits.disk} MB
CPU: ${server.limits.cpu}%`
    );
    if (akunlo) {
      bot.sendAnimation(u, akunlo, {
        caption: `Hai @${u}

|[ DATA PANEL KAMU ]|
🌐 Login : ${domain}
👤 Username : ${user.username}
🔐 Password : ${password} 

|[ RULES ]|
JANGAN DDOS SERVER 
WAJIB TUTUP DOMAIN SAAT SCREENSHOT
JNGAN BAGIKAN DOMAIN KE SIAPAPUN
JANGAN LUPA GANTI PASSWORD PANEL
ADMIN CUMA KASIH DATA 1X
NO RUSUH MAKASIH ITU AJA

CPANEL BY @Fhkryxz`,
      });
      bot.sendMessage(
        chatId,
        "Data panel berhasil dikirim ke ID Telegram yang dimaksud."
      );
    }
  } else {
    bot.sendMessage(chatId, "Gagal membuat data panel. Silakan coba lagi.");
  }
});
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// 10gb
bot.onText(/\/10gb (.+)/, async (msg, match) => {
  if (!checkGroupOnly(msg)) return;
  
  const chatId = msg.chat.id;
  const text = match[1];
  const premiumUsers = JSON.parse(fs.readFileSync(premiumUsersFile));
  const isPremium = premiumUsers.includes(String(msg.from.id));
  if (!isPremium) {
    bot.sendMessage(chatId, "KHUSUS PREMIUM ❌", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "OWNER", url: "https://t.me/Fhkryxz" }],
        ],
      },
    });
    return;
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /10gb namapanel,idtele");
    return;
  }
  const username = t[0];
  const u = t[1];
  const name = username + "10gb";
  const egg = settings.eggs;
  const loc = settings.loc;
  const memo = "10000";
  const cpu = "290";
  const disk = "10000";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}@Fhkry.xyz`;
  const akunlo = settings.pp;
  const password = `${username}001`;
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(
          chatId,
          "Email already exists. Please use a different email."
        );
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_18",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
      `BERIKUT DATA PANEL ANDA
NAMA: ${username}
EMAIL: ${email}
ID: ${user.id}
MEMORY: ${server.limits.memory === 0 ? "Unlimited" : server.limits.memory} MB
DISK: ${server.limits.disk === 0 ? "Unlimited" : server.limits.disk} MB
CPU: ${server.limits.cpu}%`
    );
    if (akunlo) {
      bot.sendAnimation(u, akunlo, {
        caption: `Hai @${u}
 |[ DATA PANEL KAMU ]|
🌐 Login : ${domain}
👤 Username : ${user.username}
🔐 Password : ${password} 

|[ RULES ]|
JANGAN DDOS SERVER 
WAJIB TUTUP DOMAIN SAAT SCREENSHOT
JNGAN BAGIKAN DOMAIN KE SIAPAPUN
JANGAN LUPA GANTI PASSWORD PANEL
ADMIN CUMA KASIH DATA 1X
NO RUSUH MAKASIH ITU AJA

CPANEL BY @Fhkryxz`,
      });
      bot.sendMessage(
        chatId,
        "Data panel berhasil dikirim ke ID Telegram yang dimaksud."
      );
    }
  } else {
    bot.sendMessage(chatId, "Gagal membuat data panel. Silakan coba lagi.");
  }
});
bot.onText(/\/11gb (.+)/, async (msg, match) => {
  if (!checkGroupOnly(msg)) return;
  
  const chatId = msg.chat.id;
  const text = match[1];
  const premiumUsers = JSON.parse(fs.readFileSync(premiumUsersFile));
  const isPremium = premiumUsers.includes(String(msg.from.id));
  if (!isPremium) {
    bot.sendMessage(chatId, "KHUSUS PREMIUM ❌", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "OWNER", url: "https://t.me/Fhkryxz" }],
        ],
      },
    });
    return;
  }
  const t = text.split(",");
  if (t.length < 2) {
    bot.sendMessage(chatId, "Invalid format. Usage: /10gb namapanel,idtele");
    return;
  }
  const username = t[0];
  const u = t[1];
  const name = username + "10gb";
  const egg = settings.eggs;
  const loc = settings.loc;
  const memo = "11000";
  const cpu = "290";
  const disk = "10000";
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const email = `${username}@Fhkry.xyz`;
  const akunlo = settings.pp;
  const password = `${username}001`;
  let user;
  let server;
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(
          chatId,
          "Email already exists. Please use a different email."
        );
      } else {
        bot.sendMessage(
          chatId,
          `Error: ${JSON.stringify(data.errors[0], null, 2)}`
        );
      }
      return;
    }
    user = data.attributes;
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_18",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });
    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }
  if (user && server) {
    bot.sendMessage(
      chatId,
      `BERIKUT DATA PANEL ANDA
NAMA: ${username}
EMAIL: ${email}
ID: ${user.id}
MEMORY: ${server.limits.memory === 0 ? "Unlimited" : server.limits.memory} MB
DISK: ${server.limits.disk === 0 ? "Unlimited" : server.limits.disk} MB
CPU: ${server.limits.cpu}%`
    );
    if (akunlo) {
      bot.sendAnimation(u, akunlo, {
        caption: `Hai @${u}

|[ DATA PANEL KAMU ]|
🌐 Login : ${domain}
👤 Username : ${user.username}
🔐 Password : ${password}

|[ RULES ]|
JANGAN DDOS SERVER 
WAJIB TUTUP DOMAIN SAAT SCREENSHOT
JNGAN BAGIKAN DOMAIN KE SIAPAPUN
JANGAN LUPA GANTI PASSWORD PANEL
ADMIN CUMA KASIH DATA 1X
NO RUSUH MAKASIH ITU AJA

CPANEL BY @Fhkryxz`,
      });
      bot.sendMessage(
        chatId,
        "Data panel berhasil dikirim ke ID Telegram yang dimaksud."
      );
    }
  } else {
    bot.sendMessage(chatId, "Gagal membuat data panel. Silakan coba lagi.");
  }
});

// unli
bot.onText(/\/unli (.+)/, async (msg, match) => {
  if (!checkGroupOnly(msg)) return;
  
  const chatId = msg.chat.id;
  const text = match[1];
  const premiumUsers = JSON.parse(fs.readFileSync(premiumUsersFile));
  const isPremium = premiumUsers.includes(String(msg.from.id));

  if (!isPremium) {
    return bot.sendMessage(chatId, "KHUSUS PREMIUM ❌", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "OWNER", url: "https://t.me/Fhkryxz" }],
        ],
      },
    }); // <-- STOP semua eksekusi di sini
  }

  const t = text.split(",");
  if (t.length < 2) {
    return bot.sendMessage(chatId, "Invalid format. Usage: /unli namapanel,idtele");
  }

  const username = t[0];
  const u = t[1];
  const name = username + "unli";
  const egg = settings.eggs;
  const loc = settings.loc;
  const memo = "0";
  const cpu = "0";
  const disk = "0";
  const email = `${username}@unli.Fhkryxz`;
  const akunlo = settings.pp;
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
  const password = `${username}001`;
  let user;
  let server;

  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: email,
        username: username,
        first_name: username,
        last_name: username,
        language: "en",
        password: password,
      }),
    });

    const data = await response.json();

    if (data.errors) {
      if (
        data.errors[0].meta.rule === "unique" &&
        data.errors[0].meta.source_field === "email"
      ) {
        bot.sendMessage(chatId, "Email&user telah ada di panel Fhkryy.");
      } else {
        bot.sendMessage(chatId, `Error: ${JSON.stringify(data.errors[0], null, 2)}`);
      }
      return;
    }

    user = data.attributes;

    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name: name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_18",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });

    const data2 = await response2.json();
    server = data2.attributes;
  } catch (error) {
    bot.sendMessage(chatId, `Error: ${error.message}`);
  }

  if (user && server) {
    bot.sendMessage(
      chatId,
      `BERIKUT DATA PANEL ANDA
NAMA: ${username}
EMAIL: ${email}
ID: ${user.id}
MEMORY: ${server.limits.memory === 0 ? "Unlimited" : server.limits.memory} MB
DISK: ${server.limits.disk === 0 ? "Unlimited" : server.limits.disk} MB
CPU: ${server.limits.cpu}%`
    );

    if (akunlo) {
      bot.sendAnimation(u, akunlo, {
        caption: `Hai @${u}

|[ DATA PANEL KAMU ]|
🌐 Login : ${domain}
👤 Username : ${user.username}
🔐 Password : ${password}

|[ RULES ]|
JANGAN DDOS SERVER 
WAJIB TUTUP DOMAIN SAAT SCREENSHOT
JNGAN BAGIKAN DOMAIN KE SIAPAPUN
JANGAN LUPA GANTI PASSWORD PANEL
ADMIN CUMA KASIH DATA 1X
NO RUSUH MAKASIH ITU AJA

CPANEL BY @Fhkryxz`,
      });

      bot.sendMessage(chatId, "Data panel berhasil dikirim ke ID Telegram yang dimaksud.");
    }
  } else {
    bot.sendMessage(chatId, "Gagal membuat data panel. Silakan coba lagi.");
  }
});

//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// cadmin
bot.onText(/\/cadmin (.+)/, async (msg, match) => {
  if (!checkGroupOnly(msg)) return;
  
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const adminUsers = JSON.parse(fs.readFileSync(adminfile));
  const isAdmin = adminUsers.includes(String(msg.from.id));
  if (!isAdmin) {
    bot.sendMessage(
      chatId,
      "KHUSUS OWNER ❌",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "OWNER", url: "https://t.me/Fhkryxz" }],
          ],
        },
      }
    );
    return;
  }
  const commandParams = match[1].split(",");
  const panelName = commandParams[0].trim();
  const telegramId = commandParams[1].trim();
  if (commandParams.length < 2) {
    bot.sendMessage(
      chatId,
      "Format Salah! Penggunaan: /cadmin namapanel,idtele"
    );
    return;
  }
  const password = panelName + "117";
  try {
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email: `${panelName}@admin.Fhkryxz`,
        username: panelName,
        first_name: panelName,
        last_name: "Memb",
        language: "en",
        root_admin: true,
        password: password,
      }),
    });
    const data = await response.json();
    if (data.errors) {
      bot.sendMessage(chatId, JSON.stringify(data.errors[0], null, 2));
      return;
    }
    const user = data.attributes;
    const userInfo = `
TYPE: user
➟ ID: ${user.id}
➟ USERNAME: ${user.username}
➟ EMAIL: ${user.email}
➟ NAME: ${user.first_name} ${user.last_name}
➟ LANGUAGE: ${user.language}
➟ ADMIN: ${user.root_admin}
➟ CREATED AT: ${user.created_at}
    `;
    bot.sendMessage(chatId, userInfo);
    bot.sendMessage(
      telegramId,
      `
|[ INFO DATA ADMIN PANEL ]|
🌐  Login : ${domain}
👤  Username : ${user.username}
🔐  Password : ${password} 

|[ RULES ]| 
NO DDOS
NO CPU 90%
NO RUN BOT NET
NO INTIP SERVER
NO RUSUH
SIMPAN DATA BAIK" KARNA ADMIN CUMA NGIRIM DATA 1X

CADMIN BY @Fhkryxz
    `
    );
  } catch (error) {
    console.error(error);
    bot.sendMessage(
      chatId,
      "Terjadi kesalahan dalam pembuatan admin. Silakan coba lagi nanti."
    );
  }
});
fs.readFile(adminfile, (err, data) => {
  if (err) {
    console.error(err);
  } else {
    adminIDs = JSON.parse(data);
  }
});
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// listsrv
bot.onText(/\/listsrv/, async (msg) => {
  if (!checkGroupOnly(msg)) return;
  
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  // Check if the user is the Owner
  const adminUsers = JSON.parse(fs.readFileSync(adminfile));
  const isAdmin = adminUsers.includes(String(msg.from.id));
  if (!isAdmin) {
    bot.sendMessage(
      chatId,
      "KHUSUS OWNER ❌.",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "OWNER", url: "https://t.me/Fhkryxz" }],
          ],
        },
      }
    );
    return;
  }
  let page = 1; // Mengubah penggunaan args[0] yang tidak didefinisikan sebelumnya
  try {
    let f = await fetch(`${domain}/api/application/servers?page=${page}`, {
      // Menggunakan backticks untuk string literal
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
    });
    let res = await f.json();
    let servers = res.data;
    let messageText = "Daftar server aktif yang dimiliki:\n\n";
    for (let server of servers) {
      let s = server.attributes;

      let f3 = await fetch(
        `${domain}/api/client/servers/${s.uuid.split("-")[0]}/resources`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${pltc}`,
          },
        }
      );
      let data = await f3.json();
      let status = data.attributes ? data.attributes.current_state : s.status;

      messageText += `ID Server: ${s.id}\n`;
      messageText += `Nama Server: ${s.name}\n`;
      messageText += `Status: ${status}\n\n`;
    }

    bot.sendMessage(chatId, messageText);
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "Terjadi kesalahan dalam memproses permintaan.");
  }
});
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// listadmin
bot.onText(/\/listadmin/, async (msg) => {
  if (!checkGroupOnly(msg)) return;
  
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const adminUsers = JSON.parse(fs.readFileSync(adminfile));
  const isAdmin = adminUsers.includes(String(msg.from.id));
  if (!isAdmin) {
    bot.sendMessage(
      chatId,
      "KHUSUS OWNER ❌",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "OWNER", url: "https://t.me/Fhkryxz" }],
          ],
        },
      }
    );
    return;
  }
  let page = "1";
  try {
    let f = await fetch(`${domain}/api/application/users?page=${page}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
    });
    let res = await f.json();
    let users = res.data;
    let messageText = "Berikut list admin :\n\n";
    for (let user of users) {
      let u = user.attributes;
      if (u.root_admin) {
        messageText += `🆔 ID: ${u.id} - 🌟 Status: ${
          u.attributes?.user?.server_limit === null ? "Inactive" : "Active"
        }\n`;
        messageText += `${u.username}\n`;
        messageText += `${u.first_name} ${u.last_name}\n\n`;
        messageText += "BY Fhkryxz";
      }
    }
    messageText += `Page: ${res.meta.pagination.current_page}/${res.meta.pagination.total_pages}\n`;
    messageText += `Total Admin: ${res.meta.pagination.count}`;
    const keyboard = [
      [
        {
          text: "🔙 BACK",
          callback_data: JSON.stringify({
            action: "back",
            page: parseInt(res.meta.pagination.current_page) - 1,
          }),
        },
        {
          text: "🔜 NEXT",
          callback_data: JSON.stringify({
            action: "next",
            page: parseInt(res.meta.pagination.current_page) + 1,
          }),
        },
      ],
    ];
    bot.sendMessage(chatId, messageText, {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
    
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// listusr
bot.onText(/\/listusr/, async (msg) => {
  if (!checkGroupOnly(msg)) return;
  
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!adminUsers.includes(String(userId))) { // Masalah utama di sini (tanda kurung berlebihan)
    return bot.sendMessage(chatId, "❌ Perintah ini hanya untuk Owner", {
      reply_markup: {
        inline_keyboard: [[{ text: "Hubungi Owner", url: "https://t.me/Fhkryxz" }]]
      }
    });
  }

  try {
    const response = await fetch(`${domain}/api/application/users`, {
      headers: {
        "Authorization": `Bearer ${plta}`,
        "Content-Type": "application/json"
      }
    });
    
    const data = await response.json();
    let message = "📋 Daftar User:\n\n";
    
    data.data.forEach(user => {
      message += `🆔 ${user.attributes.id}\n`;
      message += `👤 ${user.attributes.username}\n`;
      message += `📧 ${user.attributes.email}\n`;
      message += `👑 ${user.attributes.root_admin ? 'Admin' : 'User'}\n`;
      message += `⏳ ${new Date(user.attributes.created_at).toLocaleString()}\n\n`;
    });
    
    bot.sendMessage(chatId, message);
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "❌ Gagal mengambil daftar user");
  }
}); // Penutup yang benar

//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// delusr
bot.onText(/\/delusr (.+)/, async (msg, match) => {
  if (!checkGroupOnly(msg)) return;
  
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const targetUserId = match[1];
  
  if (!adminUsers.includes(String(userId))) {
    return bot.sendMessage(chatId, "❌ Perintah ini hanya untuk Owner", {
      reply_markup: {
        inline_keyboard: [[{ text: "Hubungi Owner", url: "https://t.me/Fhkryxz" }]]
      }
    });
  }

  try {
    const response = await fetch(`${domain}/api/application/users/${targetUserId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${plta}`,
        "Content-Type": "application/json"
      }
    });
    
    if (response.ok) {
      bot.sendMessage(chatId, `✅ User ${targetUserId} berhasil dihapus`);
    } else {
      bot.sendMessage(chatId, `❌ Gagal menghapus user ${targetUserId}`);
    }
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "❌ Terjadi kesalahan saat menghapus user");
  }
});
   
    //▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
    // batas akhir
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "Terjadi kesalahan dalam memproses permintaan.");
  }
});
