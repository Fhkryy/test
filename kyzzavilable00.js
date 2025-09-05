const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const os = require('os');
const { BOT_TOKEN, OWNER_IDS, CHANNEL_USERNAME } = require('./config.js');
const DATA_FILE = 'data.json';
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
let autoShareInterval = null;
let autoShareMessage = null;
const BOT_START_TIME = Date.now();
const bcCooldown = new Map(); 

const defaultData = {
  premium: {},
  owner: OWNER_IDS,
  groups: [],
  user_group_count: {},
  users: []
};
//-----------------------------------------------------------------------------------------------------------------------
function loadData() {
  try {
    const file = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(file);
  } catch {
    return defaultData;
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ✅ Owner utama dari config.js
function isMainOwner(id) {
  return OWNER_IDS.map(String).includes(String(id));
}

// ✅ Owner tambahan dari data.json
function isAdditionalOwner(id) {
  const data = loadData();
  return Array.isArray(data.owner) && data.owner.map(String).includes(String(id));
}

// ✅ Cek apakah dia owner utama atau owner tambahan
function isAnyOwner(id) {
  return isMainOwner(id) || isAdditionalOwner(id);
}

// ✅ Masih bisa dipakai kalau mau cek owner tambahan saja
function isOwner(id) {
  return isAnyOwner(id);
}

function isPremium(id) {
  const data = loadData();
  const exp = data.premium[id];
  if (!exp) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  return nowSec < exp;
}
//-----------------------------------------------------------------------------------------------------------------------
const { writeFileSync, existsSync, mkdirSync } = require('fs');

function backupData() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = './backup';
  const backupPath = `${backupDir}/data-${timestamp}.json`;

  if (!existsSync(backupDir)) mkdirSync(backupDir);
  if (!existsSync(DATA_FILE)) return null;
  const content = fs.readFileSync(DATA_FILE);
  writeFileSync(backupPath, content);

  return backupPath;
}
//-----------------------------------------------------------------------------------------------------------------------
// === HANDLE BOT DITAMBAHKAN / DIKELUARKAN ===
bot.on('my_chat_member', async (msg) => {
  try {
    const data = loadData();
    const chat = msg.chat || msg.chat_member?.chat;
    const user = msg.from;
    const status = msg.new_chat_member?.status;
    const chatId = chat?.id;
    const userId = user?.id;

    if (!chat || !user || !status || !chatId || !userId) return;

    const isGroup = chat.type === 'group' || chat.type === 'supergroup';
    const mainOwner = OWNER_IDS[0]; // hanya owner utama

    // === BOT DITAMBAHKAN ===
    if (['member', 'administrator'].includes(status)) {
      if (isGroup && !data.groups.includes(chatId)) {
        data.groups.push(chatId);

        if (!data.user_group_count) data.user_group_count = {};
        if (!data.premium) data.premium = {};

        data.user_group_count[userId] = (data.user_group_count[userId] || 0) + 1;
        const total = data.user_group_count[userId];

        let memberCount = 0;
        try {
          memberCount = await bot.getChatMemberCount(chatId).catch(() => 0);
        } catch {
          memberCount = 0;
        }

        if (memberCount >= 20) { // ✅ minimal 20 member
          const sekarang = Math.floor(Date.now() / 1000);
          let durasiDetik = 0;

          if (total >= 10) {
            durasiDetik = 0; // permanen
            data.premium[userId] = "permanent";
          } else {
            const hari = Math.floor(total / 2);
            if (hari > 0) {
              durasiDetik = hari * 86400;
              const current = data.premium[userId] || sekarang;
              data.premium[userId] = current > sekarang ? current + durasiDetik : sekarang + durasiDetik;
            }
          }

          // Pesan ke user
          if (durasiDetik > 0) {
            bot.sendMessage(userId,
              `🎉 Kamu berhasil menambahkan bot ke ${total} grup (member ≥ 20).\n` +
              `✅ Akses Premium diberikan selama *${Math.floor(durasiDetik / 86400)} hari*!`,
              { parse_mode: "Markdown" }
            ).catch(() => {});
          } else if (total >= 10) {
            bot.sendMessage(userId,
              `🎉 Kamu berhasil menambahkan bot ke ${total} grup!\n` +
              `✅ Akses Premium diberikan *PERMANEN*!`,
              { parse_mode: "Markdown" }
            ).catch(() => {});
          }

          // Info ke owner utama
          const info = `
⬡ Username: @${user.username || "-"}
⬡ ID User: \`${userId}\`
⬡ Nama Grup: ${chat.title}
⬡ ID Grup: \`${chatId}\`
⬡ Total Grup Ditambahkan: ${total}
⬡ Member Grup: ${memberCount}
`.trim();

          bot.sendMessage(mainOwner, `➕ Bot Ditambahkan ke grup baru!\n\n${info}`, {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [[
                { text: `${user.first_name}`, url: `tg://user?id=${userId}` }
              ]]
            }
          }).catch(() => {});

          const backupPath = backupData();
          if (backupPath) {
            bot.sendDocument(mainOwner, backupPath, {}, { filename: `data-backup.json` }).catch(() => {});
          }

        } else {
          bot.sendMessage(userId,
            `⚠️ Grup ${chat.title} hanya punya ${memberCount} member.\n❌ Tidak memenuhi syarat (minimal 20 member).`
          ).catch(() => {});
        }

        saveData(data);
      }
    }

    // === BOT DIKELUARKAN ===
    if (['left', 'kicked', 'banned', 'restricted'].includes(status)) {
      if (isGroup && data.groups.includes(chatId)) {
        data.groups = data.groups.filter(id => id !== chatId);

        if (!data.user_group_count) data.user_group_count = {};
        if (!data.premium) data.premium = {};

        if (data.user_group_count[userId]) {
          data.user_group_count[userId]--;

          if (data.user_group_count[userId] < 2) {
            delete data.premium[userId];

            bot.sendMessage(userId,
              `❌ Kamu menghapus bot dari grup.\n🔒 Akses Premium otomatis dicabut.`
            ).catch(() => {});

            let memberCount = 0;
            try {
              memberCount = await bot.getChatMemberCount(chatId).catch(() => 0);
            } catch {
              memberCount = 0;
            }

            const info = `
⬡ Username: @${user.username || "-"}
⬡ ID User: \`${userId}\`
⬡ Nama Grup: ${chat.title}
⬡ ID Grup: \`${chatId}\`
⬡ Total Grup Saat Ini: ${data.user_group_count[userId] || 0}
⬡ Member Grup: ${memberCount}
`.trim();

            bot.sendMessage(mainOwner,
              `⚠️ ${user.first_name} (${userId}) menghapus bot dari grup.\n❌ Premium dicabut.\n\n${info}`,
              {
                parse_mode: "Markdown",
                reply_markup: {
                  inline_keyboard: [[
                    { text: `${user.first_name}`, url: `tg://user?id=${userId}` }
                  ]]
                }
              }
            ).catch(() => {});
          }
        }

        saveData(data);
      }
    }
  } catch (err) {
    console.error("❌ Error my_chat_member:", err);
  }
});

// === CRON / CLEANER AUTO DELETE PREMIUM EXPIRED ===
setInterval(() => {
  const data = loadData();
  const now = Math.floor(Date.now() / 1000);

  for (const uid in data.premium) {
    if (data.premium[uid] <= now) {
      delete data.premium[uid];
      console.log(`🔒 Premium expired & dicabut untuk ${uid}`);

      // ✅ Kirim notifikasi expired
      bot.sendMessage(uid, "⚠️ Masa aktif Premium kamu sudah *expired*.", {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💎 Buy Akses", url: "https://t.me/Fhkryxz" }]
          ]
        }
      }).catch(() => {});
    }
  }

  saveData(data);
}, 60 * 1000); // cek tiap 1 menit

//-----------------------------------------------------------------------------------------------------------------------
// 🔹 Fungsi cek apakah user sudah join channel
async function checkChannelMembership(userId) {
  try {
    const chatMember = await bot.getChatMember(CHANNEL_USERNAME, userId);
    return ["member", "administrator", "creator"].includes(chatMember.status);
  } catch (err) {
    return false;
  }
}

// 🔹 Middleware untuk cek join
async function requireJoin(msg) {
  const userId = msg.from.id;
  const isMember = await checkChannelMembership(userId);

  if (!isMember) {
    await bot.sendMessage(userId, "🚫 *Kamu belum bergabung Join Channel Di Bawah Untuk Memakai Bot!*", {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "📢 Gabung Channel", url: `https://t.me/${CHANNEL_USERNAME.replace('@','')}` }],
          [{ text: "🔁 Coba Lagi", callback_data: "check_join_again" }]
        ]
      }
    });
    return false;
  }
  return true;
}

// 🔹 Helper untuk membungkus command dengan requireJoin
function withRequireJoin(handler) {
  return async (msg, match) => {
    const ok = await requireJoin(msg);
    if (!ok) return;
    return handler(msg, match);
  };
}

// 🔹 Handler untuk tombol "Coba Lagi"
// === Handler Callback Join Channel ===
bot.on("callback_query", async (query) => {
  const userId = query.from.id;

  if (query.data === "check_join_again") {
    const isMember = await checkChannelMembership(userId);

    if (isMember) {
      await bot.sendMessage(userId, "✅ Makasih Kamu Sudah Join");
    } else {
      await bot.sendMessage(
        userId,
        "❌ Lu Belum Join Tolol."
      );
    }

    // jawab callback biar loading nya hilang
    bot.answerCallbackQuery(query.id);
  }
});
//-----------------------------------------------------------------------------------------------------------------------
// ✅ Edit menu helper
async function editMenu(chatId, messageId, caption, buttons) {
  try {
    await bot.editMessageMedia(
      {
        type: 'photo',
        media: getRandomImage(),
        caption,
        parse_mode: 'HTML',
      },
      {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: buttons.reply_markup,
      }
    );
  } catch (error) {
    console.error('Error editing menu:', error);
    bot.sendMessage(chatId, 'Maaf, terjadi kesalahan saat mengedit pesan.');
  }
}

// ✅ Ambil gambar random
function getRandomImage() {
  const images = [
    'https://files.catbox.moe/lcxowb.jpg'
  ];
  return images[Math.floor(Math.random() * images.length)];
}
//-----------------------------------------------------------------------------------------------------------------------
let botUsername = "MyBot"; 
bot.getMe().then(info => {
  botUsername = info.username;
}).catch(err => {
  console.error("❌ Gagal ambil username bot:", err.message);
});

// === START COMMAND DENGAN ANIMASI CUSTOM ===
// State laporan user & reply owner
const userReportState = new Map();
const replyState = new Map();

// START
// START
bot.onText(/\/start/, withRequireJoin(async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();

  // Abaikan pesan /start lama
  if ((msg.date * 1000) < BOT_START_TIME) return;

  const data = loadData();

  if (isBlacklisted(userId)) return bot.sendMessage(chatId, "⛔ Kamu masuk blacklist.").catch(() => {});

  if (checkFastSpam(userId, "/start")) {
    OWNER_IDS.forEach(owner => {
      bot.sendMessage(owner, `🚨 User ter-blacklist karena spam cepat:\n\n🆔 <code>${userId}</code>\n👤 ${msg.from.first_name}`, { parse_mode: "HTML" });
    });
    return bot.sendMessage(chatId, "⛔ Kamu terdeteksi spam dan masuk blacklist.").catch(() => {});
  }

  await sendNotif(msg.from, "/start");

  if (!data.users.includes(userId)) {
    data.users.push(userId);
    saveData(data);
  }

  // Animasi loading singkat
  let tempMsg = await bot.sendMessage(chatId, "JASEB XORIZO").catch(() => {});
  await new Promise(r => setTimeout(r, 1000));
  if (tempMsg) bot.deleteMessage(chatId, tempMsg.message_id).catch(() => {});

  tempMsg = await bot.sendMessage(chatId, "DEVELOPER: @Fhkryxz").catch(() => {});
  await new Promise(r => setTimeout(r, 1000));
  if (tempMsg) bot.deleteMessage(chatId, tempMsg.message_id).catch(() => {});

  tempMsg = await bot.sendMessage(chatId, "VERSION: 1.5").catch(() => {});
  await new Promise(r => setTimeout(r, 1000));
  if (tempMsg) bot.deleteMessage(chatId, tempMsg.message_id).catch(() => {});

  // Menu utama
  const caption = `
<blockquote>JASEB XORIZO</blockquote>
⬡ Author : @Fhkryxz
⬡ Version : 1.5
⬡ Roam : ${data.groups.length}
⬡ Users : ${data.users.length}
<blockquote>JASEB 1.5
© @Fhkryxz</blockquote>`;

  const buttons = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'JASHER MENU', callback_data: 'sharemenu' },
          { text: 'OWNER MENU', callback_data: 'ownermenu' }
        ],
        [
          { text: 'HELP', callback_data: 'help' }
        ],
        [
          { text: 'OWNER', url: 'https://t.me/Fhkryxz' },
          { text: 'ADD GROUP', url: `https://t.me/${botUsername}?startgroup=true` }
        ]
      ]
    }
  };

  const sentMsg = await bot.sendPhoto(chatId, getRandomImage(), {
    caption,
    parse_mode: 'HTML',
    ...buttons
  }).catch(() => {});

  if (sentMsg) {
    data.lastMenuMessage = { chatId, messageId: sentMsg.message_id };
    saveData(data);
  }
}));


// HANDLER CALLBACK
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const userId = query.from.id.toString();
  const dataCb = query.data;
  const data = loadData();

  // HELP
  if (dataCb === "help") {
    userReportState.set(userId, true);
    await bot.sendMessage(chatId, "🆘 Silakan ketik laporanmu sekarang.\nPesan pertama yang kamu kirim akan langsung dikirim ke Owner.", {
      reply_markup: { inline_keyboard: [[{ text: "KEMBALI", callback_data: "startback" }]] }
    }).catch(() => {});
    return bot.answerCallbackQuery(query.id, { text: "⚡ Execution Fhkryy" });
  }

  // OWNER MENU
  if (dataCb === "ownermenu") {
    const isOwner = OWNER_IDS.includes(userId);
    const isPremium = data.premium && data.premium[userId];

    if (!isOwner && !isPremium) {
      return bot.answerCallbackQuery(query.id, {
        text: "⛔ Can Only Be Used Premium User or Owner",
        show_alert: true
      });
    }

    const caption = `
<blockquote>JASEB XORIZO</blockquote>
⬡ Author : @Fhkryxz
⬡ Version : 1.5
⬡ Roam : ${data.groups.length}
⬡ Users : ${data.users.length}

⨳ OWNER MENU
• /addownjs
• /delownjs
• /addakses 
• /delakses
• /listakses
• /addbl
• /delbl
• /listbl

⨳ TOOLS MENU
• /promote 
• /demote 
• /mute
• /unmute
• /open
• /close
• /del
• /ping
• /cekid`;

    const buttons = { reply_markup: { inline_keyboard: [[{ text: "KEMBALI", callback_data: "startback" }]] } };
    await editMenu(chatId, messageId, caption, buttons);

    return bot.answerCallbackQuery(query.id, { text: "⚡ Execution Fhkryy" });
  }

  // SHARE MENU
  if (dataCb === "sharemenu") {
    const caption = `
<blockquote>JASEB XORIZO</blockquote>
⬡ Author : @Fhkryxz
⬡ Version : 1.5
⬡ Roam : ${data.groups.length}
⬡ Users : ${data.users.length}

⨳ SHARE MENU
• /sharemsg
• /broadcast
• /settxt
• /setjeda
• /auto on/off
• /auto status`;

    const buttons = { reply_markup: { inline_keyboard: [[{ text: "KEMBALI", callback_data: "startback" }]] } };
    await editMenu(chatId, messageId, caption, buttons);

    return bot.answerCallbackQuery(query.id, { text: "⚡ Execution Fhkryy" });
  }

  // STARTBACK
  if (dataCb === "startback") {
    const caption = `<blockquote>JASEB XORIZO</blockquote>
⬡ Author : @Fhkryxz
⬡ Version : 1.5
⬡ Roam : ${data.groups.length}
⬡ Users : ${data.users.length}
<blockquote>JASEB 1.5
© @Fhkryxz</blockquote>`;

    const buttons = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'JASHER MENU', callback_data: 'sharemenu' },
          { text: 'OWNER MENU', callback_data: 'ownermenu' }
        ],
        [
          { text: 'HELP', callback_data: 'help' }
        ],
        [
          { text: 'OWNER', url: 'https://t.me/Fhkryxz' },
          { text: 'ADD GROUP', url: `https://t.me/${botUsername}?startgroup=true` }
        ]
      ]
    }
  };
    await editMenu(chatId, messageId, caption, buttons);

    return bot.answerCallbackQuery(query.id, { text: "⚡ Execution Fhkryy" });
  }

  // REPLY OWNER
  if (dataCb.startsWith("reply_")) {
    const targetUser = dataCb.split("_")[1];
    replyState.set(userId, targetUser);
    await bot.sendMessage(chatId, "✏️ Silakan ketik balasanmu. Pesan ini akan dikirim langsung ke user.", {
      reply_markup: { inline_keyboard: [[{ text: "BATAL", callback_data: "cancel_reply" }]] }
    });
    return bot.answerCallbackQuery(query.id, { text: "⚡ Execution Fhkryy" });
  }

  if (dataCb === "cancel_reply") {
    replyState.delete(userId);
    await bot.sendMessage(chatId, "❌ Balasan dibatalkan.");
    return bot.answerCallbackQuery(query.id, { text: "⚡ Execution Fhkryy" });
  }
});


// MESSAGE HANDLER
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  // Laporan user
  if (userReportState.has(userId) && msg.text && !msg.text.startsWith("/")) {
    const laporan = msg.text;
    const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada";
    const firstName = msg.from.first_name || "";
    const lastName = msg.from.last_name || "";

    const mainOwner = OWNER_IDS[0];

    await bot.sendMessage(mainOwner, `
📌 Ada user mengirim laporan

👤 Nama: ${firstName} ${lastName}
🔗 Username: ${username}
🆔 ID: <code>${userId}</code>

📝 Pesan:
${laporan}
    `, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "👉 BALAS USER", callback_data: `reply_${userId}` }]
        ]
      }
    });

    await bot.sendMessage(chatId, "✅ Laporanmu sudah terkirim ke Owner utama. Harap tunggu respon.");
    userReportState.delete(userId);
  }

  // Balasan owner ke user
  if (replyState.has(userId)) {
    const targetUserId = replyState.get(userId);
    await bot.sendMessage(targetUserId, `📩 Balasan dari Owner:\n\n${msg.text}`);
    await bot.sendMessage(userId, "✅ Pesan berhasil dikirim ke user.");
    replyState.delete(userId);
  }
});

function isBlacklisted(userId) {
  const data = loadData();
  if (!Array.isArray(data.blacklist)) {
    data.blacklist = [];
    saveData(data);
  }
  return data.blacklist.includes(userId);
}

function addBlacklist(userId) {
  const data = loadData();
  if (!Array.isArray(data.blacklist)) data.blacklist = [];
  if (!data.blacklist.includes(userId)) {
    data.blacklist.push(userId);
    saveData(data);
  }
}

function removeBlacklist(userId) {
  const data = loadData();
  if (!Array.isArray(data.blacklist)) data.blacklist = [];
  data.blacklist = data.blacklist.filter(id => id !== userId);
  saveData(data);
}

const spamTracker = new Map();
function checkFastSpam(userId, cmd) {
  const now = Date.now();
  if (!spamTracker.has(userId)) {
    spamTracker.set(userId, []);
  }

  let logs = spamTracker.get(userId).filter(t => now - t < 5000);
  logs.push(now);
  spamTracker.set(userId, logs);

  if (logs.length >= 8) {
    addBlacklist(userId);
    return true;
  }
  return false;
}

// === Tracker Spam Cepat ===
const fastSpam = new Map(); // { userId: { count, first } }

function checkFastSpam(userId, cmd) {
  const now = Date.now();
  let data = fastSpam.get(userId);

  if (!data) {
    data = { count: 1, first: now };
    fastSpam.set(userId, data);
    return false;
  }

  if (now - data.first <= 5000) {
    data.count++;
    if (data.count >= 8) {
      addBlacklist(userId, `Spam cepat (${cmd})`);
      fastSpam.delete(userId);
      return true;
    }
  } else {
    // reset kalau udah lewat 5 detik
    data.count = 1;
    data.first = now;
  }

  fastSpam.set(userId, data);
  return false;
}

//-----------------------------------------------------------------------------------------------------------------------
// === /sharemsg ===
bot.onText(/^\/sharemsg$/, async (msg) => {
  await sendNotif(msg.from, "/sharemsg");
  const chatId = msg.chat.id;
  const senderId = msg.from.id.toString();
  const data = loadData();
  if (isBlacklisted(senderId)) {
    return bot.sendMessage(chatId, "⛔ Kamu masuk blacklist.").catch(() => {});
  }
  
  if (checkFastSpam(senderId, "/sharemsg")) {
    OWNER_IDS.forEach(owner => {
      bot.sendMessage(owner, `User auto blacklist karena spam /sharemsg:\n\nID <code>${senderId}</code>\nUSER ${msg.from.first_name}`, { parse_mode: "HTML" });
    });
    return bot.sendMessage(chatId, "⛔ Kamu terdeteksi spam dan masuk blacklist.").catch(() => {});
  }

  try {
    if (!data.cooldowns) data.cooldowns = {};
    if (!data.cooldowns.share) data.cooldowns.share = {};

    const isMain = isMainOwner(senderId);
    const isOwnerNow = isAnyOwner(senderId);
    const isPremiumUser = data.premium?.[senderId] && Math.floor(Date.now() / 1000) < data.premium[senderId];
    const groupCount = data.user_group_count?.[senderId] || 0;

    // 🔐 Validasi akses
    if (!isOwnerNow && !isPremiumUser && groupCount < 2) {
      return bot.sendMessage(chatId, "⛔ Can Only Be Used Premium User").catch(() => {});
    }

    const now = Math.floor(Date.now() / 1000);
    const lastUse = data.cooldowns.share[senderId] || 0;
    const cooldown = (data.settings?.cooldown?.share || 15) * 60;

    if (!isMain && (now - lastUse) < cooldown) {
      const sisa = cooldown - (now - lastUse);
      const menit = Math.floor(sisa / 60);
      const detik = sisa % 60;
      return bot.sendMessage(chatId, `🕒 Tunggu ${menit} menit ${detik} detik sebelum menggunakan /sharemsg lagi.`).catch(() => {});
    }

    if (!msg.reply_to_message) {
      return bot.sendMessage(chatId, "⚠️ Harap *reply* ke pesan yang ingin kamu bagikan.", { parse_mode: "Markdown" }).catch(() => {});
    }

    if (!isMain) {
      data.cooldowns.share[senderId] = now;
      saveData(data);
    }

    const groups = data.groups || [];
    if (groups.length === 0) {
      return bot.sendMessage(chatId, "⚠️ Tidak ada grup terdaftar untuk share.").catch(() => {});
    }

    const total = groups.length;
    let sukses = 0, gagal = 0;

    await bot.sendMessage(chatId, `📡 Memproses sharemsg ke *${total}* grup/channel...`, { parse_mode: "Markdown" }).catch(() => {});
    const reply = msg.reply_to_message;

    for (const groupId of groups) {
      try {
        if (reply.text) {
          await bot.sendMessage(groupId, reply.text, { parse_mode: "Markdown" }).catch(() =>
            bot.sendMessage(groupId, reply.text).catch(() => {})
          );
        } else if (reply.photo) {
          const fileId = reply.photo[reply.photo.length - 1].file_id;
          await bot.sendPhoto(groupId, fileId, { caption: reply.caption || "" }).catch(() => {});
        } else if (reply.video) {
          await bot.sendVideo(groupId, reply.video.file_id, { caption: reply.caption || "" }).catch(() => {});
        } else if (reply.document) {
          await bot.sendDocument(groupId, reply.document.file_id, { caption: reply.caption || "" }).catch(() => {});
        } else if (reply.sticker) {
          await bot.sendSticker(groupId, reply.sticker.file_id).catch(() => {});
        } else {
          await bot.sendMessage(groupId, "⚠️ Jenis pesan ini belum didukung untuk sharemsg otomatis.").catch(() => {});
        }
        sukses++;
      } catch (err) {
        gagal++;
        console.error(`❌ Gagal kirim ke ${groupId}: ${err.description || err.message}`);
      }
      await new Promise(r => setTimeout(r, 300));
    }

    await bot.sendMessage(chatId, `
✅ Share selesai!

📊 Hasil:
• Total Grup: ${total}
• ✅ Sukses: ${sukses}
• ❌ Gagal: ${gagal}
    `.trim()).catch(() => {});
  } catch (err) {
    console.error("❌ Error fatal di /sharemsg:", err);
    bot.sendMessage(chatId, "⚠️ Terjadi error saat memproses /sharemsg.").catch(() => {});
  }
});

// === /broadcast ===
bot.onText(/^\/broadcast$/, async (msg) => {
  await sendNotif(msg.from, "/broadcast");
  const chatId = msg.chat.id;
  const senderId = msg.from.id.toString();
  const data = loadData();
  if (isBlacklisted(senderId)) {
    return bot.sendMessage(chatId, "⛔ Kamu masuk blacklist.").catch(() => {});
  }

  if (checkFastSpam(senderId, "/broadcast")) {
    OWNER_IDS.forEach(owner => {
      bot.sendMessage(owner, `🚨 User auto blacklist karena spam /broadcast:\n\n🆔 <code>${senderId}</code>\n👤 ${msg.from.first_name}`, { parse_mode: "HTML" });
    });
    return bot.sendMessage(chatId, "⛔ Kamu terdeteksi spam dan masuk blacklist.").catch(() => {});
  }

  try {
    if (!isAnyOwner(senderId)) {
      return bot.sendMessage(chatId, "⛔ Can Only Be Used Owner User").catch(() => {});
    }

    if (!OWNER_IDS.map(String).includes(senderId)) {
      const now = Date.now();
      const last = bcCooldown.get(senderId) || 0;
      const cd = (data.settings?.cooldown?.bcuser || 15) * 60 * 1000;

      if (now - last < cd) {
        const sisa = Math.ceil((cd - (now - last)) / 60000);
        return bot.sendMessage(chatId, `⏳ Cooldown aktif!\nTunggu *${sisa} menit* sebelum bisa broadcast lagi.`, { parse_mode: "Markdown" }).catch(() => {});
      }

      bcCooldown.set(senderId, now);
    }

    if (!msg.reply_to_message) {
      return bot.sendMessage(chatId, "⚠️ Harap *reply* ke pesan yang ingin dibroadcast.", { parse_mode: "Markdown" }).catch(() => {});
    }

    const uniqueUsers = [...new Set(data.users || [])];
    const total = uniqueUsers.length;
    let sukses = 0, gagal = 0;

    await bot.sendMessage(chatId, `📡 Sedang memulai broadcast ke *${total}* user...`, { parse_mode: "Markdown" }).catch(() => {});
    const reply = msg.reply_to_message;

    for (const userId of uniqueUsers) {
      try {
        if (reply.text) {
          await bot.sendMessage(userId, reply.text, { parse_mode: "Markdown" }).catch(() =>
            bot.sendMessage(userId, reply.text).catch(() => {})
          );
        } else if (reply.photo) {
          const fileId = reply.photo[reply.photo.length - 1].file_id;
          await bot.sendPhoto(userId, fileId, { caption: reply.caption || "" }).catch(() => {});
        } else if (reply.document) {
          await bot.sendDocument(userId, reply.document.file_id, { caption: reply.caption || "" }).catch(() => {});
        } else if (reply.video) {
          await bot.sendVideo(userId, reply.video.file_id, { caption: reply.caption || "" }).catch(() => {});
        } else {
          await bot.sendMessage(userId, "⚠️ Jenis pesan ini belum bisa dibroadcast.").catch(() => {});
        }
        sukses++;
      } catch (err) {
        gagal++;
        console.error(`❌ Gagal broadcast ke ${userId}: ${err.description || err.message}`);
      }
      await new Promise(r => setTimeout(r, 300));
    }

    await bot.sendMessage(chatId, `
✅ Broadcast selesai!

📊 Hasil:
• Total User: ${total}
• ✅ Sukses: ${sukses}
• ❌ Gagal: ${gagal}
    `.trim()).catch(() => {});
  } catch (err) {
    console.error("❌ Error fatal di /broadcast:", err);
    bot.sendMessage(msg.chat.id, "⚠️ Terjadi error saat memproses /broadcast.").catch(() => {});
  }
});

//-----------------------------------------------------------------------------------------------------------------------
// === /settxt [pesan] ===
bot.onText(/^\/settxt(?:\s+([\s\S]+))?$/, async (msg, match) => {
  const senderId = msg.from.id.toString();
  const chatId = msg.chat.id;

  if (!isAnyOwner(senderId)) {
    return bot.sendMessage(chatId, "⛔ Can Only Be Used Owner");
  }

  const teks = match[1];
  const reply = msg.reply_to_message;

  if (!teks && !reply) {
    return bot.sendMessage(chatId, "⚠️ Gunakan:\n- `/settxt pesan anda`\n- Reply ke pesan lalu ketik `/settxt`", { parse_mode: "Markdown" });
  }

  // Mode 1: langsung teks
  if (teks) {
    autoShareMessage = {
      type: "text",
      content: teks,
      chatId,
      messageId: msg.message_id
    };
    return bot.sendMessage(chatId, `✅ Pesan AutoShare (teks) berhasil di-set:\n\n"${teks}"`);
  }

  // Mode 2: reply ke pesan (bisa teks/media)
  if (reply) {
    if (reply.text) {
      autoShareMessage = {
        type: "text",
        content: reply.text,
        chatId,
        messageId: reply.message_id
      };
      return bot.sendMessage(chatId, `✅ Pesan AutoShare (reply teks) berhasil di-set:\n\n"${reply.text}"`);
    } else {
      autoShareMessage = {
        type: "reply",
        chatId,
        messageId: reply.message_id
      };
      return bot.sendMessage(chatId, `✅ Pesan AutoShare (reply media) berhasil di-set.`);
    }
  }
});

// === /autoshare on/off ===
bot.onText(/^\/auto (on|off)$/, async (msg, match) => {
  const senderId = msg.from.id.toString();
  const chatId = msg.chat.id;
  const data = loadData(); // ambil data.json

  if (!isAnyOwner(senderId)) {
    return bot.sendMessage(chatId, "⛔ Can Only Be Used Owner");
  }

  const mode = match[1].toLowerCase();

  if (mode === "on") {
    if (autoShareInterval) {
      return bot.sendMessage(chatId, "⚠️ AutoShare sudah aktif.");
    }

    if (!autoShareMessage) {
      return bot.sendMessage(chatId, "❌ Belum ada pesan yang di-set.\nGunakan `/settxt` dulu.");
    }

    // ambil jeda menit dari setting (default 15 menit kalau belum di-set)
    const jedaMenit = data.settings?.cooldown?.default || 15;
    const jedaMs = jedaMenit * 60 * 1000;

    bot.sendMessage(chatId, `✅ AutoShare diaktifkan.\nBot akan otomatis share setiap *${jedaMenit} menit*.`, { parse_mode: "Markdown" });

    autoShareInterval = setInterval(async () => {
      const groups = loadData().groups || [];
      if (groups.length === 0) return;

      let sukses = 0, gagal = 0;

      // 🔔 Notif ke semua Owner bahwa autoshare dimulai
      OWNER_IDS.forEach(owner => {
        bot.sendMessage(owner, `📡 AutoShare dimulai...\nTotal Grup: ${groups.length}`);
      });

      for (const groupId of groups) {
        try {
          if (autoShareMessage.type === "reply") {
            await bot.copyMessage(groupId, autoShareMessage.chatId, autoShareMessage.messageId);
          } else if (autoShareMessage.type === "text") {
            await bot.sendMessage(groupId, autoShareMessage.content);
          }
          sukses++;
        } catch (err) {
          gagal++;
          console.error(`❌ Gagal autoshare ke ${groupId}:`, err.message);
        }
        await new Promise(r => setTimeout(r, 500));
      }

      // 🔔 Notif ke semua Owner bahwa autoshare selesai
      OWNER_IDS.forEach(owner => {
        bot.sendMessage(owner, `✅ AutoShare selesai.\n📊 Total: ${groups.length}\n✔️ Sukses: ${sukses}\n❌ Gagal: ${gagal}`);
      });

    }, jedaMs); // interval sesuai setjeda
  }

  if (mode === "off") {
    if (autoShareInterval) {
      clearInterval(autoShareInterval);
      autoShareInterval = null;
      return bot.sendMessage(chatId, "✅ AutoShare dimatikan.");
    } else {
      return bot.sendMessage(chatId, "⚠️ AutoShare belum aktif.");
    }
  }
});

//-----------------------------------------------------------------------------------------------------------------------
// === /autoshare status ===
bot.onText(/^\/auto status$/, async (msg) => {
  const chatId = msg.chat.id;

  if (!isAnyOwner(msg.from.id)) {
    return bot.sendMessage(chatId, "⛔ Can Only Be Used Owner");
  }

  let status = autoShareInterval ? "✅ Aktif" : "❌ Nonaktif";
  let pesan = autoShareMessage
    ? (autoShareMessage.type === "text"
        ? autoShareMessage.content.slice(0, 50) + (autoShareMessage.content.length > 50 ? "..." : "")
        : "📎 Pesan reply (media/teks)")
    : "⚠️ Belum ada pesan diset.";

  bot.sendMessage(chatId, `📡 Status AutoShare:\n- Status: ${status}\n- Pesan: ${pesan}`);
});
//-----------------------------------------------------------------------------------------------------------------------
// === /addownjs <id> ===
bot.onText(/^\/addownjs(?:\s+(\d+))?$/, (msg, match) => {
  const senderId = msg.from.id;

  if (!isMainOwner(senderId)) {
    return bot.sendMessage(senderId, "⛔ Can Only Be Used Owner");
  }

  // Kalau user cuma ketik /addownjs doang → kasih example
  if (!match[1]) {
    return bot.sendMessage(senderId, "⚠️ Contoh penggunaan yang benar:\n\n`/addownjs 123456789`", { parse_mode: "Markdown" });
  }

  const targetId = match[1];
  const data = loadData();

  if (!Array.isArray(data.owner)) data.owner = [];

  if (!data.owner.includes(targetId)) {
    data.owner.push(targetId);
    saveData(data);
    bot.sendMessage(senderId, `✅ User ${targetId} berhasil ditambahkan sebagai owner tambahan.`);
  } else {
    bot.sendMessage(senderId, `⚠️ User ${targetId} sudah menjadi owner tambahan.`);
  }
});

//-----------------------------------------------------------------------------------------------------------------------
// === /setjeda [menit] ===
// Contoh: /setjeda 20
bot.onText(/^\/setjeda(?:\s+(\d+))?$/, async (msg, match) => {
  try {
    const chatId = msg.chat.id;
    const senderId = msg.from.id.toString();

    if (!isAnyOwner(senderId)) {
      return bot.sendMessage(chatId, "⛔ Can Only Be Used Owner").catch(() => {});
    }

    const data = loadData();
    if (!data.settings) data.settings = {};
    if (!data.settings.cooldown) data.settings.cooldown = {};

    const menit = parseInt(match[1]);
    if (!menit || menit <= 0) {
      const current = data.settings.cooldown.default || 15; // default 15 menit
      return bot.sendMessage(
        chatId,
        `⚙️ Cooldown saat ini: *${current} menit*\n\nGunakan: /setjeda 20`,
        { parse_mode: "Markdown" }
      ).catch(() => {});
    }

    data.settings.cooldown.default = menit;
    saveData(data);

    return bot.sendMessage(chatId, `✅ Jeda berhasil diatur ke *${menit} menit*.`, { parse_mode: "Markdown" })
      .catch(() => {});

  } catch (err) {
    console.error("❌ Error di /setjeda:", err);
    bot.sendMessage(msg.chat.id, "⚠️ Terjadi error saat set jeda.").catch(() => {});
  }
});

// === /delownjs <id> ===
bot.onText(/^\/delownjs(?:\s+(\d+))?$/, (msg, match) => {
  const senderId = msg.from.id;

  if (!isMainOwner(senderId)) {
    return bot.sendMessage(senderId, "⛔ Can Only Be Used Owner");
  }

  // Kalau user cuma ketik /delownjs doang → kasih example
  if (!match[1]) {
    return bot.sendMessage(senderId, "⚠️ Contoh penggunaan yang benar:\n\n`/delownjs 123456789`", { parse_mode: "Markdown" });
  }

  const targetId = match[1];
  const data = loadData();

  // Cegah hapus owner utama (dari config.js)
  if (OWNER_IDS.map(String).includes(String(targetId))) {
    return bot.sendMessage(senderId, `❌ Tidak bisa menghapus Owner Utama (${targetId}).`);
  }

  if (Array.isArray(data.owner) && data.owner.includes(targetId)) {
    data.owner = data.owner.filter(id => id !== targetId);
    saveData(data);
    bot.sendMessage(senderId, `✅ User ${targetId} berhasil dihapus dari owner tambahan.`);
  } else {
    bot.sendMessage(senderId, `⚠️ User ${targetId} bukan owner tambahan.`);
  }
});
//-----------------------------------------------------------------------------------------------------------------------
// /addakses <id> <durasi>
bot.onText(/^\/addakses(?:\s+(\d+)\s+(\d+)([dh]))?$/, (msg, match) => {
  const senderId = msg.from.id.toString();
  const chatId = msg.chat.id;

  if (!isOwner(senderId)) {
    return bot.sendMessage(chatId, '⛔ Can Only Be Used Owner');
  }

  const userId = match[1];
  const jumlah = match[2];
  const satuan = match[3];

  if (!userId || !jumlah || !satuan) {
    return bot.sendMessage(chatId, "📌 Contoh penggunaan:\n/addakses 123456789 3d\n\n(d = hari, h = jam)");
  }

  const durasi = parseInt(jumlah);
  let detik;
  if (satuan === 'd') detik = durasi * 86400;
  else if (satuan === 'h') detik = durasi * 3600;
  else return bot.sendMessage(chatId, '❌ Format waktu salah. Gunakan "d" (hari) atau "h" (jam).');

  const now = Math.floor(Date.now() / 1000);
  const data = loadData();
  if (!data.premium) data.premium = {};

  const current = data.premium[userId] || now;
  data.premium[userId] = current > now ? current + detik : now + detik;

  saveData(data);
  const waktuText = satuan === 'd' ? 'hari' : 'jam';
  bot.sendMessage(chatId, `✅ User ${userId} berhasil ditambahkan Premium selama ${durasi} ${waktuText}.`);
});

//-----------------------------------------------------------------------------------------------------------------------
// /delakses <id>
bot.onText(/^\/delakses(?:\s+(\d+))?$/, (msg, match) => {
  const senderId = msg.from.id.toString();
  const chatId = msg.chat.id;

  if (!isOwner(senderId)) {
    return bot.sendMessage(chatId, '⛔ Can Only Be Used Owner');
  }

  const userId = match[1];
  if (!userId) {
    return bot.sendMessage(chatId, "📌 Contoh penggunaan:\n/delakses 123456789");
  }

  const data = loadData();
  if (!data.premium || !data.premium[userId]) {
    return bot.sendMessage(chatId, `❌ User ${userId} tidak ditemukan atau belum premium.`);
  }

  delete data.premium[userId];
  saveData(data);
  bot.sendMessage(chatId, `✅ Premium user ${userId} berhasil dihapus.`);
});

//-----------------------------------------------------------------------------------------------------------------------
// /listakses (tanpa tombol navigasi, versi simple)
bot.onText(/\/listakses/, (msg) => {
  const senderId = msg.from.id.toString();
  const chatId = msg.chat.id;

  if (!isOwner(senderId)) {
    return bot.sendMessage(chatId, "⛔ Can Only Be Used Owner");
  }

  const data = loadData();
  const now = Math.floor(Date.now() / 1000);

  const entries = Object.entries(data.premium || {})
    .map(([uid, exp]) => {
      const sisaJam = Math.floor((exp - now) / 3600);
      return sisaJam > 0 ? `👤 ${uid} - ${sisaJam} jam tersisa` : null;
    })
    .filter(Boolean);

  if (entries.length === 0) {
    return bot.sendMessage(chatId, "📋 Daftar Premium:\n\nBelum ada user Premium.");
  }

  const teks = `📋 Daftar Premium:\n\n${entries.join("\n")}`;
  bot.sendMessage(chatId, teks);
});


// === /cekid ===
bot.onText(/\/cekid/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const firstName = msg.from.first_name || '';
  const lastName = msg.from.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const username = msg.from.username ? '@' + msg.from.username : 'Tidak ada';
  const date = new Date().toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" });

  // Ambil DC ID dari user_id
  const dcId = (userId >> 27) & 7;

  const caption = `
🪪 <b>ID CARD TELEGRAM</b>

👤 <b>Nama</b> : ${fullName}
🆔 <b>User ID</b> : <code>${userId}</code>
🌐 <b>Username</b> : ${username}
🔒 <b>DC ID</b> : ${dcId}
📅 <b>Tanggal</b> : ${date}

© @Fhkryxz
  `;

  try {
    const userProfilePhotos = await bot.getUserProfilePhotos(userId, { limit: 1 });

    if (userProfilePhotos.total_count === 0) throw new Error("No profile photo");

    const fileId = userProfilePhotos.photos[0][0].file_id;

    await bot.sendPhoto(chatId, fileId, {
      caption: caption,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: `${fullName}`, url: `tg://user?id=${userId}` }
          ]
        ]
      }
    });
  } catch (err) {
    await bot.sendMessage(chatId, caption, { parse_mode: 'HTML' });
  }
});


bot.onText(/\/ping/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  if (userId.toString() !== OWNER_IDS[0]) return bot.sendMessage(chatId, '⛔ Can Only Be Used Owner');

  try {
    const uptimeMs = Date.now() - BOT_START_TIME;
    const uptime = formatUptime(Math.floor(uptimeMs / 1000));
    const totalMem = os.totalmem() / (1024 ** 3);
    const freeMem = os.freemem() / (1024 ** 3);
    const cpuModel = os.cpus()[0].model;
    const cpuCores = os.cpus().length;

    const teks = `
<blockquote>
🖥️ Informasi VPS

CPU:${cpuModel}(${cpuCores} CORE)
RAM: ${freeMem.toFixed(2)} GB / ${totalMem.toFixed(2)} GB
Uptime: ${uptime}
</blockquote>
    `.trim();

    bot.sendMessage(chatId, teks, { parse_mode: 'HTML' });
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, '❌ Gagal membaca info VPS.');
  }
});

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${d} hari, ${h} jam, ${m} menit, ${s} detik`;
}

bot.onText(/^\/(open|close)$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const command = match[1].toLowerCase();
  const userId = msg.from.id;

  // Cek apakah di grup
  if (msg.chat.type !== 'group' && msg.chat.type !== 'supergroup') {
    return bot.sendMessage(chatId, '❌ Perintah ini hanya bisa di grup Telegram!');
  }

  // Cek apakah pengirim admin
  try {
    const admins = await bot.getChatAdministrators(chatId);
    const isOwner = admins.some(admin => admin.user.id === userId);
    if (!isOwner) return bot.sendMessage(chatId, '⛔ Can Only Be Used Admin');

    if (command === 'close') {
      await bot.setChatPermissions(chatId, {
        can_send_messages: false
      });
      return bot.sendMessage(chatId, '🔒 Grup telah *dikunci*! Hanya admin yang bisa kirim pesan.', { parse_mode: 'Markdown' });
    }

    if (command === 'open') {
      await bot.setChatPermissions(chatId, {
        can_send_messages: true,
        can_send_media_messages: true,
        can_send_polls: true,
        can_send_other_messages: true,
        can_add_web_page_previews: true,
        can_change_info: false,
        can_invite_users: false,
        can_pin_messages: false
      });
      return bot.sendMessage(chatId, '🔓 Grup telah *dibuka*! Semua member bisa kirim pesan.', { parse_mode: 'Markdown' });
    }

  } catch (err) {
    console.error('Gagal atur izin:', err);
    return bot.sendMessage(chatId, '❌ Terjadi kesalahan saat mengatur grup.');
  }
});

bot.onText(/\/del/, async (msg) => {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;

  if (!msg.reply_to_message) {
    return bot.sendMessage(chatId, "❌ Balas pesan yang ingin dihapus dengan perintah /del.");
  }

  // Cek izin
  const isGroup = msg.chat.type.includes("group");
  const isAllowed = isGroup ? await isOwner(chatId, fromId) || isOwner(fromId) : true;

  if (!isAllowed) {
    return bot.sendMessage(chatId, "⛔ Can Only Be Used Owner Or Admin");
  }

  const targetMessageId = msg.reply_to_message.message_id;

  try {
    await bot.deleteMessage(chatId, targetMessageId);           // hapus pesan target
    await bot.deleteMessage(chatId, msg.message_id);            // hapus command /X
  } catch (err) {
    console.error("Gagal hapus:", err.message);
    bot.sendMessage(chatId, "⚠️ Gagal menghapus pesan.");
  }
});

bot.onText(/\/mute(?:\s+(\d+[a-zA-Z]+|selamanya))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  // Cek apakah yang kirim adalah OWNER
  if (!isOwner(senderId)) {
    return bot.sendMessage(
      chatId,
      "⛔ Can Only Be Used Owner",
      { parse_mode: "Markdown" }
    );
  }

  if (!msg.chat.type.includes('group')) return;
  if (!isOwner(msg.from.id)) return;

  let duration = 60; // default 60 detik
  const raw = match[1];

  if (raw) {
    if (raw.toLowerCase() === 'selamanya') {
      duration = 60 * 60 * 24 * 365 * 100; // 100 tahun
    } else {
      const regex = /^(\d+)(s|m|h|d|w|mo|y)$/i;
      const parts = raw.match(regex);
      if (parts) {
        const value = parseInt(parts[1]);
        const unit = parts[2].toLowerCase();
        const unitMap = { s: 1, m: 60, h: 3600, d: 86400, w: 604800, mo: 2592000, y: 31536000 };
        duration = value * (unitMap[unit] || 60);
      }
    }
  }

  const targetId = msg.reply_to_message?.from?.id;
  if (!targetId) return bot.sendMessage(chatId, "❌ Gunakan reply ke user untuk mute.");

  try {
    const until = Math.floor(Date.now() / 1000) + duration;
    await bot.restrictChatMember(chatId, targetId, {
      can_send_messages: false,
      until_date: until,
    });
    bot.sendMessage(chatId, `🔇 User dimute selama ${raw || '60s'} (${duration} detik)`);
  } catch {
    bot.sendMessage(chatId, "❌ Gagal mute user.");
  }
});

bot.onText(/\/unmute/, async (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  // Cek apakah yang kirim adalah OWNER
  if (!isOwner(senderId)) {
    return bot.sendMessage(
      chatId,
      "⛔ Can Only Be Used Owner",
      { parse_mode: "Markdown" }
    );
  }

  if (!msg.chat.type.includes('group')) return;
  if (!isOwner(msg.from.id)) return;

  const targetId = msg.reply_to_message?.from?.id;
  if (!targetId) return bot.sendMessage(chatId, "❌ Gunakan reply ke user untuk unmute.");

  try {
    await bot.restrictChatMember(chatId, targetId, {
      can_send_messages: true,
      can_send_media_messages: true,
      can_send_other_messages: true,
      can_add_web_page_previews: true,
    });
    bot.sendMessage(chatId, `🔊 User telah di-unmute.`);
  } catch {
    bot.sendMessage(chatId, "❌ Gagal unmute user.");
  }
});

bot.onText(/^\/demote$/, async (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  // Cek apakah yang menjalankan perintah adalah OWNER
  if (String(senderId) !== String(OWNER_IDS)) {
    return bot.sendMessage(chatId, "⛔ Can Only Be Used Owner");
  }

  // Cek apakah ada pesan yang di-reply
  const reply = msg.reply_to_message;
  if (!reply) return bot.sendMessage(chatId, "❌ Balas pesan user yang mau di-demote.");

  const userId = reply.from.id;

  try {
    // Demote user (bikin dia gak bisa mengubah info, delete pesan, dll)
    await bot.promoteChatMember(chatId, userId, {
      can_change_info: false,
      can_delete_messages: false,
      can_invite_users: false,
      can_restrict_members: false,
      can_pin_messages: false,
      can_promote_members: false
    });

    // Kirim pesan berhasil
    bot.sendMessage(chatId, `✅ Sukses demote [user](tg://user?id=${userId}).`, {
      parse_mode: "Markdown"
    });
  } catch (err) {
    // Tangani error dan kirim pesan error yang lebih spesifik
    bot.sendMessage(chatId, `❌ Gagal demote: ${err.response?.description || err.message}`);
  }
});

bot.onText(/^\/promote(?: (.+))?$/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  // Cek apakah yang menjalankan perintah adalah OWNER
  if (String(senderId) !== String(OWNER_IDS)) {
    return bot.sendMessage(chatId, "⛔ Can Only Be Used Owner");
  }

  // Cek apakah ada pesan yang di-reply
  const reply = msg.reply_to_message;
  if (!reply) return bot.sendMessage(chatId, "❌ Balas pesan user yang mau di-promote.");

  const userId = reply.from.id;
  const label = match[1]?.trim(); // Jika ada label untuk custom title

  try {
    // Step 1: Promote user (memberikan izin sebagai admin)
    await bot.promoteChatMember(chatId, userId, {
      can_change_info: false,
      can_delete_messages: false,
      can_invite_users: false,
      can_restrict_members: false,
      can_pin_messages: true,  // Memberikan akses untuk pin message
      can_promote_members: false
    });

    // Step 2: Jika ada label, set sebagai custom admin title
    if (label) {
      await bot.setChatAdministratorCustomTitle(chatId, userId, label);
    }

    const name = reply.from.username ? `@${reply.from.username}` : `[user](tg://user?id=${userId})`;
    const status = label ? `\`${label}\`` : "*Admin*"; // Jika ada label, tampilkan label tersebut

    // Kirim pesan berhasil
    bot.sendMessage(chatId, `✅ ${name} sekarang jadi ${status}`, {
      parse_mode: "Markdown"
    });
  } catch (err) {
    // Tangani error dan kirim pesan error yang lebih spesifik
    bot.sendMessage(chatId, `❌ Gagal promote: ${err.response?.description || err.message}`);
  }
});

// === /addbl <id> ===
bot.onText(/^\/addbl (\d+)$/, (msg, match) => {
  const senderId = msg.from.id.toString();
  if (!isAnyOwner(senderId)) return bot.sendMessage(msg.chat.id, "⛔ Can Only Be Used Owner");

  const targetId = match[1];
  addBlacklist(targetId);
  bot.sendMessage(msg.chat.id, `✅ User <code>${targetId}</code> ditambahkan ke blacklist.`, { parse_mode: "HTML" });
});

// === /delbl <id> ===
bot.onText(/^\/delbl (\d+)$/, (msg, match) => {
  const senderId = msg.from.id.toString();
  if (!isAnyOwner(senderId)) return bot.sendMessage(msg.chat.id, "⛔ Can Only Be Used Owner");

  const targetId = match[1];
  removeBlacklist(targetId);
  bot.sendMessage(msg.chat.id, `✅ User <code>${targetId}</code> dihapus dari blacklist.`, { parse_mode: "HTML" });
});

// === /listbl ===
bot.onText(/^\/listbl$/, (msg) => {
  const senderId = msg.from.id.toString();
  if (!isAnyOwner(senderId)) return bot.sendMessage(msg.chat.id, "⛔ Can Only Be Used Owner");

  const data = loadData();
  const list = Array.isArray(data.blacklist) ? data.blacklist : [];
  if (list.length === 0) {
    return bot.sendMessage(msg.chat.id, "📭 Tidak ada user dalam blacklist.");
  }

  const teks = list.map((id, i) => `${i + 1}. <code>${id}</code>`).join("\n");
  bot.sendMessage(msg.chat.id, `📑 <b>Daftar Blacklist</b>\n\n${teks}`, { parse_mode: "HTML" });
});


// ================= Tambahan di atas =================
const NOTIF_BOT_TOKEN = "TOKEN_LU"; 
const NOTIF_CHAT_ID = "ID_LU";
const notifBot = new TelegramBot(NOTIF_BOT_TOKEN, { polling: false });
// ====================================================

// Helper buat kirim notifikasi
async function sendNotif(user, fitur) {
  const date = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
  const username = user.username ? `@${user.username}` : "-";
  const teks = `
📢 <b>Notifikasi Penggunaan Fitur</b>

📅 <b>Date:</b> ${date}
👤 <b>Username:</b> ${username}
🆔 <b>ID:</b> <code>${user.id}</code>

⚙️ <b>Fitur:</b> ${fitur}
  `.trim();

  await notifBot.sendMessage(NOTIF_CHAT_ID, teks, { parse_mode: "HTML" }).catch(() => {});
}

//-----------------------------------------------------------------------------------------------------------------------
const chalk = require("chalk");

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName =
    msg.from.username ||
    `${msg.from.first_name} ${msg.from.last_name || ""}`.trim();
  const messageText = msg.text || "[Non-text message]";
  const timestamp = new Date().toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
  });

  console.log(chalk.cyan.bold("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
  console.log(
    chalk.hex("#FF4500").bold(
      `📅 Timestamp : ${chalk.white.bold(timestamp)}`
    )
  );
  console.log(
    chalk.hex("#1E90FF").bold(
      `👤 User      : ${chalk.white.underline(userName)} ${chalk.gray(
        `(ID: ${userId})`
      )}`
    )
  );
  console.log(
    chalk.hex("#32CD32").bold(
      `💬 Message   : ${chalk.white.italic(messageText)}`
    )
  );
  console.log(chalk.cyan.bold("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
});

console.log("Telegram bot is running...");
