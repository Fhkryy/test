//Fhkry.js = case.js
require("./settings.js")
const util = require("util");
const chalk = require("chalk");
const fs = require("fs");
const axios = require("axios");
const path = require("path");
const fetch = require("node-fetch");
const { exec, spawn, execSync } = require('child_process');
const { FakeLocation, FakeChannel, FakeSticker } = require("./Event/FakeQuoted.js");
global.modeTimer = null;

const Antilink2 = JSON.parse(fs.readFileSync("./Library/Database/antilink2.json"))
const Antilink = JSON.parse(fs.readFileSync("./Library/Database/antilink.json"))
const Reseller = JSON.parse(fs.readFileSync("./Library/Database/reseller.json"))
const set = JSON.parse(fs.readFileSync("./Library/Database/setbot.json"))
const BlJpm = JSON.parse(fs.readFileSync("./Library/Database/bljpm.json"))
const Developer = JSON.parse(fs.readFileSync("./Library/Database/developer.json"))
const Owners = JSON.parse(fs.readFileSync("./Library/Database/owners.json"))
const OwnerJS = JSON.parse(fs.readFileSync("./Library/Database/ownerjs.json"))

module.exports = async (m, sock, store) => {
 try {
const isCmd = m?.body?.startsWith(m.prefix)
const quoted = m.quoted ? m.quoted : m
const mime = quoted?.msg?.mimetype || quoted?.mimetype || null
const args = m.body.trim().split(/ +/).slice(1)
const qmsg = (m.quoted || m)
const text = q = args.join(" ")
const command = isCmd ? m.body.slice(m.prefix.length).trim().split(' ').shift().toLowerCase() : ''
const cmd = m.prefix + command
const botNumber = await sock.user.id.split(":")[0] + "@s.whatsapp.net";
const isOwner = m.sender === global.owner + "@s.whatsapp.net" || m.sender.includes(botNumber) || Developer.includes(m.sender)
const isReseller = Reseller.includes(m.sender)
const isGrupRess = Reseller.includes(m.chat)
const isOwners = Owners.includes(m.sender) || Owners.includes(m.chat)
const isOwnerJS = OwnerJS.includes(m.sender) || OwnerJS.includes(m.chat)

//=============================================//

try {
  m.isGroup = m.chat.endsWith('g.us');
  if (m.isGroup) {
    let meta = store.get(m.chat)
    if (!meta) meta = await sock.groupMetadata(m.chat)
    m.metadata = meta;
    const p = meta.participants || [];
    m.isAdmin = p.some(i => i.id === m.sender && i.admin !== null);
    m.isBotAdmin = p.some(i => i.id === botNumber && i.admin !== null);
  } else {
    m.metadata = {};
    m.isAdmin = false;
    m.isBotAdmin = false;
  }
} catch {
  m.metadata = {};
  m.isAdmin = false;
  m.isBotAdmin = false;
}

if (isCmd) {
console.log(`
${chalk.cyan('╭───────────────────────────────────╮')}
${chalk.cyan('│ 🎯 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗘𝗫𝗘𝗖𝗨𝗧𝗘𝗗 🎯')}
${chalk.cyan('├───────────────────────────────────┤')}
${chalk.cyan('│ 🛠️ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 :')} ${chalk.yellowBright(m.prefix+command)}
${chalk.cyan('│ 👤 𝐅𝐫𝐨𝐦    :')} ${chalk.greenBright(m.sender.split("@")[0])}
${chalk.cyan('│ 🏠 𝐂𝐡𝐚𝐭    :')} ${chalk.magenta(m.isGroup ? '👥 Group' : '📩 Private Chat')}
${chalk.cyan('╰───────────────────────────────────╯')}
    `);
}

//=============================================//

if (Antilink.includes(m.chat)) {
    const groupInviteLinkRegex = /chat\.whatsapp\.com|buka tautan ini untuk bergabung ke grup whatsapp/gi;
    if (groupInviteLinkRegex.test(m.text) && !isOwner && !m.isAdmin && m.isBotAdmin) {
        const currentGroupLink = `https://chat.whatsapp.com/${await sock.groupInviteCode(m.chat)}`;
        const isLinkFromThisGroup = new RegExp(currentGroupLink, 'i').test(m.text);
        if (isLinkFromThisGroup) {
            return;
        }
        const senderJid = m.sender;
        const messageId = m.key.id;
        const participantToDelete = m.key.participant;
        await m.reply(`🚨 *Peringatan Link Grup Terdeteksi!*

📌 *Pengirim:* @${m.sender.split("@")[0]}

Mohon maaf, membagikan link grup lain di sini tidak diperbolehkan.

Hanya link grup ini yang diizinkan untuk dibagikan.`);
        await sock.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                fromMe: false,
                id: messageId,
                participant: participantToDelete
            }
        });
        await sleep(800);
        await sock.groupParticipantsUpdate(m.chat, [senderJid], "remove");
    }
}

if (Antilink2.includes(m.chat)) {
    const groupInviteLinkRegex = /chat\.whatsapp\.com|buka tautan ini untuk bergabung ke grup whatsapp/gi;
    if (groupInviteLinkRegex.test(m.text) && !isOwner && !m.isAdmin && m.isBotAdmin) {
        const currentGroupLink = `https://chat.whatsapp.com/${await sock.groupInviteCode(m.chat)}`;
        const isLinkFromThisGroup = new RegExp(currentGroupLink, 'i').test(m.text);
        if (isLinkFromThisGroup) {
            return;
        }
        const senderJid = m.sender;
        const messageId = m.key.id;
        const participantToDelete = m.key.participant;
        await m.reply(`🚨 *Peringatan Link Grup Terdeteksi!*

📌 *Pengirim:* @${m.sender.split("@")[0]}

Mohon maaf, membagikan link grup lain di sini tidak diperbolehkan.

Hanya link grup ini yang diizinkan untuk dibagikan.`);
        await sock.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                fromMe: false,
                id: messageId,
                participant: participantToDelete
            }
        });
    }
}

if (set.gruponly && !m.isGroup && !isOwner) {
  return;
}

if (set.antitagowner && m.isGroup && !isOwner) {
  const mentionedJids = m?.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  const mainOwner = global.owner + "@s.whatsapp.net";
  
  const isTaggingMainOwner = mentionedJids.includes(mainOwner);
  
  if (isTaggingMainOwner) {
    const warningText = set.antitagowner_text || "Jangan tag owner!";
    
    try {
      // Hapus pesan jika bot admin
      if (m.isBotAdmin) {
        await sock.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: m.key.id,
            participant: m.sender
          }
        });
      }
      
      await sock.sendMessage(
        m.chat, 
        { 
          text: `@${m.sender.split('@')[0]}\n${warningText}`,
          mentions: [m.sender]
        },
        { quoted: m }
      );
      // Jeda Pengiriman Text Selanjutnya
      await sleep(3000);
      
    } catch (error) {
      console.error("Error in antitagowner:", error);
    }
  }
}

if (m.chat.endsWith('@s.whatsapp.net') && !m.fromMe && global.owner && set.autoblock === true) {
    const sender = m.sender.split("@")[0];
    const notif = `
*📛 Notifikasi Autoblock Pesan*

• Pengirim: ${sender}
• Tag: @${sender}
• Alasan: Mengirim pesan pribadi ke bot tanpa izin.
`;
    await sock.sendMessage(botNumber, {
        text: notif.trim(),
        mentions: [m.sender]
    }, { quoted: m });
    await sock.updateBlockStatus(m.sender, "block");
}


const CHANNELS_FILE = "./Library/Database/idchannel.json";

// Fungsi untuk memuat data saluran dari file
function loadChannels() {
if (fs.existsSync(CHANNELS_FILE)) {
return JSON.parse(fs.readFileSync(CHANNELS_FILE, "utf-8"));
}
return [];
}

function saveChannels(data) {
fs.writeFileSync(CHANNELS_FILE, JSON.stringify(data, null, 2));
}

global.channels = loadChannels();

global.autoJpmchInterval = null;
global.autoJpmchMessage = null;
global.autoJpmchMedia = null;

if (!global.FhkryxzOfficial) global.FhkryxzOfficial = {}

function reply(teks, jids = m.chat, mention = []) {
  sock.sendMessage(jids, {
    text: teks,
    contextInfo: {
      mentionedJid: [...mention]
    }
  }, { quoted: m });
}

//=============================================//

switch (command) {
case "menu": {
let teksnya = `
╭───⧁ 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍 𝐁𝐎𝐓 ⧁───╮
│ ➣  𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫 : 𝐅𝐡𝐤𝐫𝐲𝐱𝐳 𝐎𝐟𝐟𝐢𝐜𝐢𝐚𝐥
│ ➣  𝐕𝐞𝐫𝐬𝐢𝐨𝐧 𝐁𝐨𝐭 : 𝟓.𝟎.𝟎
│ ➣  𝐍𝐚𝐦𝐞 𝐁𝐨𝐭 : 𝐗𝐨𝐫𝐢𝐳𝐨 𝐁𝐨𝐭𝐳
│ ➣  𝐌𝐨𝐝𝐞 : ${sock.public ? "𝐏𝐮𝐛𝐥𝐢𝐜" : "𝐒𝐞𝐥𝐟"}
│ ➣  𝐑𝐮𝐧𝐭𝐢𝐦𝐞 : ${runtime(process.uptime())}  
╰─⧁═══════════════════⧁─╯

╭────⧁ 𝐀𝐊𝐒𝐄𝐒 𝐌𝐄𝐍𝐔 ⧁─────╮  
✦  𝐏𝐢𝐥𝐢𝐡 𝐁𝐮𝐭𝐭𝐨𝐧 𝐃𝐚𝐧 𝐍𝐢𝐤𝐦𝐚𝐭𝐢 𝐅𝐢𝐭𝐮𝐫
╰─⧁══════════════════⧁─╯
`;

await sock.sendMessage(m.chat, {
    footer: `© Fhkryxz Official`,
    buttons: [
        {
            buttonId: 'action',
            buttonText: { displayText: 'ini pesan interactiveMeta' },
            type: 4,
            nativeFlowInfo: {
                name: 'single_select',
                paramsJson: JSON.stringify({
                    title: '𝐋𝐢𝐬𝐭 𝐌𝐞𝐧𝐮',
                    sections: [
                        {
                            title: 'List Menu',
                            highlight_label: 'Xorizo Botz 👑',
                            rows: [
                                {
                                    header: 'All Fitur',
                                    title: 'All Menu',
                                    description: 'Melihat semua fitur bot',
                                    id: '.allmenu'
                                },
                                {
                                    header: 'Jpmch X Jpm',
                                    title: 'Menu Jpmch X Jpm',
                                    description: 'Fitur khusus untuk JPM & JPMCH',
                                    id: '.jpmchxjpmmenu'
                                },
                                {
                                    header: 'Pembelian Script Xorizo',
                                    title: 'Script Xorizo 👑',
                                    description: 'Melihat harga dan benefit script bot xorizo',
                                    id: '.buyscxorizo'
                                }
                            ]
                        }
                    ]
                })
            }
        },
        {
            buttonId: `.owner`,
            buttonText: { displayText: '𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫' },
            type: 1
        }
    ],
    headerType: 1,
    viewOnce: true,
    document: fs.readFileSync("./package.json"),
    fileName: `By ${namaOwner} </>`,
    mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileLength: 99999999,
    caption: teksnya,
    contextInfo: {
        isForwarded: true,
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
            newsletterJid: global.idChannel,
            newsletterName: global.nameChannel
        },
        externalAdReply: {
            title: `${namebot} - ${global.versi}`,
            body: `📍 Runtime : ${runtime(process.uptime())}`,
            thumbnailUrl: global.thumbnail,
            sourceUrl: linkChannel,
            mediaType: 1,
            renderLargerThumbnail: true,
        },
    },
});
    }
    break


case "allmenu": {
  const teks = `
Здравствуйте, разрешите представиться Xorizo Botz, Я готов вам помочь.

╔════𓊈 бот Информационный 𓊉════⊱
║
║✵ Name Bot : ${namebot}
║✵ Versi Bot : ${versi}
║✵ Mode Bot : ${sock.public ? "Public" : "Self"}
║✵ Developer Bot : https://t.me/Fhkryxz
║
╚═══════𓊈 XORIZO BOTZ 𓊉════════❍
 
╔══════𓊈 *Other Menu* 𓊉═════⊱
║
║➣ .tourl
║➣ .tourl2
║➣ .sticker
║➣ .stickerwm
║➣ .hidetag
║➣ .readviewonce
║➣ .ocr
║➣ .hd
║
╚═══════════════════❍

╔══════𓊈 *Jpmch Menu* 𓊉═════⊱
║
║➣ .autojpmch on/off
║➣ .autojpmch setpesan
║➣ .autojpmch setinterval
║➣ .autojpmch setdelay
║➣ .autojpmch status
║➣ .jpmch
║➣ .jpmch2
║➣ .jpmch3
║➣ .jpmchoff
║➣ .jpmchon
║➣ .jpmchvip
║➣ .jpmchvip2
║➣ .jpmchvip3
║➣ .addidch
║➣ .addallid
║➣ .delidch
║➣ .listidch
║➣ .cekidch
║➣ .unbl
║➣ .sync
║
╚═══════════════════❍

╔══════𓊈 *Akses Jasher Menu* 𓊉═════⊱
║
║➣ .addallownjs
║➣ .addownjs
║➣ .delownjs
║➣ .listownjs
║➣ .resetownjs
║➣ .addallptjs
║➣ .addptjs
║➣ .delptjs
║➣ .listptjs
║➣ .resetptjs
║
╚═══════════════════❍

╔══════𓊈 *Jpm Menu* 𓊉═════⊱
║
║➣ .autojpm on/off
║➣ .autojpm status
║➣ .autojpm delay
║➣ .jpm
║➣ .jpmfoto
║➣ .jpmvideo
║➣ .jpmht
║➣ .blacklistjpm
║➣ .delblacklistjpm
║➣ .setjedajpm
║
╚═══════════════════❍

╔══════𓊈 *Pushkontak Menu* 𓊉═════⊱
║ 
║➣ .pushkontak
║➣ .pushkontak2
║➣ .savekontak
║➣ .save
║➣ .stoppush
║➣ .setjedapushkontak
║
╚═══════════════════❍

╔══════𓊈 *Installer Menu* 𓊉═════⊱
║
║➣ .installpanel
║➣ .startwings
║➣ .uninstallpanel
║➣ .hbpanel
║➣ .subdomain
║
╚═══════════════════❍

╔══════𓊈 *Panel Menu Reseller* 𓊉═════⊱
║
║➣ .1gb
║➣ .2gb
║➣ .3gb
║➣ .4gb
║➣ .5gb
║➣ .6gb
║➣ .7gb
║➣ .8gb
║➣ .9gb
║➣ .10gb
║➣ .unli
║➣ .cadmin
║➣ .deladmin
║➣ .listpanel
║➣ .delpanel
║➣ .addseller
║➣ .listseller
║➣ .delseller
║➣ .delpanel-all
║➣ .addaksesgc
║➣ .listakses
║➣ .delaksesgc
║
╚═══════════════════❍

╔══════𓊈 *Panel Menu Owner* 𓊉═════⊱
║
║➣ .1gb-v2
║➣ .2gb-v2
║➣ .3gb-v2
║➣ .4gb-v2
║➣ .5gb-v2
║➣ .6gb-v2
║➣ .7gb-v2
║➣ .8gb-v2
║➣ .9gb-v2
║➣ .10gb-v2
║➣ .unli-v2
║➣ .cadmin-v2
║➣ .deladmin-v2
║➣ .listpanel-v2
║➣ .delpanel-v2
║➣ .delpanel-all-v2
║
╚═══════════════════❍

╔══════𓊈 *Panel Settings Menu* 𓊉═════⊱
║
║➣ .listconfig
║➣ .updomain <link>
║➣ .upapikey <ptla>
║➣ .upcapikey <ptlc>
║➣ .updomain-v2 <link>
║➣ .upapikey-v2 <ptla>
║➣ .upcapikey-v2 <ptlc>
║
╚═══════════════════❍

╔══════𓊈 *Bot Settings Menu* 𓊉═════⊱
║
║➣ .statusbot
║➣ .statusgrup
║➣ .autoblock
║➣ .anticall
║➣ .welcome
║➣ .gconly
║➣ .antitagowner
║➣ .setthumbnail
║➣ .antilink
║➣ .antilink2
║
╚═══════════════════❍

╔══════𓊈 *Owner Menu* 𓊉═════⊱
║
║➣ .payment
║➣ .done
║➣ .proses
║➣ .addcase
║➣ .getcase
║➣ .listcase
║➣ .delcase
║➣ .self
║➣ .public
║➣ .backup
║➣ .publictimer
║➣ .selftimer
║
╚═══════════════════❍
`;
await sock.sendMessage(m.chat, {
    buttons: [
        {
            buttonId: `.owner`,
            buttonText: { displayText: '𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫' },
            type: 1
        },
    ],
    image: { url: global.thumbnail }, 
    caption: teks,
    contextInfo: {
        mentionedJid: [m.sender, `${global.owner}@s.whatsapp.net`],
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: global.idChannel,
            newsletterName: global.namaChannel,
            serverId: 200
        },
        externalAdReply: {
            thumbnailUrl: global.thumbnail,
            title: global.title, 
            renderLargerThumbnail: true,
            mediaType: 1
        }
    }
}, { quoted: FakeChannel });
}
break

case "jpmchxjpmmenu": {
 const teks = `
Здравствуйте, разрешите представиться Xorizo Botz, Я готов вам помочь.

╔════𓊈 бот Информационный 𓊉════⊱
║
║✵ Name Bot : ${namebot}
║✵ Versi Bot : ${versi}
║✵ Mode Bot : ${sock.public ? "Public" : "Self"}
║✵ Developer Bot : https://t.me/Fhkryxz
║
╚═══════𓊈 XORIZO BOTZ 𓊉════════❍

╔══════𓊈 *Jpmch Menu* 𓊉═════⊱
║
║➣ .autojpmch on/off
║➣ .autojpmch setpesan
║➣ .autojpmch setinterval
║➣ .autojpmch setdelay
║➣ .autojpmch status
║➣ .jpmch
║➣ .jpmch2
║➣ .jpmch3
║➣ .jpmchoff
║➣ .jpmchon
║➣ .jpmchvip
║➣ .jpmchvip2
║➣ .jpmchvip3
║➣ .addidch
║➣ .addallid
║➣ .delidch
║➣ .listidch
║➣ .cekidch
║➣ .unbl
║➣ .sync
║
╚═══════════════════❍

╔══════𓊈 *Akses Jasher Menu* 𓊉═════⊱
║
║➣ .addallownjs
║➣ .addownjs
║➣ .delownjs
║➣ .listownjs
║➣ .resetownjs
║➣ .addallptjs
║➣ .addptjs
║➣ .delptjs
║➣ .listptjs
║➣ .resetptjs
║
╚═══════════════════❍

╔══════𓊈 *Jpm Menu* 𓊉═════⊱
║
║➣ .autojpm on/off
║➣ .autojpm status
║➣ .autojpm delay
║➣ .jpm
║➣ .jpmfoto
║➣ .jpmvideo
║➣ .jpmht
║➣ .blacklistjpm
║➣ .delblacklistjpm
║➣ .setjedajpm
║
╚═══════════════════❍
`
await sock.sendMessage(m.chat, {
    buttons: [
        {
            buttonId: `.owner`,
            buttonText: { displayText: '𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫' },
            type: 1
        },
    ],
    image: { url: global.thumbnail }, 
    caption: teks,
    contextInfo: {
        mentionedJid: [m.sender, `${global.owner}@s.whatsapp.net`],
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: global.idChannel,
            newsletterName: global.namaChannel,
            serverId: 200
        },
        externalAdReply: {
            thumbnailUrl: global.thumbnail,
            title: global.title, 
            renderLargerThumbnail: true,
            mediaType: 1
        }
    }
}, { quoted: FakeChannel });
}
break

//-------------------------------------- ALL CASE FITUR --------------------------------------//

case "statusbot": {
  if (!isOwner) return m.reply(mess.owner);
  const cek = (val) => val ? "✅" : "❌";
  return m.reply(`
*Informasi Status Setting Bot*

- Auto Block: ${cek(set.autoblock)}
- Grup Only: ${cek(set.gruponly)}
- Anti Call: ${cek(set.anticall)}
- Welcome: ${cek(set.welcome)}
- Anti Tag Owner: ${cek(set.antitagowner)}
${set.antitagowner ? `- Teks Peringatan: "${set.antitagowner_text}"` : ''}

✅ = Status Aktif
❌ = Status Tidak Aktif
  `);
}
break

case "autoblok": case "autoblock": {
if (!isOwner) return m.reply(mess.owner);
if (!text) return m.reply(`Contoh Penggunaan :\n*${cmd}* on/off`)
if (!/on|off/.test(text)) return m.reply(`Contoh Penggunaan :\n*${cmd}* on/off`)
if (/on/.test(text)) {
set.autoblock = true
await fs.writeFileSync("./Library/Database/setbot.json", JSON.stringify(set, null, 2))
return m.reply(`Berhasil menyalakan autoblock ✅`)
}
if (/off/.test(text)) {
set.autoblock = false
await fs.writeFileSync("./Library/Database/setbot.json", JSON.stringify(set, null, 2))
return m.reply(`Berhasil mematikan autoblock ✅`)
}
}
break

case "gconly": {
if (!isOwner) return m.reply(mess.owner);
if (!text) return m.reply(`*Contoh penggunaan :*
ketik ${cmd} on/off`)
if (!/on|off/.test(text)) return m.reply(`*Contoh penggunaan :*
ketik ${cmd} on/off`)
if (/on/.test(text)) {
set.gruponly = true
await fs.writeFileSync("./Library/Database/setbot.json", JSON.stringify(set, null, 2))
return m.reply(`Berhasil menyalakan mode grup only ✅`)
}
if (/off/.test(text)) {
set.gruponly = false
await fs.writeFileSync("./Library/Database/setbot.json", JSON.stringify(set, null, 2))
return m.reply(`Berhasil mematikan mode grup only ✅`)
}
}
break

case "antitagowner": {
  if (!isOwner) return m.reply(mess.owner);
  
  if (!text) return m.reply(
    `Status: ${set.antitagowner ? "AKTIF ✅" : "NONAKTIF ❌"}\n` +
    `Peringatan: "${set.antitagowner_text || 'default'}"\n\n` +
    `Contoh:\n` +
    `${cmd} on\n` +
    `${cmd} off\n` +
    `${cmd} text Pesan peringatan baru`
  );

  const action = args[0].toLowerCase();
  
  if (action === "on") {
    set.antitagowner = true;
    await fs.writeFileSync("./Library/Database/setbot.json", JSON.stringify(set, null, 2));
    return m.reply("Antitagowner diaktifkan ✅");
  }
  
  if (action === "off") {
    set.antitagowner = false;
    await fs.writeFileSync("./Library/Database/setbot.json", JSON.stringify(set, null, 2));
    return m.reply("Antitagowner dinonaktifkan ✅");
  }
  
  if (action === "text") {
    const newText = args.slice(1).join(" ");
    if (!newText) return m.reply("Masukkan teks peringatan baru");
    
    set.antitagowner_text = newText;
    await fs.writeFileSync("./Library/Database/setbot.json", JSON.stringify(set, null, 2));
    return m.reply(`Teks peringatan diubah menjadi:\n"${newText}"`);
  }
  
  return m.reply("Perintah tidak valid. Gunakan: on/off/text");
}
break

case "welcome": {
    if (!isOwner) return m.reply(mess.owner);
    if (!text) return m.reply(`Contoh Penggunaan :\n*${cmd}* on/off`)
    if (!/on|off/.test(text)) return m.reply(`Contoh Penggunaan :\n*${cmd}* on/off`)
    if (/on/.test(text)) {
        set.welcome = true
        await fs.writeFileSync("./Library/Database/setbot.json", JSON.stringify(set, null, 2))
        return m.reply(`Berhasil menyalakan welcome message ✅`)
    }
    if (/off/.test(text)) {
        set.welcome = false
        await fs.writeFileSync("./Library/Database/setbot.json", JSON.stringify(set, null, 2))
        return m.reply(`Berhasil mematikan welcome message ✅`)
    }
}
break

case "anticall": {
if (!isOwner) return m.reply(mess.owner)
if (!text) return m.reply(`*Contoh penggunaan :*
ketik ${cmd} on/off`)
if (!/on|off/.test(text)) return m.reply(`*Contoh penggunaan :*
ketik ${cmd} on/off`)
if (/on/.test(text)) {
set.anticall = true
await fs.writeFileSync("./Library/Database/setbot.json", JSON.stringify(set, null, 2))
return m.reply(`Berhasil menyalakan anticall ✅`)
}
if (/off/.test(text)) {
set.anticall = false
await fs.writeFileSync("./Library/Database/setbot.json", JSON.stringify(set, null, 2))
return m.reply(`Berhasil mematikan anticall ✅`)
}
}
break

case "statusgrup": {
if (!isOwner) return m.reply(mess.owner);
if (!m.isGroup) return m.reply(mess.group);
const teks = `
- Antilink : ${Antilink.includes(m.chat) ? "✅" : "❌"}
- Antilink2 : ${Antilink2.includes(m.chat) ? "✅" : "❌"}

_✅ = Aktif_
_❌ = Tidak Aktif_
`
return m.reply(teks)
}
break

case "tourl": {
if (!/image|video|audio|application/.test(mime)) return m.reply(`Media tidak ditemukan!\nKetik *${cmd}* dengan reply/kirim media`)
    const FormData = require('form-data');
    const { fromBuffer } = require('file-type');    
    async function dt(buffer) {
        const fetchModule = await import('node-fetch');
        const fetch = fetchModule.default;
        let { ext } = await fromBuffer(buffer);
        let bodyForm = new FormData();
        bodyForm.append("fileToUpload", buffer, "file." + ext);
        bodyForm.append("reqtype", "fileupload");
        let res = await fetch("https://catbox.moe/user/api.php", {
            method: "POST",
            body: bodyForm,
        });
        let data = await res.text();
        return data;
    }

    let aa = m.quoted ? await m.quoted.download() : await m.download();
    let dd = await dt(aa);
    await m.reply(dd)
}
break

case "tourl2": {
if (!/image/.test(mime)) return m.reply(`Media tidak ditemukan!\nKetik *${cmd}* dengan reply/kirim foto`)
    try {
    const { ImageUploadService } = require('node-upload-images');
        let mediaPath = await sock.downloadAndSaveMediaMessage(qmsg);
        const service = new ImageUploadService('pixhost.to');
  let buffer = fs.readFileSync(mediaPath);
  let { directLink } = await service.uploadFromBinary(buffer, 'fhkry.png');
  await m.reply(directLink)
        await fs.unlinkSync(mediaPath);
    } catch (err) {
        console.error("Tourl Error:", err);
        m.reply("Terjadi kesalahan saat mengubah media menjadi URL.");
    }
}
break

case "sticker": case "stiker": case "sgif": case "s": {
if (!/image|video/.test(mime)) return m.reply("Kirim foto dengan caption .sticker")
if (/video/.test(mime)) {
if ((qmsg).seconds > 15) return m.reply("Durasi vidio maksimal 15 detik!")
}
var media = await sock.downloadAndSaveMediaMessage(qmsg)
await sock.sendStimg(m.chat, media, m, {packname: global.title})
}
break

case "stickerwm": case "swm": case "wm": {
if (!text) return reply(`Input wm & reply fotonya\n*contoh:* ${cmd} skyzopedia dengan me-reply foto`); 
if (!/image|video/.test(mime)) return reply(`Input wm & reply fotonya!\n*contoh:* ${cmd} fhkry dengan me-reply foto`); 
if (/video/.test(mime)) {
if ((qmsg).seconds > 15) return reply("Durasi vidio maksimal 15 detik!")
}
var media = await sock.downloadAndSaveMediaMessage(qmsg)
await sock.sendStimg(m.chat, media, m, {packname: text})
await fs.unlinkSync(media)
}
break

case "setthumbnail": {
  if (!isOwner) return m.reply(mess.owner)
  if (!/image/.test(mime)) return m.reply(`Kirim gambar dengan caption *${cmd}* untuk mengganti thumbnail bot`);
  const { ImageUploadService } = require('node-upload-images');
  try {
    let mediaPath = await sock.downloadAndSaveMediaMessage(qmsg);
    const service = new ImageUploadService('pixhost.to');
    let buffer = fs.readFileSync(mediaPath);
    let { directLink } = await service.uploadFromBinary(buffer, 'thumbnail.png');
    
    global.thumbnail = directLink;
    let f = "./settings.js";
    let c = fs.readFileSync(f, "utf8");
    let u = c.replace(/global\.thumbnail\s*=\s*["'].*?["']/, `global.thumbnail = "${directLink}"`);
    fs.writeFileSync(f, u, "utf8");
    
    await m.reply(`Thumbnail bot berhasil diganti ✅\nURL: ${directLink}`);
    fs.unlinkSync(mediaPath);
  } catch (err) {
    console.error("Ganti Thumbnail Error:", err);
    m.reply("Terjadi kesalahan saat mengganti thumbnail.");
  }
}
break

case "ocr": {
    if (!/image/.test(mime)) return m.reply(`Ketik *${cmd}* dengan reply foto`)
    const { ImageUploadService } = require('node-upload-images');
    try {
        let mediaPath = await sock.downloadAndSaveMediaMessage(qmsg);
        const service = new ImageUploadService('pixhost.to');
  let buffer = fs.readFileSync(mediaPath);
  let { directLink } = await service.uploadFromBinary(buffer, 'fhkry.png');
  await fs.unlinkSync(mediaPath);
  const ress = await fetchJson(`https://api-fhkry.vercel.app/tools/ocr?apikey=${global.ApikeyRestApi}&url=${directLink}`)
  await m.reply(ress.result)
    } catch (err) {
        console.error("Ocr Error:", err);
        m.reply("Text dalam foto tidak ditemukan!");
    }
}
break

case "rvo": case "readviewonce": {
if (!isOwner) return m.reply(mess.owner)
if (!m.quoted) return m.reply("reply pesan viewOnce nya!")
let msg = m?.quoted?.message?.imageMessage || m?.quoted?.message?.videoMessage || m?.quoted?.message?.audioMessage || m?.quoted
if (!msg.viewOnce && m.quoted.mtype !== "viewOnceMessageV2" && !msg.viewOnce) return reply("Pesan itu bukan viewonce!")
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
let media = await downloadContentFromMessage(msg, msg.mimetype == 'image/jpeg' ? 'image' : msg.mimetype == 'video/mp4' ? 'video' : 'audio')
    let type = msg.mimetype
    let buffer = Buffer.from([])
    for await (const chunk of media) {
        buffer = Buffer.concat([buffer, chunk])
    }
    if (/video/.test(type)) {
        return sock.sendMessage(m.chat, {video: buffer, caption: msg.caption || ""}, {quoted: m})
    } else if (/image/.test(type)) {
        return sock.sendMessage(m.chat, {image: buffer, caption: msg.caption || ""}, {quoted: m})
    } else if (/audio/.test(type)) {
        return sock.sendMessage(m.chat, {audio: buffer, mimetype: "audio/mpeg", ptt: true}, {quoted: m})
    } 
}
break

case "brat": {
if (!text) return reply(`*Contoh penggunaan :*
ketik ${cmd} teksnya`)
await sock.sendMessage(m.chat, {
  buttons: [
    {
    buttonId: 'action',
    buttonText: { displayText: 'ini pesan interactiveMeta' },
    type: 4,
    nativeFlowInfo: {
        name: 'single_select',
        paramsJson: JSON.stringify({
          title: 'Pilih Type',
          sections: [
            {
              title: `© ${global.namebot} Version ${global.versi}`,
              rows: [
                {
                  title: 'Brat Image',
                  description: 'Sticker brat dengan type foto', 
                  id: `.brat1 ${text}`
                },
                {
                  title: 'Brat Vidio',
                  description: 'Sticker brat dengan type vidio/gif', 
                  id: `.bratvid2 ${text}`
                }             
              ]
            }
          ]
        })
      }
      }
  ],
  headerType: 1,
  viewOnce: true,
  text: "\nPilih Type Sticker Brat (Image/Gif)\n"
}, { quoted: m })
}
break

case "brat1": case "bratvid2": {
if (!text) return
let type = `https://api-fhkry.vercel.app/imagecreator/bratv?apikey=${global.ApikeyRestApi}&text=${text}`
if (/bratvid2/.test(command)) type = `https://api-fhkry.vercel.app/imagecreator/bratvid?apikey=${global.ApikeyRestApi}&text=${text}`
await reply(`Memproses pembuatan sticker . . .`)
await sock.sendStimg(m.chat, type, m, {packname: global.footer})
}
break

case "tohd": case "hd": case "remini": {
    if (!/image/.test(mime)) return m.reply(`*Contoh penggunaan :*\nKirim atau balas foto dengan caption ${cmd}`);
    const { ImageUploadService } = require('node-upload-images');
    const service = new ImageUploadService('pixhost.to');
    let imageBuffer = m.quoted ? await m.quoted.download() : await m.download();
    let { directLink } = await service.uploadFromBinary(imageBuffer, 'hd-image.jpg');
    const ress = await fetchJson(`https://api-fhkry.vercel.app/imagecreator/remini?apikey=${global.ApikeyRestApi}&url=${directLink}`);
    await sock.sendMessage(m.chat, { 
        image: { url: ress.result }, 
        caption: `✅ Gambar berhasil ditingkatkan kualitasnya!` 
    }, { quoted: m });
}
break

case "kick":
case "kik": {
    if (!m.isGroup) return m.reply(mess.group);
    if (!isOwner && !m.isAdmin) return m.reply(mess.admin);
    if (!m.isBotAdmin) return m.reply(mess.botadmin);

    let target;

    if (m.mentionedJid?.[0]) {
        target = m.mentionedJid[0];
    } else if (m.quoted?.sender) {
        target = m.quoted.sender;
    } else if (text) {
        const cleaned = text.replace(/[^0-9]/g, "");
        if (cleaned) target = cleaned + "@s.whatsapp.net";
    }

    if (!target) return m.reply(`*Contoh :* .kick @tag/6283XXX`);

    try {
        await sock.groupParticipantsUpdate(m.chat, [target], "remove");
        return sock.sendMessage(m.chat, {
            text: `✅ Berhasil mengeluarkan @${target.split("@")[0]}`,
            mentions: [target]
        }, { quoted: m });
    } catch (err) {
        console.error("Kick error:", err);
        return m.reply("Gagal mengeluarkan anggota. Coba lagi atau cek hak akses bot.");
    }
}
break

case "closegc":
case "close":
case "opengc":
case "open": {
    if (!m.isGroup) return m.reply(mess.group);
    if (!isOwner && !m.isAdmin) return m.reply(mess.admin);
    if (!m.isBotAdmin) return m.reply(mess.botadmin);

    try {
        const cmd = command.toLowerCase();

        if (cmd === "open" || cmd === "opengc") {
            await sock.groupSettingUpdate(m.chat, 'not_announcement');
            return m.reply("Grup berhasil dibuka! Sekarang semua anggota dapat mengirim pesan.");
        }

        if (cmd === "close" || cmd === "closegc") {
            await sock.groupSettingUpdate(m.chat, 'announcement');
            return m.reply("Grup berhasil ditutup! Sekarang hanya admin yang dapat mengirim pesan.");
        }

    } catch (error) {
        console.error("Error updating group settings:", error);
        return m.reply("Terjadi kesalahan saat mencoba mengubah pengaturan grup.");
    }
}
break

case "ht":
case "hidetag": {
    if (!m.isGroup) return m.reply(mess.group);
    if (!isOwner) return m.reply(mess.owner);
    if (!text) return m.reply(`*Contoh :* ${cmd} pesannya`);
    try {
        if (!m.metadata || !m.metadata.participants) return m.reply("Gagal mendapatkan daftar anggota grup. Coba lagi.");
        const members = m.metadata.participants.map(v => v.id);
        await sock.sendMessage(m.chat, {
            text: text,
            mentions: members
        }, {
            quoted: null
        });
    } catch (error) {
        console.error("Error sending hidetag message:", error);
        return m.reply("Terjadi kesalahan saat mencoba mengirim pesan hidetag.");
    }
}
break

case "antilink": {
    if (!isOwner) return m.reply(mess.owner)
    if (!m.isGroup) return m.reply(mess.group);
    if (!text) return m.reply(`*Contoh :* ${cmd} on/off`);

    const isAntilink = Antilink.includes(m.chat);
    const isAntilink2 = Antilink2.includes(m.chat);

    if (text === "on") {
        if (isAntilink) return m.reply(`Antilink di grup ini sudah aktif!`);
        if (isAntilink2) {
            const posisi = Antilink2.indexOf(m.chat);
            if (posisi !== -1) Antilink2.splice(posisi, 1);
            await fs.writeFileSync("./Library/Database/antilink2.json", JSON.stringify(Antilink2, null, 2));
        }
        Antilink.push(m.chat);
        await fs.writeFileSync("./Library/Database/antilink.json", JSON.stringify(Antilink, null, 2));
        return m.reply(`Berhasil menyalakan antilink di grup ini ✅`);
    }

    if (text === "off") {
        if (!isAntilink) return m.reply(`Antilink di grup ini sudah tidak aktif!`);
        const posisi = Antilink.indexOf(m.chat);
        if (posisi !== -1) Antilink.splice(posisi, 1);
        await fs.writeFileSync("./Library/Database/antilink.json", JSON.stringify(Antilink, null, 2));
        return m.reply(`Berhasil mematikan antilink di grup ini ✅`);
    }
}
break

case "antilink2": {
    if (!isOwner) return m.reply(mess.owner);
    if (!m.isGroup) return m.reply(mess.group);
    if (!text) return m.reply(`*Contoh :* ${cmd} on/off`);

    const isAntilink = Antilink.includes(m.chat);
    const isAntilink2 = Antilink2.includes(m.chat);

    if (text === "on") {
        if (isAntilink2) return m.reply(`Antilink2 di grup ini sudah aktif!`);
        if (isAntilink) {
            const posisi = Antilink.indexOf(m.chat);
            if (posisi !== -1) Antilink.splice(posisi, 1);
            await fs.writeFileSync("./Library/Database/antilink.json", JSON.stringify(Antilink, null, 2));
        }
        Antilink2.push(m.chat);
        await fs.writeFileSync("./Library/Database/antilink2.json", JSON.stringify(Antilink2, null, 2));
        return m.reply(`Berhasil menyalakan antilink2 di grup ini ✅`);
    }

    if (text === "off") {
        if (!isAntilink2) return m.reply(`Antilink2 di grup ini sudah tidak aktif!`);
        const posisi = Antilink2.indexOf(m.chat);
        if (posisi !== -1) Antilink2.splice(posisi, 1);
        await fs.writeFileSync("./Library/Database/antilink2.json", JSON.stringify(Antilink2, null, 2));
        return m.reply(`Berhasil mematikan antilink2 di grup ini ✅`);
    }
}
break

//----------------------------- JPM X PUSHKONTAK -----------------------------//

case "autojpm": {
    if (!isOwner) return m.reply(mess.owner);
    
    const bcPath = "./Library/Database/broadcast.json";

    // Helper untuk memuat & menyimpan broadcast.json
    function loadBC() {
        const raw = fs.readFileSync(bcPath);
        return JSON.parse(raw);
    }
    
    function saveBC(data) {
        fs.writeFileSync(bcPath, JSON.stringify(data, null, 2));
    }

    const bc = loadBC();
    const subCmd = args[0]?.toLowerCase();

    // Menu Bantuan
    if (!subCmd) {
        return m.reply(`📢 *JPM OTOMATIS CONTROL MENU*

┌─ ❏ *Set Teks Autojpm*
│ ➜ .autojpm text <pesan>
│ 
├─ ❏ *Atur Delay*
│ ➜ .autojpm delay <menit> <detik>
│    Contoh: .autojpm delay 5 3
│ • *Delay Putaran*: Jeda antar siklus (dalam *menit*).
│ • *Delay Per Kirim*: Jeda per grup (dalam *detik*).
│
├─ ❏ *Status Autojpm*
│ ➜ .autojpm status
│ 
├─ ❏ *Mulai Autojpm*
│ ➜ .autojpm on
│ 
├─ ❏ *Hentikan Autojpm*
│ ➜ .autojpm stop
│ 
└─ ℹ️ *Blacklisted Groups*: ${BlJpm.length} Group
`);
    }

    if (subCmd === 'text') {
        const bcText = args.slice(1).join(" ").trim();
        if (!bcText) return m.reply('⚠️ Masukkan teks autojpm.\nContoh: .autojpm text Halo semua!');
        bc.text = bcText;
        saveBC(bc);
        return m.reply(`✅ *Teks Autojpm Disimpan!*\n\n"${bc.text}"`);
    }

    if (subCmd === 'delay') {
        const menitPutaran = parseInt(args[1]);
        const detikKirim = parseInt(args[2]);

        if (isNaN(menitPutaran) || isNaN(detikKirim) || menitPutaran < 1 || detikKirim < 1) {
            return m.reply('⚠️ Format salah! Masukkan angka yang valid.\nContoh: .autojpm delay 5 3\n(Minimal 1 menit dan 1 detik)');
        }
        
        bc.delayPutaran = menitPutaran * 60000; // Menit -> milidetik
        bc.delaySend = detikKirim * 1000;      // Detik -> milidetik

        saveBC(bc);
        return m.reply(`✅ *Delay Diatur!*\nPutaran: ${menitPutaran} menit | Per Kirim: ${detikKirim} detik`);
    }

   
    if (subCmd === 'status') {
        const allGroups = await sock.groupFetchAllParticipating();
        const totalGroups = Object.keys(allGroups).length;
        
     
        const putaranDisplay = (bc.delayPutaran / 60000) || 0;
        const kirimDisplay = (bc.delaySend / 1000) || 0;
        
        return m.reply(`📊 *Status Jpm Otomatis*
    
Status: ${bc.status ? '✅ Aktif' : '⏹️ Nonaktif'}
Teks: ${bc.text || 'Belum diatur'}
Delay: ${putaranDisplay} menit (putaran) | ${kirimDisplay} detik (per kirim)
Statistik: ${bc.count} putaran | ${bc.sent} pesan
Grup: ${totalGroups} terhubung | ${BlJpm.length} di-blacklist
`);
    }

 
    if (subCmd === 'stop') {
        bc.status = false;
        saveBC(bc);
        return m.reply('⏹️ *Autojpm Dihentikan!*');
    }

    
    if (subCmd === 'on') {
        if (!bc.text) return m.reply('⚠️ Teks Autojpm belum diatur!\nGunakan: .autojpm text <pesan>');
        
        bc.status = true;
        bc.count = 0;
        bc.sent = 0;
        saveBC(bc);

        m.reply(`▶️ *Autojpm Dimulai!*\n\n"${bc.text}"\n\nGunakan *.autojpm stop* untuk menghentikan.`);

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const doBroadcast = async () => {
            while (loadBC().status) { 
                const allGroups = await sock.groupFetchAllParticipating();
                const groupIds = Object.keys(allGroups);

                for (const groupId of groupIds) {
                    if (!loadBC().status) break;
                    if (BlJpm.includes(groupId)) {
                        console.log(`⏭️ Skip blacklisted group: ${groupId}`);
                        continue;
                    }

                    try {
                        const currentConfig = loadBC();
                        await sock.sendMessage(groupId, { text: currentConfig.text });
                        
                       
                        let latestConfig = loadBC();
                        latestConfig.sent += 1;
                        saveBC(latestConfig);
                        
                        await sleep(latestConfig.delaySend);
                    } catch (err) {
                        console.error(`❌ Gagal kirim ke ${groupId}:`, err);
                    }
                }
                
                if (!loadBC().status) break;

           
                let latestConfig = loadBC();
                latestConfig.count += 1;
                saveBC(latestConfig);
                await sleep(latestConfig.delayPutaran);
            }
        };

        doBroadcast();
    }
}
break

case "jpm": {
    if (!isOwner) return m.reply(mess.owner);
    if (!text) return m.reply("Contoh: .jpm teks promosinya");

    let allgrup = await sock.groupFetchAllParticipating();
    let res = Object.keys(allgrup);
    let count = 0;
    
    await m.reply(`Memproses *JPM Teks* ke ${res.length} grup...`);
    
    for (let i of res) {
        if (BlJpm.includes(i)) {
            console.log(`[JPM SKIPPED] Grup ${i} ada di blacklist.`);
            continue;
        }

        try {
            await sock.sendMessage(i, { text: `${text}` }, { quoted: FakeChannel });
            count++;
        } catch (e) {
            console.error(`[JPM FAILED] Gagal kirim ke grup ${i}:`, e);
        }
        
        await sleep(global.JedaJpm); 
    }
    
    await m.reply(`*JPM Telah Selesai ✅*\nTotal grup yang berhasil dikirim pesan: *${count}* dari *${res.length}* grup.`);
}
break

case "jpmfoto": case "jpmvideo": {
    if (!isOwner) return m.reply(mess.owner);

    const allGrup = await sock.groupFetchAllParticipating();
    const grupList = Object.keys(allGrup);
    if (!grupList.length) return m.reply("❌ Tidak ada grup yang bisa dijangkau.");

    const qmsg = m.quoted || m;
    const mime = (qmsg.msg || qmsg).mimetype || "";
    
    if (!/image|video/.test(mime)) {
        return m.reply("⚠️ Perintah salah! Balas (reply) gambar/video dengan caption `.jpmfoto` atau `.jpmvideo`.");
    }

    const mediaBuffer = await sock.downloadAndSaveMediaMessage(qmsg);
    const senderName = m.pushName || "Owner";
    const captionRaw = text || (m.quoted ? m.quoted.text : '');

    let mediaType = /image/.test(mime) ? "image" : "video";

    const finalCaption = `${captionRaw}

╭─❰ 📣 Disampaikan Oleh ❱─╮
│ 👤 ${senderName}
╰──────────────────────╯`;

    let sukses = 0;

    await m.reply(`📤 *Memulai JPM Media ke ${grupList.length} grup...*\nMohon tunggu hingga proses selesai.`);

    for (let id of grupList) {
        if (BlJpm.includes(id)) {
            console.log(`[JPM SKIPPED] Grup ${id} ada di blacklist.`);
            continue;
        }

        try {
            let mediaMsg = {};
            if (mediaType === "image") {
                mediaMsg.image = fs.readFileSync(mediaBuffer);
            } else {
                mediaMsg.video = fs.readFileSync(mediaBuffer);
            }
            mediaMsg.caption = finalCaption;
            
            await sock.sendMessage(id, mediaMsg, { quoted: m });
            sukses++;
        } catch (err) {
            console.log(`[JPM MEDIA FAILED] Grup ${id}: ${err.message}`);
        }
        
        await sleep(global.JedaJpm);
    }

    fs.unlinkSync(mediaBuffer);

    await m.reply(`✅ *Pengiriman Selesai*\nBerhasil terkirim ke *${sukses}* dari *${grupList.length}* grup.`);
}
break

case "jpmht": {
    if (!isOwner) return m.reply(mess.owner);
    if (!text) return m.reply("Contoh: .jpmht teks promosinya");

    let allgrup = await sock.groupFetchAllParticipating();
    let res = Object.keys(allgrup);
    let count = 0;
    
    await m.reply(`Memproses *JPM Hidetag* ke ${res.length} grup...`);

    for (let i of res) {
        if (BlJpm.includes(i)) {
            console.log(`[JPM SKIPPED] Grup ${i} ada di blacklist.`);
            continue;
        }

        try {
            let metadata = await sock.groupMetadata(i);
            let participants = metadata.participants.map(u => u.id);

            await sock.sendMessage(i, {
                text: text, 
                mentions: participants 
            });

            count++;
        } catch (e) {
            console.error(`[JPM HIDETAG FAILED] Gagal kirim ke grup ${i}:`, e);
        }   
        await sleep(global.JedaJpm);
    }

    await m.reply(`*JPM Hidetag Telah Selesai ✅*\nTotal grup yang berhasil dikirim pesan: *${count}* dari *${res.length}* grup.`);
}
break

case "bljpm": case "bl": {
if (!isOwner) return m.reply(mess.owner);
let rows = []
const a = await sock.groupFetchAllParticipating()
if (a.length < 1) return m.reply("Tidak ada grup chat.")
const Data = Object.values(a)
let number = 0
for (let u of Data) {
const name = u.subject || "Unknown"
rows.push({
title: name,
description: `ID Grup - ${u.id}`, 
id: `.bljpm-response ${u.id}|${name}`
})
}
await sock.sendMessage(m.chat, {
  buttons: [
    {
    buttonId: 'action',
    buttonText: { displayText: 'ini pesan interactiveMeta' },
    type: 4,
    nativeFlowInfo: {
        name: 'single_select',
        paramsJson: JSON.stringify({
          title: 'Pilih Grup',
          sections: [
            {
              title: `List All Grup Chat`,
              rows: rows
            }
          ]
        })
      }
      }
  ],
  headerType: 1,
  viewOnce: true,
  text: `\nPilih Grup Yang Ingin Diblacklist Dari Jpm\n`
}, { quoted: m })
}
break

case "bljpm-response":
case "bl-response": {
    if (!isOwner) return m.reply(mess.owner);
    if (!text || !text.includes("|")) return
    const groupId = text.split("|")[0]
    const names = text.split("|")[1]
    if (BlJpm.includes(groupId)) {
        return m.reply(`Grup ${names} sudah di blacklist dari jpm!`);
    }
    BlJpm.push(groupId);
    try {
        await fs.writeFileSync("./Library/Database/bljpm.json", JSON.stringify(BlJpm, null, 2));
        m.reply(`Berhasil blacklist grup ${names} dari jpm ✅`);
    } catch (err) {
        console.error(err);
        m.reply("Gagal menyimpan data akses. Silakan coba lagi.");
    }
}
break

case "delbl": case "delbljpm": {
if (!isOwner) return m.reply(mess.owner);
if (BlJpm.length < 1) return m.reply("Tidak ada data blacklist grup.")
let rows = []
let number = 0
rows.push({
title: "Hapus semua",
description: `Hapus semua blacklist grup`, 
id: `.delbl-response all`
})
for (let u of BlJpm) {
let name
try {
const g = await sock.groupMetadata(u)
name = g.subject || "Unknown"
} catch {
name = "Unknown"
}
rows.push({
title: name,
description: `ID Grup - ${u}`, 
id: `.delbl-response ${u}|${name}`
})
}
await sock.sendMessage(m.chat, {
  buttons: [
    {
    buttonId: 'action',
    buttonText: { displayText: 'ini pesan interactiveMeta' },
    type: 4,
    nativeFlowInfo: {
        name: 'single_select',
        paramsJson: JSON.stringify({
          title: 'Pilih Grup',
          sections: [
            {
              title: `List All Grup Chat`,
              rows: rows
            }
          ]
        })
      }
      }
  ],
  headerType: 1,
  viewOnce: true,
  text: `\nPilih Grup Yang Ingin Dihapus Dari Data Blacklist\nTotal Grup: ${BlJpm.length}\n`
}, { quoted: m })
}
break

case "delbl-response": {
  if (!isOwner) return m.reply(mess.owner);
  if (BlJpm.length === 0) return m.reply("Tidak ada data blacklist grup.")
  const input = text.split("|")[0]
  const names = text.split("|")[1]
  if (input == "all") {
  BlJpm.length = 0
  fs.writeFileSync("./Library/Database/bljpm.json", JSON.stringify(BlJpm, null, 2))
  return m.reply(`Berhasil menghapus semua blacklist grup dari jpm ✅`)
  }
  if (!BlJpm.includes(input)) {
    return m.reply(`Grup ${names} tidak di blacklist dari jpm!`)
  }
  const index = BlJpm.indexOf(input)
  BlJpm.splice(index, 1)
  fs.writeFileSync("./Library/Database/bljpm.json", JSON.stringify(BlJpm, null, 2))
  return m.reply(`Berhasil menghapus blacklist grup ${names} dari jpm ✅`)
}
break

case "setjeda": {
    if (!isOwner) return m.reply(mess.owner);
    if (!text) return m.reply(`*Contoh :*\n${cmd} push 5000\n${cmd} jpm 6000\n\nKeterangan format waktu:\n1 detik = 1000\n\nJeda waktu saat ini:\nJeda Pushkontak > ${global.JedaPushkontak}\nJeda JPM > ${global.JedaJpm}`);

    let args = text.split(" ");
    if (args.length < 2) return m.reply(`*Contoh :*\n${cmd} push 5000\n${cmd} jpm 6000\n\nKeterangan format waktu:\n1 detik = 1000\n\nJeda waktu saat ini:\nJeda Pushkontak > ${global.JedaPushkontak}\nJeda JPM > ${global.JedaJpm}`);

    let target = args[0].toLowerCase(); // push / jpm
    let value = args[1];

    if (isNaN(value)) return m.reply("Harus berupa angka!");
    let jeda = parseInt(value);

    let fs = require("fs");
    let path = require.resolve("./settings.js");
    let data = fs.readFileSync(path, "utf-8");

    if (target === "push") {
        let newData = data.replace(/global\.JedaPushkontak\s*=\s*\d+/, `global.JedaPushkontak = ${jeda}`);
        fs.writeFileSync(path, newData, "utf-8");
        global.JedaPushkontak = jeda;
        return m.reply(`✅ Berhasil mengubah *Jeda Push Kontak* menjadi *${jeda}* ms`);
    } 
    
    if (target === "jpm") {
        let newData = data.replace(/global\.JedaJpm\s*=\s*\d+/, `global.JedaJpm = ${jeda}`);
        fs.writeFileSync(path, newData, "utf-8");
        global.JedaJpm = jeda;
        return m.reply(`✅ Berhasil mengubah *Jeda JPM* menjadi *${jeda}* ms`);
    }

    return m.reply(`Pilihan tidak valid!\nGunakan: *push* atau *jpm*`);
}
break

case "pushkontak": case "puskontak": {
if (!isOwner) return m.reply(mess.owner)
if (!text) return m.reply(`*Contoh :* ${cmd} pesannya`)
global.textpushkontak = text
let rows = []
const a = await sock.groupFetchAllParticipating()
if (a.length < 1) return m.reply("Tidak ada grup chat.")
const Data = Object.values(a)
let number = 0
for (let u of Data) {
const name = u.subject || "Unknown"
rows.push({
title: name,
description: `Total Member: ${u.participants.length}`, 
id: `.pushkontak-response ${u.id}`
})
}
await sock.sendMessage(m.chat, {
  buttons: [
    {
    buttonId: 'action',
    buttonText: { displayText: 'ini pesan interactiveMeta' },
    type: 4,
    nativeFlowInfo: {
        name: 'single_select',
        paramsJson: JSON.stringify({
          title: 'Pilih Grup',
          sections: [
            {
              title: `© Powered By ${namaOwner}`,
              rows: rows
            }
          ]
        })
      }
      }
  ],
  headerType: 1,
  viewOnce: true,
  text: `\nPilih Target Grup Pushkontak\n`
}, { quoted: m })
}
break

case "pushkontak-response": {
  if (!isOwner) return m.reply(mess.owner)
  if (!global.textpushkontak) return m.reply(`Data teks pushkontak tidak ditemukan!\nSilahkan ketik *.pushkontak* pesannya`);
  const teks = global.textpushkontak
  const jidawal = m.chat
  const data = await sock.groupMetadata(text)
  const halls = data.participants
    .filter(v => v.id && v.id.endsWith('.net'))
    .map(v => v.id)
    .filter(id => id !== botNumber && id.split("@")[0] !== global.owner); 

  await m.reply(`🚀 Memulai pushkontak ke dalam grup ${data.subject} dengan total member ${halls.length}`);
  
  global.statuspush = true
  
 delete global.textpushkontak
 let count = 0
 
  for (const mem of halls) {
    if (global.stoppush) {
    delete global.stoppush
    delete global.statuspush
    break
    }
    await sock.sendMessage(mem, { text: teks }, { quoted: FakeChannel });
    await global.sleep(global.JedaPushkontak);
    count += 1
  }
  
  delete global.statuspush
  await m.reply(`✅ Sukses pushkontak!\nPesan berhasil dikirim ke *${count}* member.`, jidawal)
}
break

case "pushkontak2": case "puskontak2": {
if (!isOwner) return m.reply(mess.owner)
if (!text || !text.includes("|")) return m.reply(`Masukan pesan & nama kontak\n*Contoh :* ${cmd} pesan|namakontak`)
global.textpushkontak = text.split("|")[0]
let rows = []
const a = await sock.groupFetchAllParticipating()
if (a.length < 1) return m.reply("Tidak ada grup chat.")
const Data = Object.values(a)
let number = 0
for (let u of Data) {
const name = u.subject || "Unknown"
rows.push({
title: name,
description: `Total Member: ${u.participants.length}`, 
id: `.pushkontak-response2 ${u.id}|${text.split("|")[1]}`
})
}
await sock.sendMessage(m.chat, {
  buttons: [
    {
    buttonId: 'action',
    buttonText: { displayText: 'ini pesan interactiveMeta' },
    type: 4,
    nativeFlowInfo: {
        name: 'single_select',
        paramsJson: JSON.stringify({
          title: 'Pilih Grup',
          sections: [
            {
              title: `© Powered By ${namaOwner}`,
              rows: rows
            }
          ]
        })
      }
      }
  ],
  headerType: 1,
  viewOnce: true,
  text: `\nPilih Target Grup PushkontakV2\n`
}, { quoted: m })
}
break

case "pushkontak-response2": {
  if (!isOwner) return m.reply(mess.owner)
  if (!global.textpushkontak) return m.reply(`Data teks pushkontak tidak ditemukan!\nSilahkan ketik *.pushkontak2* pesannya|namakontak`);
  const teks = global.textpushkontak
  const jidawal = m.chat
  const data = await sock.groupMetadata(text.split("|")[0])
  const halls = data.participants
    .filter(v => v.id && v.id.endsWith('.net'))
    .map(v => v.id)
    .filter(id => id !== botNumber && id.split("@")[0] !== global.owner); 

  await m.reply(`🚀 Memulai pushkontak autosave kontak ke dalam grup ${data.subject} dengan total member ${halls.length}`);
  
  global.statuspush = true
  
 delete global.textpushkontak
 let count = 0
 
  for (const mem of halls) {
    if (global.stoppush) {
    delete global.stoppush
    delete global.statuspush
    break
    }    
    const contactAction = {
        "fullName": `${text.split("|")[1]} #${mem.split("@")[0]}`,
        "lidJid": mem, 
        "saveOnPrimaryAddressbook": true
    };
    await sock.addOrEditContact(mem, contactAction);
    await sock.sendMessage(mem, { text: teks }, { quoted: FakeChannel });
    await global.sleep(global.JedaPushkontak);
    count += 1
  }
  
  delete global.statuspush
  await m.reply(`✅ Sukses pushkontak!\nTotal kontak berhasil disimpan *${count}*`, jidawal)
}
break

case "savenomor":
case "sv":
case "save": {
    if (!isOwner) return m.reply(mess.owner)

    let nomor, nama

    if (m.isGroup) {
        if (!text) return m.reply(`*Contoh penggunaan di grup:*\n${cmd} @tag|nama\natau reply target dengan:\n${cmd} nama`)

        // Jika ada tag
        if (m.mentionedJid[0]) {
            nomor = m.mentionedJid[0]
            nama = text.split("|")[1]?.trim()
            if (!nama) return m.reply(`Harap tulis nama setelah "|"\n*Contoh:* ${cmd} @tag|nama`)
        } 
        // Jika reply
        else if (m.quoted) {
            nomor = m.quoted.sender
            nama = text.trim()
        } 
        // Jika input manual nomor
        else if (/^\d+$/.test(text.split("|")[0])) {
            nomor = text.split("|")[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net"
            nama = text.split("|")[1]?.trim()
            if (!nama) return m.reply(`Harap tulis nama setelah "|"\n*Contoh:* ${cmd} 628xxxx|nama`)
        } 
        else {
            return m.reply(`*Contoh penggunaan di grup:*\n${cmd} @tag|nama\natau reply target dengan:\n${cmd} nama`)
        }
    } else {
        // Private chat hanya nama
        if (!text) return m.reply(`*Contoh penggunaan di private:*\n${cmd} nama`)
        nomor = m.chat
        nama = text.trim()
    }

    const contactAction = {
        "fullName": nama,
        "lidJid": nomor,
        "saveOnPrimaryAddressbook": true
    };

    await sock.addOrEditContact(nomor, contactAction);

    return m.reply(`✅ Berhasil menyimpan kontak

- Nomor: ${nomor.split("@")[0]}
- Nama: ${nama}`)
}
break

case "savekontak": case "svkontak": {
if (!isOwner) return m.reply(mess.owner)
if (!text) return m.reply(`Masukan namakontak\n*Contoh :* ${cmd} FhkryxzOffc`)
global.namakontak = text
let rows = []
const a = await sock.groupFetchAllParticipating()
if (a.length < 1) return m.reply("Tidak ada grup chat.")
const Data = Object.values(a)
let number = 0
for (let u of Data) {
const name = u.subject || "Unknown"
rows.push({
title: name,
description: `Total Member: ${u.participants.length}`, 
id: `.savekontak-response ${u.id}`
})
}
await sock.sendMessage(m.chat, {
  buttons: [
    {
    buttonId: 'action',
    buttonText: { displayText: 'ini pesan interactiveMeta' },
    type: 4,
    nativeFlowInfo: {
        name: 'single_select',
        paramsJson: JSON.stringify({
          title: 'Pilih Grup',
          sections: [
            {
              title: `© Powered By ${namaOwner}`,
              rows: rows
            }
          ]
        })
      }
      }
  ],
  headerType: 1,
  viewOnce: true,
  text: `\nPilih Target Grup Savekontak\n`
}, { quoted: m })
}
break

case "savekontak-response": {
  if (!isOwner) return m.reply(mess.owner)
  if (!global.namakontak) return m.reply(`Data nama savekontak tidak ditemukan!\nSilahkan ketik *.savekontak* namakontak`);
  try {
    const res = await sock.groupMetadata(text)
    const halls = res.participants
      .filter(v => v.id.endsWith('.net'))
      .map(v => v.id)
      .filter(id => id !== botNumber && id.split("@")[0] !== global.owner)

    if (!halls.length) return m.reply("Tidak ada kontak yang bisa disimpan.")
    let names = text
    const existingContacts = JSON.parse(fs.readFileSync('./Library/Database/contacts.json', 'utf8') || '[]')
    const newContacts = [...new Set([...existingContacts, ...halls])]

    fs.writeFileSync('./Library/Database/contacts.json', JSON.stringify(newContacts, null, 2))

    // Buat file .vcf
    const vcardContent = newContacts.map(contact => {
      const phone = contact.split("@")[0]
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${global.namakontak} - ${phone}`,
        `TEL;type=CELL;type=VOICE;waid=${phone}:+${phone}`,
        "END:VCARD",
        ""
      ].join("\n")
    }).join("")

    fs.writeFileSync("./Library/Database/contacts.vcf", vcardContent, "utf8")

    // Kirim ke private chat
    if (m.chat !== m.sender) {
      await m.reply(`Berhasil membuat file kontak dari grup ${res.subject}\n\nFile kontak telah dikirim ke private chat\nTotal ${halls.length} kontak`)
    }

    await sock.sendMessage(
      m.sender,
      {
        document: fs.readFileSync("./Library/Database/contacts.vcf"),
        fileName: "contacts.vcf",
        caption: `File kontak berhasil dibuat ✅\nTotal ${halls.length} kontak`,
        mimetype: "text/vcard",
      },
      { quoted: m }
    )
    
    delete global.namakontak

    fs.writeFileSync("./Library/Database/contacts.json", "[]")
    fs.writeFileSync("./Library/Database/contacts.vcf", "")

  } catch (err) {
    m.reply("Terjadi kesalahan saat menyimpan kontak:\n" + err.toString())
  }
}
break

case "stoppushkontak": case "stoppush": case "stoppus": {
if (!isOwner) return m.reply(mess.owner)
if (!global.statuspush) return m.reply("Pushkontak sedang tidak berjalan!")
global.stoppush = true
return m.reply("Berhasil menghentikan pushkontak ✅")
}
break

//----------------------------- AKSES ALL FITUR -----------------------------//

case "addowner": case "addown": {
if (!isOwner) return m.reply(mess.owner)
let input = m.quoted ? m.quoted.sender : m.mentionedJid[0] ? m.mentionedJid[0] : text ? text.replace(/[^0-9]/g, "") + "@s.whatsapp.net" : null
if (!input) return m.reply(`*Contoh penggunaan :*
ketik ${cmd} 6285XXX`)
let jid = input.split("@")[0]
const botNumber = sock.user.id.split(":")[0] + "@s.whatsapp.net"
if (jid == global.owner || input == botNumber) return m.reply(`Nomor ${jid} sudah menjadi ownerbot.`)
const Own = Developer
if (Own.includes(input)) return m.reply(`Nomor ${jid} sudah menjadi ownerbot.`)
Own.push(input)
await fs.writeFileSync("./Library/Database/developer.json", JSON.stringify(Own, null, 2))
await m.reply(`Berhasil menambah owner ✅
- ${input.split("@")[0]}`)
}
break

case "delowner": case "delown": {
if (!isOwner) return m.reply(mess.owner)
let input = m.quoted ? m.quoted.sender : m.mentionedJid[0] ? m.mentionedJid[0] : text ? text.replace(/[^0-9]/g, "") + "@s.whatsapp.net" : null
if (!input) return m.reply(`*Contoh penggunaan :*
ketik ${cmd} 6285XXX`)
const Own = Developer
    if (input.toLowerCase() === "all") {
        Own.length = 0
        await fs.writeFileSync("./Library/Database/developer.json", JSON.stringify(Own, null, 2))
        return m.reply("Berhasil menghapus semua owner ✅")
    }
    if (!Own.includes(input)) return m.reply("Nomor tidak ditemukan!")
    const index = Own.indexOf(input)
    Own.splice(index, 1)
    await fs.writeFileSync("./Library/Database/developer.json", JSON.stringify(Own, null, 2))
await m.reply(`Berhasil menghapus owner ✅
- ${input.split("@")[0]}`)
}
break

case "listowner": case "listown": {
const Own = JSON.parse(fs.readFileSync("./Library/Database/developer.json"))
if (Own.length < 1) return m.reply("Tidak ada owner tambahan.")
let teks = ""
for (let i of Own) {
teks += `\n- Number: ${i.split("@")[0]}
- Tag: @${i.split("@")[0]}\n`
}
return m.reply(teks)
}
break

//----------------------------- JPM CHANNEL FITUR -----------------------------//

case "addptjs": case "addnocd": {
if (!isOwner && !isOwners) return m.reply(mess.owner)
let input = m.quoted ? m.quoted.sender : m.mentionedJid[0] ? m.mentionedJid[0] : text ? text.replace(/[^0-9]/g, "") + "@s.whatsapp.net" : null
if (!input) return m.reply(`*Contoh penggunaan :*
ketik ${cmd} 6285XXX`)
let jid = input.split("@")[0]
const botNumber = sock.user.id.split(":")[0] + "@s.whatsapp.net"
if (jid == global.owner || input == botNumber) return m.reply(`Nomor ${jid} sudah menjadi ptjs.`)
const Ownr = Owners
if (Ownr.includes(input)) return m.reply(`Nomor ${jid} sudah menjadi ptjs.`)
Ownr.push(input)
await fs.writeFileSync("./Library/Database/owners.json", JSON.stringify(Ownr, null, 2))
await m.reply(`Berhasil menambah partner jasher✅
- ${input.split("@")[0]}`)
}
break

case "delptjs": case "delnocd": {
if (!isOwner && !isOwners) return m.reply(mess.owner)
let input = m.quoted ? m.quoted.sender : m.mentionedJid[0] ? m.mentionedJid[0] : text ? text.replace(/[^0-9]/g, "") + "@s.whatsapp.net" : null
if (!input) return m.reply(`*Contoh penggunaan :*
ketik ${cmd} 6285XXX`)
const Ownr = Owners
    if (input.toLowerCase() === "all") {
        Ownr.length = 0
        await fs.writeFileSync("./Library/Database/owners.json", JSON.stringify(Ownr, null, 2))
        return m.reply("Berhasil menghapus semua partner jasher ✅")
    }
    if (!Ownr.includes(input)) return m.reply("Nomor tidak ditemukan!")
    const index = Ownr.indexOf(input)
    Ownr.splice(index, 1)
    await fs.writeFileSync("./Library/Database/owners.json", JSON.stringify(Ownr, null, 2))
await m.reply(`Berhasil menghapus partner jasher ✅
- ${input.split("@")[0]}`)
}
break

case "listnocd": case "listptjs": {
const Ownr = JSON.parse(fs.readFileSync("./Library/Database/owners.json"))
if (Ownr.length < 1) return m.reply("Tidak ada Partner Jasher tambahan.")
let teks = ""
for (let i of Ownr) {
teks += `\n- Number: ${i.split("@")[0]}
- Tag: @${i.split("@")[0]}\n`
}
return m.reply(teks)
}
break

case "addallnocd": case "addallptjs": {
    if (!isOwner && !isOwners) return m.reply(mess.owner);

    
    if (!m.isGroup) {
        return m.reply("Perintah ini hanya bisa digunakan di dalam grup untuk menambahkan semua anggota.");
    }

    try {
        await m.reply(`Memulai proses untuk menambahkan semua anggota dari grup *${m.metadata.subject}* sebagai Partner Jasher...`);

        const members = m.metadata.participants.map(p => p.id);
        let addedCount = 0;
        let skippedCount = 0;
        
        for (const member of members) {
            
            if (member.split("@")[0] === global.owner || Owner.includes(member) || member === botNumber) {
                skippedCount++;
                continue; 
            }
            
            Owner.push(member);
            addedCount++;
        }

        if (addedCount === 0) {
            return m.reply("Tidak ada anggota baru yang ditambahkan. Semua anggota mungkin sudah menjadi Partner Jasher.");
        }

        
        await fs.writeFileSync("./Library/Database/owners.json", JSON.stringify(Owner, null, 2));

        await m.reply(`✅ *Proses Selesai!*\n\n- Berhasil menambahkan: *${addedCount}* anggota baru.\n- Dilewati: *${skippedCount}* anggota karena sudah menjadi partner jasher / bot / owner.`);

    } catch (e) {
        console.error(e);
        m.reply("Terjadi kesalahan saat memproses permintaan.");
    }
}
break

case "addownerjs": case "addownjs": {
if (!isOwner && !isOwners) return m.reply(mess.owner)
let input = m.quoted ? m.quoted.sender : m.mentionedJid[0] ? m.mentionedJid[0] : text ? text.replace(/[^0-9]/g, "") + "@s.whatsapp.net" : null
if (!input) return m.reply(`*Contoh penggunaan :*
ketik ${cmd} 6285XXX`)
let jid = input.split("@")[0]
const botNumber = sock.user.id.split(":")[0] + "@s.whatsapp.net"
if (jid == global.owner || input == botNumber) return m.reply(`Nomor ${jid} sudah menjadi ownerbot.`)
const Ownrs = OwnerJS
if (Ownrs.includes(input)) return m.reply(`Nomor ${jid} sudah menjadi ownerbot.`)
Ownrs.push(input)
await fs.writeFileSync("./Library/Database/owners.json", JSON.stringify(Ownrs, null, 2))
await m.reply(`Berhasil menambah owner jasher✅
- ${input.split("@")[0]}`)
}
break

case "delownerjs": case "delownjs": {
if (!isOwner && !isOwners) return m.reply(mess.owner)
let input = m.quoted ? m.quoted.sender : m.mentionedJid[0] ? m.mentionedJid[0] : text ? text.replace(/[^0-9]/g, "") + "@s.whatsapp.net" : null
if (!input) return m.reply(`*Contoh penggunaan :*
ketik ${cmd} 6285XXX`)
const Ownrs = OwnerJS
    if (input.toLowerCase() === "all") {
        Ownrs.length = 0
        await fs.writeFileSync("./Library/Database/owners.json", JSON.stringify(Ownrs, null, 2))
        return m.reply("Berhasil menghapus semua owner jasher ✅")
    }
    if (!Ownrs.includes(input)) return m.reply("Nomor tidak ditemukan!")
    const index = Ownrs.indexOf(input)
    Ownrs.splice(index, 1)
    await fs.writeFileSync("./Library/Database/owners.json", JSON.stringify(Ownrs, null, 2))
await m.reply(`Berhasil menghapus owner jasher ✅
- ${input.split("@")[0]}`)
}
break

case "listownerjs": case "listownjs": {
const Ownrs = JSON.parse(fs.readFileSync("./Library/Database/owners.json"))
if (Ownrs.length < 1) return m.reply("Tidak ada Owner Jasher tambahan.")
let teks = ""
for (let i of Ownrs) {
teks += `\n- Number: ${i.split("@")[0]}
- Tag: @${i.split("@")[0]}\n`
}
return m.reply(teks)
}
break

case "addallownerjs": case "addallownjs": {
    if (!isOwner && !isOwners) return m.reply(mess.owner);

    if (!m.isGroup) {
        return m.reply("Perintah ini hanya bisa digunakan di dalam grup untuk menambahkan semua anggota.");
    }

    try {
        await m.reply(`Memulai proses untuk menambahkan semua anggota dari grup *${m.metadata.subject}* sebagai Owner Jasher...`);

        const members = m.metadata.participants.map(p => p.id);
        let addedCount = 0;
        let skippedCount = 0;
        
        for (const member of members) {

            if (member.split("@")[0] === global.owner || OwnerJS.includes(member) || member === botNumber) {
                skippedCount++;
                continue;
            }
            
            OwnerJS.push(member);
            addedCount++;
        }

        if (addedCount === 0) {
            return m.reply("Tidak ada anggota baru yang ditambahkan. Semua anggota mungkin sudah menjadi Owner Jasher.");
        }

        await fs.writeFileSync("./Library/Database/ownerjs.json", JSON.stringify(OwnerJS, null, 2));

        await m.reply(`✅ *Proses Selesai!*\n\n- Berhasil menambahkan: *${addedCount}* anggota baru.\n- Dilewati: *${skippedCount}* anggota karena sudah menjadi owner jasher / bot / owner.`);

    } catch (e) {
        console.error(e);
        m.reply("Terjadi kesalahan saat memproses permintaan.");
    }
}
break

case "resetownerjs": case "resetownjs": {
    if (!isOwner) return m.reply(mess.ownervip);

    try {
        
        OwnerJS.length = 0;

        
        await fs.writeFileSync("./Library/Database/ownerjs.json", JSON.stringify([], null, 2));

        m.reply("✅ Berhasil! Semua daftar Owner Jasher telah direset.");

    } catch (e) {
        console.error("Gagal mereset Owner JS:", e);
        m.reply("❌ Terjadi kesalahan saat mencoba mereset daftar Owner Jasher.");
    }
}
break

case "sync": {
    if (!isOwner) return m.reply(mess.owner);

    try {
        await m.reply('⏳ Sinkronisasi dimulai... Mencari semua channel di mana bot ini adalah admin atau owner...');

        
        const CHUNK_SIZE = 50;
        const DELAY_BETWEEN_CHUNKS = 3000;
        const DELAY_BETWEEN_REQUESTS = 500;
        const SAVE_INTERVAL = 10;
        
        const allSubscribedChannels = await sock.newsletterFetchAllParticipating();
        if (!allSubscribedChannels || Object.keys(allSubscribedChannels).length === 0) {
            return m.reply('❌ Bot tidak ditemukan di channel manapun.');
        }
        
        const channelFilePath = "./Library/Database/idchannel.json";
        let savedChannels = [];
        
        if (fs.existsSync(channelFilePath)) {
            try {
                const fileData = fs.readFileSync(channelFilePath, 'utf8');
                if (fileData.trim()) {
                    savedChannels = JSON.parse(fileData);
                }
            } catch (error) {
                console.error("Error membaca idchannel.json:", error);
                await m.reply('⚠️ Terjadi kesalahan membaca database, membuat yang baru...');
            }
        }

        const channelJids = Object.keys(allSubscribedChannels);
        const totalChannels = channelJids.length;
        let processedCount = 0;
        let addedCount = 0;
        let alreadyExistsCount = 0;
        let notAdminCount = 0;
        let failedCount = 0;

        await m.reply(`📊 Total channel yang akan diproses: ${totalChannels}\n⏳ Proses mungkin memakan waktu beberapa menit...`);

        try {
            if (fs.existsSync(channelFilePath)) {
                const backupDir = "./Library/Database/backups";
                if (!fs.existsSync(backupDir)) {
                    fs.mkdirSync(backupDir, { recursive: true });
                }
                const backupPath = `${backupDir}/idchannel.backup-${Date.now()}.json`;
                fs.copyFileSync(channelFilePath, backupPath);
            }
        } catch (error) {
            console.error("Gagal membuat backup:", error);
            await m.reply('⚠️ Gagal membuat backup database, melanjutkan tanpa backup...');
        }

        const saveData = async () => {
            try {
                const tempPath = `${channelFilePath}.tmp`;
                fs.writeFileSync(tempPath, JSON.stringify(savedChannels, null, 2));
                
                if (fs.existsSync(channelFilePath)) {
                    fs.unlinkSync(channelFilePath);
                }
                fs.renameSync(tempPath, channelFilePath);
                
                return true;
            } catch (error) {
                console.error("Gagal menyimpan sementara:", error);
                return false;
            }
        };

        for (let i = 0; i < channelJids.length; i += CHUNK_SIZE) {
            const chunk = channelJids.slice(i, i + CHUNK_SIZE);
            
            for (const jid of chunk) {
                try {
                    const channelInfo = allSubscribedChannels[jid];
                    const userRole = channelInfo.viewer_metadata?.role ? 
                                    channelInfo.viewer_metadata.role.toLowerCase() : '';
                    
                    if (userRole === 'admin' || userRole === 'owner' || userRole === 'superadmin') {
                        if (!savedChannels.includes(jid)) {
                            savedChannels.push(jid);
                            addedCount++;
                            
                            if (addedCount % SAVE_INTERVAL === 0) {
                                await saveData();
                                await new Promise(resolve => setTimeout(resolve, 200));
                            }
                        } else {
                            alreadyExistsCount++;
                        }
                    } else {
                        notAdminCount++;
                    }
                    
                    processedCount++;
                    
                    if (processedCount % 25 === 0) {
                        await m.reply(`📊 Progress: ${processedCount}/${totalChannels} channel diproses...`);
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
                    
                } catch (error) {
                    console.error(`Error memproses channel ${jid}:`, error);
                    failedCount++;
                }
            }
            
            if (i + CHUNK_SIZE < channelJids.length) {
                await m.reply(`⏳ Menunggu ${DELAY_BETWEEN_CHUNKS/1000} detik sebelum melanjutkan...`);
                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_CHUNKS));
            }
        }

        const saveSuccess = await saveData();
        if (!saveSuccess) {
            return m.reply('❌ Gagal menyimpan database channel. Silakan coba lagi.');
        }

        let report = `✅ *Sinkronisasi Channel Selesai!*

📊 *Statistik:*
- ➕ Channel baru ditambahkan: ${addedCount}
- 🔄 Sudah ada di database: ${alreadyExistsCount}
- 👤 Bukan admin/owner: ${notAdminCount}
- ❌ Gagal diproses: ${failedCount}

Total channel (admin/owner) di database sekarang: *${savedChannels.length}*
Total channel yang diproses: *${processedCount}*`;

        await m.reply(report);

    } catch (err) {
        console.error("Gagal sinkronisasi channel:", err);
        m.reply(`❌ Terjadi kesalahan saat sinkronisasi.\n\n*Error:* ${err.message}`);
    }
}
break

case"jpmchoff": {
    if (!isOwner) return m.reply(mess.owner);
    
    global.jpmchActive = false;
    if (!global.FhkryxzOfficial) global.FhkryxzOfficial = {};
    global.FhkryxzOfficial.jpmchActive = false;
    
    m.reply("🛑 *Fitur jpmch berhasil di nonaktifkan*");
}
break

 case"jpmchon": {
    if (!isOwner) return m.reply(mess.owner);
    
    global.jpmchActive = true;
    if (!global.FhkryxzOfficial) global.FhkryxzOfficial = {};
    global.FhkryxzOfficial.jpmchActive = true;
    
    m.reply("✅ *Fitur jpmch berhasil diaktifkan!*");
}
break

case "unbl": {
    if (!isOwner) return m.reply("❗ Fitur hanya untuk Owner.");

    const target = text || (m.quoted ? m.quoted.sender : null);
    if (!target) return m.reply("❗ Masukkan atau reply ID yang ingin dihapus dari blacklist.");

    if (!global.blacklistUsers || !global.blacklistUsers[target]) {
        return m.reply(`⚠️ User ${target} tidak ada dalam blacklist.`);
    }

    delete global.blacklistUsers[target];
    return m.reply(`✅ User ${target} berhasil dihapus dari blacklist.`);
}
break

case 'autojpmch': {
    if (!isOwner) return m.reply('Hanya owner yang bisa menggunakan fitur ini!');
    if (!global.FhkryxzOfficial.jpmchActive) return m.reply("🚫 *Fitur jpmch sedang dinonaktifkan oleh Owner.*");

    const configPath = "./Library/Database/autojpmch.json";
    const defaultConfig = {
        active: false,
        message: "",
        interval: 30,
        delay: 2,
        nextSchedule: null,
        lastRun: null,
        stats: {
            totalSuccess: 0,
            totalFailed: 0
        }
    };
    
    let config = fs.existsSync(configPath) 
        ? JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        : defaultConfig;

    const args = text.split(' ');
    const cmd = args[0]?.toLowerCase();

    if (global.autoJpmchLock) {
        return m.reply("⚠️ Sistem sedang memproses perintah sebelumnya. Silakan tunggu...");
    }

    const getWIBTime = (date = new Date()) => {
        return date.toLocaleString('id-ID', {
            timeZone: 'Asia/Jakarta',
            hour12: false
        });
    };

    
    const broadcastToChannels = async (sessionId) => {
        
        const currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        
        
        if (!currentConfig.active || global.autoJpmchSession !== sessionId) {
            console.log('Broadcast dibatalkan: status nonaktif atau session tidak cocok');
            return;
        }
        
        const channels = loadChannels();
        let successCount = 0;
        let failedCount = 0;
        
        
        currentConfig.lastRun = getWIBTime();
        fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2));

        if (channels.length === 0) {
            await sock.sendMessage(global.owner + '@s.whatsapp.net', {
                text: `⚠️ AUTOJPMCH ALERT\n\nTidak ada channel terdaftar!`
            });
            return;
        }

        for (const id of channels) {
           
            const latestConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            if (!latestConfig.active || global.autoJpmchSession !== sessionId) {
                console.log('Broadcast dihentikan di tengah jalan');
                break;
            }
            
            try {
                await sock.sendMessage(id, { 
                    text: latestConfig.message 
                });
                successCount++;
                await sleep(latestConfig.delay * 1000);
            } catch (e) {
                console.error(`Gagal mengirim ke ${id}:`, e.message);
                failedCount++;
            }
        }

        
        const finalConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        if (finalConfig.active && global.autoJpmchSession === sessionId) {
            finalConfig.stats.totalSuccess += successCount;
            finalConfig.stats.totalFailed += failedCount;
            finalConfig.nextSchedule = getWIBTime(new Date(Date.now() + finalConfig.interval * 60000));
            fs.writeFileSync(configPath, JSON.stringify(finalConfig, null, 2));

            await sock.sendMessage(global.owner + '@s.whatsapp.net', {
                text: `📊 LAPORAN AUTOJPMCH\n\n` +
                      `📅 Terakhir dijalankan: ${finalConfig.lastRun}\n` +
                      `📡 Jumlah channel: ${channels.length}\n` +
                      `✅ Berhasil dikirim: ${successCount}\n` +
                      `❌ Gagal dikirim: ${failedCount}\n` +
                      `⏰ Jadwal berikutnya: ${finalConfig.nextSchedule}\n\n` +
                      `📝 Pesan:\n${finalConfig.message.substring(0, 100)}${finalConfig.message.length > 100 ? '...' : ''}`
            });
        }
    };

    // Command 🟢 🔴
    if (cmd === 'on' || cmd === 'off') {
        global.autoJpmchLock = true;
        
        try {
            if (cmd === 'on') {
                if (!config.message) {
                    return m.reply("❌ Silakan set pesan terlebih dahulu: *.autojpmch setpesan <text>*");
                }

                
                if (global.autoJpmchInterval) {
                    clearInterval(global.autoJpmchInterval);
                    global.autoJpmchInterval = null;
                }
                
                
                global.autoJpmchSession = Date.now().toString();

              
                config.active = true;
                config.nextSchedule = null;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

                
                await broadcastToChannels(global.autoJpmchSession);
                
               
                global.autoJpmchInterval = setInterval(
                    () => broadcastToChannels(global.autoJpmchSession), 
                    config.interval * 60000
                );

                m.reply("✅ AutoJpmCh berhasil diaktifkan");
            } else {
                
                config.active = false;
                config.nextSchedule = null;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                
                
                if (global.autoJpmchInterval) {
                    clearInterval(global.autoJpmchInterval);
                    global.autoJpmchInterval = null;
                }
                
                
                global.autoJpmchSession = null;
                
                m.reply("❌ AutoJpmCh berhasil dimatikan");
            }
        } catch (error) {
            console.error('Error in autojpmch:', error);
            m.reply('Terjadi kesalahan saat memproses perintah.');
        } finally {
            global.autoJpmchLock = false;
        }
        return;
    }

    if (cmd === 'setpesan') {
        config.message = text.substring('setpesan'.length).trim();
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        return m.reply("📝 Pesan berhasil disimpan!");
    }

    if (cmd === 'setinterval') {
        const minutes = parseInt(args[1]);
        if (isNaN(minutes) || minutes < 5) {
            return m.reply("❌ Interval minimal 5 menit");
        }
        
        config.interval = minutes;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        return m.reply(`⏱ Interval diatur menjadi ${minutes} menit`);
    }

    if (cmd === 'setdelay') {
        const seconds = parseInt(args[1]);
        if (isNaN(seconds) || seconds < 1) {
            return m.reply("❌ Delay minimal 1 detik");
        }
        
        config.delay = seconds;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        return m.reply(`⏳ Delay diatur menjadi ${seconds} detik`);
    }

    if (cmd === 'status') {
        const channels = loadChannels();
        
        const currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        return m.reply(
`⚙️ STATUS AUTOJPMCH\n\n` +
`🔘 Status: ${currentConfig.active ? 'AKTIF ✅' : 'NONAKTIF ❌'}\n` +
`⏱ Interval: ${currentConfig.interval} menit\n` +
`⏳ Delay: ${currentConfig.delay} detik\n` +
`📡 Channel terdaftar: ${channels.length}\n` +
`📅 Terakhir dijalankan: ${currentConfig.lastRun || 'Belum pernah'}\n` +
`⏰ Jadwal berikutnya: ${currentConfig.nextSchedule || 'Tidak ada'}\n\n` +
`📊 Statistik:\n` +
`✅ Total berhasil: ${currentConfig.stats.totalSuccess}\n` +
`❌ Total gagal: ${currentConfig.stats.totalFailed}`
        );
    }

    
    m.reply(
`📚 PERINTAH AUTOJPMCH\n\n` +
`• .autojpmch on - Aktifkan auto-send\n` +
`• .autojpmch off - Matikan auto-send\n` +
`• .autojpmch setpesan <teks> - Set pesan broadcast\n` +
`• .autojpmch setinterval <menit> - Set interval (min 5)\n` +
`• .autojpmch setdelay <detik> - Set delay antar kirim (min 1)\n` +
`• .autojpmch status - Lihat status saat ini`
    );
}
break

case "jpmchvip": {
    if (!isOwner && !isOwners) return m.reply(mess.ownervip);
    if (!global.FhkryxzOfficial.jpmchActive) return m.reply("🚫 *Fitur jpmch sedang dinonaktifkan oleh Owner.*");

    var teks = m.quoted ? m.quoted.text : text;
    let total = 0;

    global.channels = loadChannels();

    if (global.channels.length === 0) {
        global.isJpmchRunning = false; // Jangan lupa unlock
        return m.reply(`
╔══════ ❌ *SALAHAN* ❌ ══════╗
⚠️ Tidak ada saluran terdaftar untuk *JPM*!
Silakan daftarkan saluran terlebih dahulu.
╚═══════════════════════════╝
        `.trim());
    }
    
if (!text && !m.quoted) return m.reply("Mana teksnya, kata mau jpmch");

    m.reply(`*Perintah Anda Telah Diproses Oleh Bot* 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *👑 Owner : Fhkryxz Official*
 *⏳ Status : Proses Pengiriman*
 *🕊 Total Channel :*  ${global.channels.length}
━━━━━━━━━━━━━━━━━━━━━━━━`.trim());

    for (let id of global.channels) {
        try {
            await sock.sendMessage(id, { text: teks }, { quoted: m });
            total++;
        } catch (e) {
            console.log(`⚠️ Gagal mengirim ke ${id}:`, e);
        }
        await sleep(global.delayjpmchannel || 20); // jeda antar kirim
    }

    global.isJpmchRunning = false; // unlock saat selesai

    m.reply(`*Perintah Anda Telah Berhasil Terkirim Oleh Bot* 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *👑 Owner : Fhkryxz Official*
 *✅ Status : Berhasil Terkirim*
 *🕊 Total Channel :*  ${global.channels.length}
━━━━━━━━━━━━━━━━━━━━━━━━`.trim());
}
break

case "jpmchvip2": {
    if (!isOwner && !isOwners) return m.reply(mess.owner);
    if (!global.FhkryxzOfficial.jpmchActive) return m.reply("🚫 *Fitur jpmch sedang dinonaktifkan oleh Owner.*");
    
    if (!text && !m.quoted) return m.reply("Mana teksnya, kata mau jpmch");
    
    
    if (global.isJpmchRunning) return m.reply(`
*❌ Perintah Terkunci*
*⏳  Maaf, Command ${cmd} sedang digunakan.*
Sistem sedang menyelesaikan proses broadcast sebelumnya untuk menghindari tabrakan.
💡 *Mohon coba lagi dalam beberapa saat.*`);

    // Mulai lock
    global.isJpmchRunning = true;

    var teks = m.quoted ? m.quoted.text : text;
    let total = 0;

    global.channels = loadChannels();

    if (global.channels.length === 0) {
        global.isJpmchRunning = false; // Jangan lupa unlock
        return m.reply(`
╔══════ ❌ *SALAHAN* ❌ ══════╗
⚠️ Tidak ada saluran terdaftar untuk *JPM*!
Silakan daftarkan saluran terlebih dahulu.
╚═══════════════════════════╝
        `.trim());
    }

    m.reply(`*Perintah Anda Telah Diproses Oleh Bot* 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *👑 Owner : Fhkryxz Official*
 *⏳ Status : Proses Pengiriman*
 *🕊 Total Channel :*  ${global.channels.length}
━━━━━━━━━━━━━━━━━━━━━━━━`.trim());

    for (let id of global.channels) {
        try {
            await sock.sendMessage(id, { text: teks }, { quoted: m });
            total++;
        } catch (e) {
            console.log(`⚠️ Gagal mengirim ke ${id}:`, e);
        }
        await sleep(global.delayjpmchannel || 20); // jeda antar kirim
    }

    global.isJpmchRunning = false; // unlock saat selesai

    m.reply(`*Perintah Anda Telah Berhasil Terkirim Oleh Bot* 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *👑 Owner : Fhkryxz Official*
 *✅ Status : Berhasil Terkirim*
 *🕊 Total Channel :*  ${global.channels.length}
━━━━━━━━━━━━━━━━━━━━━━━━`.trim());
}
break

case "jpmchvip3": {
    if (!isOwner && !isOwners) return m.reply(mess.owner);

    const delay = 3000; // 1000 = 1 Detik

    let messageContent = {}; 
    let captionText = text;  

    
    if (m.quoted) {
        const quotedMsg = m.quoted;
        const mime = quotedMsg.mimetype || '';

        if (/image/.test(mime)) {
            messageContent.image = await quotedMsg.download();
            messageContent.caption = captionText || quotedMsg.text || '';
        } else if (/video/.test(mime)) {
            messageContent.video = await quotedMsg.download();
            messageContent.caption = captionText || quotedMsg.text || '';
        } else if (quotedMsg.text) {
            messageContent.text = quotedMsg.text;
            if (captionText) {
                m.reply("Info: Teks yang Anda ketik diabaikan karena Anda me-reply pesan teks.");
            }
        } else {
            return m.reply("❌ Reply tidak didukung. Harap reply pesan yang berisi teks, gambar, atau video.");
        }

    } else if (text) {
        messageContent.text = text;
    } else {
        return m.reply(`⚠️ *Cara Penggunaan:*\n\n1. Ketik \`.jpmch <teks Anda>\`\n*ATAU*\n2. Balas (reply) pesan teks/gambar/video dengan caption \`.jpmch\``);
    }

   
    try {
        const channels = loadChannels();
        if (channels.length === 0) {
            return m.reply("❌ Gagal, tidak ada ID channel yang tersimpan. Gunakan `.addidch` untuk menambah.");
        }

        const totalChannels = channels.length;
        const estimatedTime = (totalChannels * (delay / 1000)).toFixed(0);

        await m.reply(`🚀 Memulai broadcast ke *${totalChannels}*\nPerkiraan waktu selesai: *~${estimatedTime} detik*`);

        let successCount = 0;
        let failedCount = 0;

        for (const channelId of channels) {
            try {
                
                await sock.sendMessage(channelId, messageContent);
                successCount++;
            } catch (e) {
                failedCount++;
                console.error(`Gagal mengirim JPMCH ke ${channelId}:`, e);
            }
            await sleep(delay);
        }

        await m.reply(`✅ *Broadcast Selesai!*\n\n- *Berhasil terkirim:* ${successCount} channel\n- *Gagal terkirim:* ${failedCount} channel`);

    } catch (e) {
        console.error("Error pada JPM Channel:", e);
        m.reply("❌ Terjadi kesalahan saat melakukan broadcast.");
    }
}
break

case "jpmch": {
    if (!isOwner && !isOwners && !isOwnerJS) return m.reply(mess.ownerjs);
    if (!global.FhkryxzOfficial.jpmchActive) return m.reply("🚫 *Fitur jpmch sedang dinonaktifkan oleh Owner.*");

    global.delayjpmchannel = 50; // jeda antar pengiriman pesan ke channel
    const cooldownKey = 'jpmch_global_cooldown';
    global.cooldowns = global.cooldowns || {};

    const now = Date.now();
    const cooldownTime = 600000; // 1 menit
    const sisaWaktu = global.cooldowns[cooldownKey] ? global.cooldowns[cooldownKey] - now : 0;

    if (sisaWaktu > 0) {
        const detik = Math.ceil(sisaWaktu / 1000);
        return m.reply(`⏳ *Fitur dalam cooldown!*\nMohon tunggu *${detik} detik* sebelum bisa digunakan kembali.`);
    }

    if (!text && !m.quoted) return m.reply("❗ Masukkan teks atau reply pesan yang ingin dikirim.");

    const teks = m.quoted ? m.quoted.text : text;
    let total = 0;

    global.channels = loadChannels();
    if (!global.channels.length) return m.reply("❌ Tidak ada channel terdaftar.");

    m.reply(`*Perintah Anda Telah Diproses Oleh Bot* 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *👑 Owner : Fhkryxz Official*
 *⏳ Status : Proses Pengiriman*
 *🕊 Total Channel :*  ${global.channels.length}
━━━━━━━━━━━━━━━━━━━━━━━━`);

    // Set cooldown global 1 menit
    global.cooldowns[cooldownKey] = now + cooldownTime;

    for (let id of global.channels) {
        try {
            await sock.sendMessage(id, { text: teks }, { quoted: m });
            total++;
        } catch (e) {
            console.log(`[JPM] Gagal kirim ke ${id}:`, e.message);
        }
        await sleep(global.delayjpmchannel);
    }

    m.reply(`*Perintah Anda Telah Berhasil Terkirim Oleh Bot* 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *👑 Owner : Fhkryxz Official*
 *✅ Status : Berhasil Terkirim*
 *🕊 Total Channel :*  ${global.channels.length}
━━━━━━━━━━━━━━━━━━━━━━━━`);
}
break

case "jpmch2": {
    if (!isOwner && !isOwners && !isOwnerJS) return m.reply(mess.ownerjs);
    if (!global.FhkryxzOfficial.jpmchActive) return m.reply("🚫 *Fitur jpmch sedang dinonaktifkan oleh Owner.*");
    
    if (!global.cooldowns) global.cooldowns = {};
    if (!global.warningUsers) global.warningUsers = {};
    if (!global.blacklistUsers) global.blacklistUsers = {};

   
    const cooldownKey = 'jpmch_global_cooldown';
    global.delayjpmchannel = 20;

    const now = Date.now();
    const cooldownTime = 900000; // 15 menit
    const sisaWaktu = global.cooldowns[cooldownKey] ? global.cooldowns[cooldownKey] - now : 0;

    if (sisaWaktu > 0) {
        const detik = Math.ceil(sisaWaktu / 1000);
        return m.reply(`*⛔ Tunggu ${detik} detik sebelum menggunakan fitur ini lagi.*`);
    }

    const userWarnKey = m.sender;

    // ✅ Cek blacklist
    if (global.blacklistUsers[userWarnKey]) {
        return m.reply("⛔ Kamu telah diblokir dari fitur ini karena terlalu banyak pelanggaran.");
    }

    if (!text && !m.quoted) return m.reply("❗ Masukkan teks atau reply pesan yang ingin dikirim.");
    const teks = m.quoted ? m.quoted.text : text;

    const forbiddenWords = ["suntik", "freelance", "unchek", "bokep", "sewa", "inject"];
    const lowerTeks = teks.toLowerCase();
    const foundWord = forbiddenWords.find(word => lowerTeks.includes(word));

    global.warningUsers[userWarnKey] = global.warningUsers[userWarnKey] || 0;

    if (foundWord) {
        global.warningUsers[userWarnKey]++;
        const warning = global.warningUsers[userWarnKey];
        let emoji = "😳";

        if (warning >= 3) {
            emoji = "💥";
            global.blacklistUsers[userWarnKey] = true;
          return m.reply(`🎉 *Selamat! Kamu Diblokir!*
Karena berhasil nyebut *${foundWord}* sampai *${warning}x*, kamu dapet hadiah:
🚫 *JPMCH Mode: Terkunci Selamanya*`);
        }

        return m.reply(`🚫 *Dibatalkan!*  
Kata *${foundWord}* melanggar aturan.  
Peringatan ke-${warning} (maksimal 3).`);
    }

    if (!teks || typeof teks !== "string") return m.reply("❗ Teks tidak valid atau kosong.");

    global.channels = loadChannels();
    if (!global.channels.length) return m.reply("❌ Tidak ada channel terdaftar.");

    m.reply(`*Perintah Anda Telah Diproses Oleh Bot* 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *👑 Owner : Fhkryxz Official*
 *⏳ Status : Proses Pengiriman*
 *🕊 Total Channel :*  ${global.channels.length}
━━━━━━━━━━━━━━━━━━━━━━━━`);

    let total = 0;
    global.cooldowns[cooldownKey] = now + cooldownTime;

    for (let id of global.channels) {
        try {
            await sock.sendMessage(id, { text: teks }, { quoted: m });
            total++;
        } catch (e) {
            console.log(`❌ [JPMCH] Gagal kirim ke ${id}:`, e.message);
        }
        await sleep(global.delayjpmchannel);
    }

    m.reply(`*Perintah Anda Telah Berhasil Terkirim Oleh Bot* 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *👑 Owner : Fhkryxz Official*
 *✅ Status : Berhasil Terkirim*
 *🕊 Total Channel :*  ${global.channels.length}
━━━━━━━━━━━━━━━━━━━━━━━━`);
}
break

case "jpmch3": {
    if (!isOwner && !isOwners && !isOwnerJS) return m.reply(mess.ownerjs);
    if (!global.FhkryxzOfficial.jpmchActive) return m.reply("🚫 *Fitur jpmch sedang dinonaktifkan oleh Owner.*");
    
   
    if (!global.cooldowns) global.cooldowns = {};
    if (!global.warningUsers) global.warningUsers = {};
    if (!global.blacklistUsers) global.blacklistUsers = {};
    
    
    if (global.isJpmchRunning) return m.reply(`
*❌ Perintah Terkunci*
*⏳  Maaf, Command ${cmd} sedang digunakan.*
Sistem sedang menyelesaikan proses broadcast sebelumnya untuk menghindari tabrakan.
💡 *Mohon coba lagi dalam beberapa saat.*`);

    
    const cooldownKey = 'jpmch_global_cooldown';
    const now = Date.now();
    const cooldownTime = 900000; // 15 menit
    const sisaWaktu = global.cooldowns[cooldownKey] ? global.cooldowns[cooldownKey] - now : 0;

    if (sisaWaktu > 0) {
        const detik = Math.ceil(sisaWaktu / 1000);
        return m.reply(`*⛔ Tunggu ${detik} detik sebelum menggunakan fitur ini lagi.*`);
    }

    const userWarnKey = m.sender;

    
    if (global.blacklistUsers[userWarnKey]) {
        return m.reply("⛔ Kamu telah diblokir dari fitur ini karena terlalu banyak pelanggaran.");
    }

    if (!text && !m.quoted) return m.reply("❗ Masukkan teks atau reply pesan yang ingin dikirim.");
    const teks = m.quoted ? m.quoted.text : text;

    
    const forbiddenWords = ["suntik", "freelance", "unchek", "bokep", "sewa", "inject"];
    const lowerTeks = teks.toLowerCase();
    const foundWord = forbiddenWords.find(word => lowerTeks.includes(word));

    global.warningUsers[userWarnKey] = global.warningUsers[userWarnKey] || 0;

    if (foundWord) {
        global.warningUsers[userWarnKey]++;
        const warning = global.warningUsers[userWarnKey];

        if (warning >= 3) {
            global.blacklistUsers[userWarnKey] = true;
            return m.reply(`🎉 *Selamat! Kamu Diblokir!*\nKarena berhasil nyebut *${foundWord}* sampai *${warning}x*, kamu dapet hadiah:\n🚫 *JPMCH Mode: Terkunci Selamanya*`);
        }

        return m.reply(`🚫 *Dibatalkan!*\nKata *${foundWord}* melanggar aturan.\nPeringatan ke-${warning} (maksimal 3).`);
    }

    if (!teks || typeof teks !== "string") return m.reply("❗ Teks tidak valid atau kosong.");

    
    global.isJpmchRunning = true;

    global.channels = loadChannels();
    if (!global.channels.length) {
        global.isJpmchRunning = false;
        return m.reply("❌ Tidak ada channel terdaftar.");
    }

    m.reply(`*Perintah Anda Telah Diproses Oleh Bot* 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *👑 Owner : Fhkryxz Official*
 *⏳ Status : Proses Pengiriman*
 *🕊 Total Channel :*  ${global.channels.length}
━━━━━━━━━━━━━━━━━━━━━━━━`);

    let total = 0;
    global.cooldowns[cooldownKey] = now + cooldownTime;

    for (let id of global.channels) {
        try {
            await sock.sendMessage(id, { text: teks }, { quoted: m });
            total++;
        } catch (e) {
            console.log(`❌ [JPMCH] Gagal kirim ke ${id}:`, e.message);
        }
        await sleep(global.delayjpmchannel || 20);
    }

    
    global.isJpmchRunning = false;

    m.reply(`*Perintah Anda Telah Berhasil Terkirim Oleh Bot* 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *👑 Owner : Fhkryxz Official*
 *✅ Status : Berhasil Terkirim*
 *🕊 Total Channel :*  ${global.channels.length}
━━━━━━━━━━━━━━━━━━━━━━━━`);
}
break

//----------------------------- PANEL PTERODACTYL V1 - V2 -----------------------------//

case "addseller": {
    if (!isOwner) return m.reply(mess.owner);
    if (!text && !m.quoted) return m.reply(`*contoh:* ${cmd} 6283XXX`);

    const input = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
    const input2 = input.split("@")[0];

    if (input2 === global.owner || Reseller.includes(input) || input === botNumber)
        return m.reply(`Nomor ${input2} sudah menjadi reseller!`);

    Reseller.push(input);
    fs.writeFileSync("./Library/Database/reseller.json", JSON.stringify(Reseller, null, 2));

    m.reply(`Berhasil menambah reseller ✅`);
}
break

case "listseller": {
    if (Reseller.length < 1) return m.reply("Tidak ada user reseller");

    let teks = ``;
    for (let i of Reseller) {
        const num = i.split("@")[0];
        teks += `\n* ${num}\n* *Tag :* @${num}\n`;
    }

    sock.sendMessage(m.chat, { text: teks, mentions: Reseller }, { quoted: m });
}
break

case "delseller": {
    if (!isOwner) return m.reply(mess.owner);
    if (!m.quoted && !text) return m.reply(`*Contoh :* ${cmd} 6283XXX`);

    const input = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
    const input2 = input.split("@")[0];

    if (input2 == global.owner || input == botNumber)
        return m.reply(`Tidak bisa menghapus owner!`);

    if (!Reseller.includes(input))
        return m.reply(`Nomor ${input2} bukan reseller!`);

    Reseller.splice(Reseller.indexOf(input), 1);
    fs.writeFileSync("./Library/Database/reseller.json", JSON.stringify(Reseller, null, 2));

    m.reply(`Berhasil menghapus reseller ✅`);
}
break

case "addakses":
case "addaksesgc": {
    if (!isOwner) return m.reply(mess.owner);
    if (!m.isGroup) return m.reply("Grup ini sudah memiliki akses reseller panel!");
    const groupId = m.chat;
    if (Reseller.includes(groupId)) {
        return m.reply("Grup ini sudah memiliki akses reseller panel!");
    }
    Reseller.push(groupId);
    try {
        await fs.writeFileSync("./Library/Database/reseller.json", JSON.stringify(Reseller, null, 2));
        m.reply("Berhasil menambahkan grup sebagai reseller panel ✅");
    } catch (err) {
        console.error(err);
        m.reply("Gagal menyimpan data akses. Silakan coba lagi.");
    }
}
break

case "listakses": {
    if (!isOwner) return m.reply(mess.owner);
    if (Reseller.length < 1) return m.reply("Tidak ada grup reseller panel.");
    const datagc = await sock.groupFetchAllParticipating();
    let teks = "";

    for (let id of Reseller) {
        const grup = datagc[id];
        const nama = grup ? grup.subject : "Grup tidak ditemukan";
        teks += `\n* ID: ${id}\n* Nama Grup: ${nama}\n`;
    }
    return m.reply(teks);
}
break

case "delakses":
case "delaksesgc": {
  if (!isOwner) return m.reply(mess.owner);
  if (!m.isGroup) return m.reply(mess.group);
  if (Reseller.length === 0) return m.reply("Tidak ada grup reseller panel.")
  const input = text ? text.trim() : m.chat
  if (input.toLowerCase() === "all") {
    Reseller.length = 0
    fs.writeFileSync("./Library/Database/reseller.json", JSON.stringify(Reseller, null, 2))
    return m.reply("Berhasil menghapus *semua grup reseller panel ✅")
  }
  if (!Reseller.includes(input)) {
    return m.reply("Grup ini bukan grup reseller panel")
  }
  const index = Reseller.indexOf(input)
  Reseller.splice(index, 1)
  fs.writeFileSync("./Library/Database/reseller.json", JSON.stringify(Reseller, null, 2))
  return m.reply("Berhasil menghapus grup reseller panel ✅")
}
break

case "1gb": case "2gb": case "3gb": case "4gb": case "5gb": 
case "6gb": case "7gb": case "8gb": case "9gb": case "10gb": 
case "unlimited": case "unli": {
    if (!isOwner && !isGrupRess && !isReseller) {
        return m.reply(`Fitur ini untuk di dalam grup reseller panel`);
    }
    if (!text) return m.reply(`Masukan username & nomor (opsional)\n*contoh:* ${cmd} FhkryxzOfficial,628XXX`)

    let nomor, usernem;
    let tek = text.split(",");
    if (tek.length > 1) {
        let [users, nom] = tek.map(t => t.trim());
        if (!users || !nom) return m.reply(`Masukan username & nomor (opsional)\n*contoh:* ${cmd} FhkryxzOfficial,628XXX`)
        nomor = nom.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        usernem = users.toLowerCase();
    } else {
        usernem = text.toLowerCase();
        nomor = m.isGroup ? m.sender : m.chat
    }

    try {
        var onWa = await sock.onWhatsApp(nomor.split("@")[0]);
        if (onWa.length < 1) return m.reply("Nomor target tidak terdaftar di WhatsApp!");
    } catch (err) {
        return m.reply("Terjadi kesalahan saat mengecek nomor WhatsApp: " + err.message);
    }

    // Mapping RAM, Disk, dan CPU
    const resourceMap = {
        "1gb": { ram: "1000", disk: "1000", cpu: "40" },
        "2gb": { ram: "2000", disk: "1000", cpu: "60" },
        "3gb": { ram: "3000", disk: "2000", cpu: "80" },
        "4gb": { ram: "4000", disk: "2000", cpu: "100" },
        "5gb": { ram: "5000", disk: "3000", cpu: "120" },
        "6gb": { ram: "6000", disk: "3000", cpu: "140" },
        "7gb": { ram: "7000", disk: "4000", cpu: "160" },
        "8gb": { ram: "8000", disk: "4000", cpu: "180" },
        "9gb": { ram: "9000", disk: "5000", cpu: "200" },
        "10gb": { ram: "10000", disk: "5000", cpu: "220" },
        "unlimited": { ram: "0", disk: "0", cpu: "0" }
    };
    
    let { ram, disk, cpu } = resourceMap[command] || { ram: "0", disk: "0", cpu: "0" };

    let username = usernem.toLowerCase();
    let email = username + "@gmail.com";
    let name = global.capital(username) + " Server";
    let password = username + "001";

    try {
        let f = await fetch(domain + "/api/application/users", {
            method: "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json", "Authorization": "Bearer " + apikey },
            body: JSON.stringify({ email, username, first_name: name, last_name: "Server", language: "en", password })
        });
        let data = await f.json();
        if (data.errors) return m.reply("Error: " + JSON.stringify(data.errors[0], null, 2));
        let user = data.attributes;

        let f1 = await fetch(domain + `/api/application/nests/${nestid}/eggs/` + egg, {
            method: "GET",
            headers: { "Accept": "application/json", "Content-Type": "application/json", "Authorization": "Bearer " + apikey }
        });
        let data2 = await f1.json();
        let startup_cmd = data2.attributes.startup;

        let f2 = await fetch(domain + "/api/application/servers", {
            method: "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json", "Authorization": "Bearer " + apikey },
            body: JSON.stringify({
                name,
                description: global.tanggal(Date.now()),
                user: user.id,
                egg: parseInt(egg),
                docker_image: "ghcr.io/parkervcp/yolks:nodejs_20",
                startup: startup_cmd,
                environment: { INST: "npm", USER_UPLOAD: "0", AUTO_UPDATE: "0", CMD_RUN: "npm start" },
                limits: { memory: ram, swap: 0, disk, io: 500, cpu },
                feature_limits: { databases: 5, backups: 5, allocations: 5 },
                deploy: { locations: [parseInt(loc)], dedicated_ip: false, port_range: [] },
            })
        });
        let result = await f2.json();
        if (result.errors) return m.reply("Error: " + JSON.stringify(result.errors[0], null, 2));
        
        let server = result.attributes;
        var orang = nomor
        if (orang !== m.chat) {
        await m.reply(`Berhasil membuat akun panel ✅\ndata akun terkirim ke nomor ${nomor.split("@")[0]}`)
        }

let teks = `
*Berikut detail akun panel kamu*

📡 Server ID: ${server.id}
👤 Username: \`${user.username}\`
🔐 Password: \`${password}\`
🗓️ Tanggal Aktivasi: ${global.tanggal(Date.now())}

*⚙️ Spesifikasi server panel*
- RAM: ${ram == "0" ? "Unlimited" : ram / 1000 + "GB"}
- Disk: ${disk == "0" ? "Unlimited" : disk / 1000 + "GB"}
- CPU: ${cpu == "0" ? "Unlimited" : cpu + "%"}
- Panel: ${global.domain}

*Rules pembelian panel :*  
- Masa aktif 30 hari  
- Data bersifat pribadi, mohon disimpan dengan aman  
- Garansi berlaku 15 hari (1x replace)  
- Klaim garansi wajib menyertakan *bukti chat pembelian*
`
        await sock.sendMessage(orang, { text: teks }, { quoted: m });
    } catch (err) {
        return m.reply("Terjadi kesalahan: " + err.message);
    }
}
break

case "listpanel":
case "listserver": {
    if (!isOwner && !isGrupReseller) {
        return m.reply(`Fitur ini hanya untuk di dalam grup reseller panel`);
    }

    try {
        const response = await fetch(`${domain}/api/application/servers`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apikey}`,
            },
        });

        const result = await response.json();
        const servers = result.data;

        if (!servers || servers.length === 0) {
            return m.reply("Tidak ada server panel!");
        }

        let messageText = `\n*Total server panel :* ${servers.length}\n`

        for (const server of servers) {
            const s = server.attributes;

            const resStatus = await fetch(`${domain}/api/client/servers/${s.uuid.split("-")[0]}/resources`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${capikey}`,
                },
            });

            const statusData = await resStatus.json();

            const ram = s.limits.memory === 0
                ? "Unlimited"
                : s.limits.memory >= 1024
                ? `${Math.floor(s.limits.memory / 1024)} GB`
                : `${s.limits.memory} MB`;

            const disk = s.limits.disk === 0
                ? "Unlimited"
                : s.limits.disk >= 1024
                ? `${Math.floor(s.limits.disk / 1024)} GB`
                : `${s.limits.disk} MB`;

            const cpu = s.limits.cpu === 0
                ? "Unlimited"
                : `${s.limits.cpu}%`;

            messageText += `
- ID : *${s.id}*
- Nama Server : *${s.name}*
- Ram : *${ram}*
- Disk : *${disk}*
- CPU : *${cpu}*
- Created : *${s.created_at.split("T")[0]}*\n`;
        }                  
        await m.reply(messageText)

    } catch (err) {
        console.error("Error listing panel servers:", err);
        m.reply("Terjadi kesalahan saat mengambil data server.");
    }
}
break

case "delpanel": {
    if (!isOwner && !isGrupRess) {
        return m.reply(mess.owner);
    }
    const rows = []
    rows.push({
title: `Hapus Semua`,
description: `Hapus semua server panel`, 
id: `.delpanel-all`
})            
    try {
        const response = await fetch(`${domain}/api/application/servers`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apikey}`,
            },
        });

        const result = await response.json();
        const servers = result.data;

        if (!servers || servers.length === 0) {
            return m.reply("Tidak ada server panel!");
        }

        let messageText = `\n*Total server panel :* ${servers.length}\n`

        for (const server of servers) {
            const s = server.attributes;

            const resStatus = await fetch(`${domain}/api/client/servers/${s.uuid.split("-")[0]}/resources`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${capikey}`,
                },
            });

            const statusData = await resStatus.json();

            const ram = s.limits.memory === 0
                ? "Unlimited"
                : s.limits.memory >= 1024
                ? `${Math.floor(s.limits.memory / 1024)} GB`
                : `${s.limits.memory} MB`;

            const disk = s.limits.disk === 0
                ? "Unlimited"
                : s.limits.disk >= 1024
                ? `${Math.floor(s.limits.disk / 1024)} GB`
                : `${s.limits.disk} MB`;

            const cpu = s.limits.cpu === 0
                ? "Unlimited"
                : `${s.limits.cpu}%`;
            rows.push({
title: `${s.name} || ID:${s.id}`,
description: `Ram ${ram} || Disk ${disk} || CPU ${cpu}`, 
id: `.delpanel-response ${s.id}`
})            
        }                  
        await sock.sendMessage(m.chat, {
  buttons: [
    {
    buttonId: 'action',
    buttonText: { displayText: 'ini pesan interactiveMeta' },
    type: 4,
    nativeFlowInfo: {
        name: 'single_select',
        paramsJson: JSON.stringify({
          title: 'Pilih Server Panel',
          sections: [
            {
              title: `© ${global.namebot} Version ${global.versi}`,
              rows: rows
            }
          ]
        })
      }
      }
  ],
  headerType: 1,
  viewOnce: true,
  text: `\nPilih Server Panel Yang Ingin Dihapus\n`
}, { quoted: m })

    } catch (err) {
        console.error("Error listing panel servers:", err);
        m.reply("Terjadi kesalahan saat mengambil data server.");
    }
}
break

case "delpanel-response": {
    if (!isOwner && !isGrupRess) return m.reply(mess.owner);
    if (!text) return 
    
    try {
        const serverResponse = await fetch(domain + "/api/application/servers", {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + apikey
            }
        });
        const serverData = await serverResponse.json();
        const servers = serverData.data;
        
        let serverName;
        let serverSection;
        let serverFound = false;
        
        for (const server of servers) {
            const serverAttr = server.attributes;
            
            if (Number(text) === serverAttr.id) {
                serverSection = serverAttr.name.toLowerCase();
                serverName = serverAttr.name;
                serverFound = true;
                
                const deleteServerResponse = await fetch(domain + `/api/application/servers/${serverAttr.id}`, {
                    method: "DELETE",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + apikey
                    }
                });
                
                if (!deleteServerResponse.ok) {
                    const errorData = await deleteServerResponse.json();
                    console.error("Gagal menghapus server:", errorData);
                }
                
                break
            }
        }
        
        if (!serverFound) {
            return m.reply("Gagal menghapus server!\nID server tidak ditemukan");
        }
        
        const userResponse = await fetch(domain + "/api/application/users", {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + apikey
            }
        });
        const userData = await userResponse.json();
        const users = userData.data;
        
        for (const user of users) {
            const userAttr = user.attributes;
            
            if (userAttr.first_name.toLowerCase() === serverSection) {
                const deleteUserResponse = await fetch(domain + `/api/application/users/${userAttr.id}`, {
                    method: "DELETE",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + apikey
                    }
                });
                
                if (!deleteUserResponse.ok) {
                    const errorData = await deleteUserResponse.json();
                    console.error("Gagal menghapus user:", errorData);
                }
                
                break
            }
        }
        
        await m.reply(`Barhasil Menghapus Sever Panel ✅\nNama Server: ${capital(serverName)}`);
        
    } catch (error) {
        console.error("Error dalam proses delpanel:", error);
        await m.reply("Terjadi kesalahan saat memproses permintaan");
    }
}
break

case "delpanel-all": {
if (!isOwner && !isGrupRess) return m.reply(mess.owner)
await m.reply(`Memproses penghapusan semua user & server panel yang bukan admin`)
try {
const PTERO_URL = global.domain
// Ganti dengan URL panel Pterodactyl
const API_KEY = global.apikey// API Key dengan akses admin

// Konfigurasi headers
const headers = {
  "Authorization": "Bearer " + API_KEY,
  "Content-Type": "application/json",
  "Accept": "application/json",
};

// Fungsi untuk mendapatkan semua user
async function getUsers() {
  try {
    const res = await axios.get(`${PTERO_URL}/api/application/users`, { headers });
    return res.data.data;
  } catch (error) {
    m.reply(JSON.stringify(error.response?.data || error.message, null, 2))
    
    return [];
  }
}

// Fungsi untuk mendapatkan semua server
async function getServers() {
  try {
    const res = await axios.get(`${PTERO_URL}/api/application/servers`, { headers });
    return res.data.data;
  } catch (error) {
    m.reply(JSON.stringify(error.response?.data || error.message, null, 2))
    return [];
  }
}

// Fungsi untuk menghapus server berdasarkan UUID
async function deleteServer(serverUUID) {
  try {
    await axios.delete(`${PTERO_URL}/api/application/servers/${serverUUID}`, { headers });
    console.log(`Server ${serverUUID} berhasil dihapus.`);
  } catch (error) {
    console.error(`Gagal menghapus server ${serverUUID}:`, error.response?.data || error.message);
  }
}

// Fungsi untuk menghapus user berdasarkan ID
async function deleteUser(userID) {
  try {
    await axios.delete(`${PTERO_URL}/api/application/users/${userID}`, { headers });
    console.log(`User ${userID} berhasil dihapus.`);
  } catch (error) {
    console.error(`Gagal menghapus user ${userID}:`, error.response?.data || error.message);
  }
}

// Fungsi utama untuk menghapus semua user & server yang bukan admin
async function deleteNonAdminUsersAndServers() {
  const users = await getUsers();
  const servers = await getServers();
  let totalSrv = 0

  for (const user of users) {
    if (user.attributes.root_admin) {
      console.log(`Lewati admin: ${user.attributes.username}`);
      continue; // Lewati admin
    }

    const userID = user.attributes.id;
    const userEmail = user.attributes.email;

    console.log(`Menghapus user: ${user.attributes.username} (${userEmail})`);

    // Cari server yang dimiliki user ini
    const userServers = servers.filter(srv => srv.attributes.user === userID);

    // Hapus semua server user ini
    for (const server of userServers) {
      await deleteServer(server.attributes.id);
      totalSrv += 1
    }

    // Hapus user setelah semua servernya terhapus
    await deleteUser(userID);
  }
await m.reply(`Berhasil menghapus ${totalSrv} user & server panel yang bukan admin.`)
}

// Jalankan fungsi
return deleteNonAdminUsersAndServers();
} catch (err) {
return m.reply(`${JSON.stringify(err, null, 2)}`)
}
}
break

case "cadmin": {
    if (!isOwner && !isGrupRess) return m.reply(mess.owner);
    if (!text) return m.reply(`Masukan username & nomor (opsional)\n*contoh:* ${cmd} FhkryxzOfficial,628XXX`)
    let nomor, usernem;
    const tek = text.split(",");
    if (tek.length > 1) {
        let [users, nom] = tek;
        if (!users || !nom) return m.reply(`Masukan username & nomor (opsional)\n*contoh:* ${cmd} FhkryxzOfficial,628XXX`)

        nomor = nom.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        usernem = users.toLowerCase();
    } else {
        usernem = text.toLowerCase();
        nomor = m.isGroup ? m.sender : m.chat;
    }

    const onWa = await sock.onWhatsApp(nomor.split("@")[0]);
    if (onWa.length < 1) return m.reply("Nomor target tidak terdaftar di WhatsApp!");

    const username = usernem.toLowerCase();
    const email = `${username}@gmail.com`;
    const name = global.capital(args[0]);
    const password = `${username}001`;

    try {
        const res = await fetch(`${domain}/api/application/users`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apikey}`
            },
            body: JSON.stringify({
                email,
                username,
                first_name: name,
                last_name: "Admin",
                root_admin: true,
                language: "en",
                password
            })
        });

        const data = await res.json();
        if (data.errors) return m.reply(JSON.stringify(data.errors[0], null, 2));

        const user = data.attributes;
        const orang = nomor;

        if (nomor !== m.chat) {
            await m.reply(`Berhasil membuat akun admin panel ✅\nData akun terkirim ke nomor ${nomor.split("@")[0]}`);
        }

        const teks = `
*Berikut detail akun admin panel*

📡 Server ID: ${user.id}
👤 Username: \`${user.username}\`
🔐 Password: \`${password}\`
🗓️ Tanggal Aktivasi: ${global.tanggal(Date.now())}
*🌐* ${global.domain}

*Rules pembelian admin panel:*  
- Masa aktif 30 hari  
- Data bersifat pribadi, mohon disimpan dengan aman  
- Garansi berlaku 15 hari (1x replace)  
- Klaim garansi wajib menyertakan *bukti chat pembelian*
        `;

        await sock.sendMessage(orang, { text: teks }, { quoted: m });

    } catch (err) {
        console.error(err);
        m.reply("Terjadi kesalahan saat membuat akun admin panel.");
    }
}
break

case "deladmin": {
    if (!isOwner && !isGrupRess) return m.reply(mess.owner);
    try {
        const res = await fetch(`${domain}/api/application/users`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apikey}`
            }
        });
        const rows = []
        const data = await res.json();
        const users = data.data;

        const adminUsers = users.filter(u => u.attributes.root_admin === true);
        if (adminUsers.length < 1) return m.reply("Tidak ada admin panel.");

        let teks = `\n*Total admin panel :* ${adminUsers.length}\n`
        adminUsers.forEach((admin, idx) => {
            teks += `
- ID : *${admin.attributes.id}*
- Nama : *${admin.attributes.first_name}*
- Created : ${admin.attributes.created_at.split("T")[0]}
`;
rows.push({
title: `${admin.attributes.first_name} || ID:${admin.attributes.id}`,
description: `Created At: ${admin.attributes.created_at.split("T")[0]}`, 
id: `.deladmin-response ${admin.attributes.id}`
})            
        });

        await sock.sendMessage(m.chat, {
  buttons: [
    {
    buttonId: 'action',
    buttonText: { displayText: 'ini pesan interactiveMeta' },
    type: 4,
    nativeFlowInfo: {
        name: 'single_select',
        paramsJson: JSON.stringify({
          title: 'Pilih Admin Panel',
          sections: [
            {
              title: `© ${global.namebot} Version ${global.versi}`,
              rows: rows
            }
          ]
        })
      }
      }
  ],
  headerType: 1,
  viewOnce: true,
  text: `\nPilih Admin Panel Yang Ingin Dihapus\n`
}, { quoted: m })

    } catch (err) {
        console.error(err);
        m.reply("Terjadi kesalahan saat mengambil data admin.");
    }
}
break

case "deladmin-response": {
    if (!isOwner && !isGrupRess) return m.reply(mess.owner);
    if (!text) return 
    try {
        const res = await fetch(`${domain}/api/application/users`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apikey}`
            }
        });

        const data = await res.json();
        const users = data.data;

        let targetAdmin = users.find(
            (e) => e.attributes.id == args[0] && e.attributes.root_admin === true
        );

        if (!targetAdmin) {
            return m.reply("Gagal menghapus akun!\nID user tidak ditemukan");
        }

        const idadmin = targetAdmin.attributes.id;
        const username = targetAdmin.attributes.username;

        const delRes = await fetch(`${domain}/api/application/users/${idadmin}`, {
            method: "DELETE",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apikey}`
            }
        });

        if (!delRes.ok) {
            const errData = await delRes.json();
            return m.reply(`Gagal menghapus akun admin!\n${JSON.stringify(errData.errors[0], null, 2)}`);
        }

        await m.reply(`Berhasil Menghapus Admin Panel ✅\nNama User: ${global.capital(username)}`);

    } catch (err) {
        console.error(err);
        m.reply("Terjadi kesalahan saat menghapus akun admin.");
    }
}
break

case "listadmin": {
    if (!isOwner && !isGrupRess) return m.reply(mess.owner);

    try {
        const res = await fetch(`${domain}/api/application/users`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apikey}`
            }
        });

        const data = await res.json();
        const users = data.data;

        const adminUsers = users.filter(u => u.attributes.root_admin === true);
        if (adminUsers.length < 1) return m.reply("Tidak ada admin panel.");

        let teks = `\n*Total admin panel :* ${adminUsers.length}\n`
        adminUsers.forEach((admin, idx) => {
            teks += `
- ID : *${admin.attributes.id}*
- Nama : *${admin.attributes.first_name}*
- Created : ${admin.attributes.created_at.split("T")[0]}
`;
        });

        await m.reply(teks)

    } catch (err) {
        console.error(err);
        m.reply("Terjadi kesalahan saat mengambil data admin.");
    }
}
break

case "1gb-v2": case "2gb-v2": case "3gb-v2": case "4gb-v2": case "5gb-v2": 
case "6gb-v2": case "7gb-v2": case "8gb-v2": case "9gb-v2": case "10gb-v2": 
case "unlimited-v2": case "unli-v2": {
    if (!isOwner) return m.reply(mess.owner);
    if (!text) return m.reply(`Masukan username & nomor (opsional)\n*contoh:* ${cmd} FhkryxzOfficial,628XXX`)

    let nomor, usernem;
    let tek = text.split(",");
    if (tek.length > 1) {
        let [users, nom] = tek.map(t => t.trim());
        if (!users || !nom) return m.reply(`Masukan username & nomor (opsional)\n*contoh:* ${cmd} FhkryxzOfficial,628XXX`)
        nomor = nom.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        usernem = users.toLowerCase();
    } else {
        usernem = text.toLowerCase();
        nomor = m.isGroup ? m.sender : m.chat
    }

    try {
        var onWa = await sock.onWhatsApp(nomor.split("@")[0]);
        if (onWa.length < 1) return m.reply("Nomor target tidak terdaftar di WhatsApp!");
    } catch (err) {
        return m.reply("Terjadi kesalahan saat mengecek nomor WhatsApp: " + err.message);
    }

    // Mapping RAM, Disk, dan CPU
    const resourceMap = {
        "1gb-v2": { ram: "1000", disk: "1000", cpu: "40" },
        "2gb-v2": { ram: "2000", disk: "1000", cpu: "60" },
        "3gb-v2": { ram: "3000", disk: "2000", cpu: "80" },
        "4gb-v2": { ram: "4000", disk: "2000", cpu: "100" },
        "5gb-v2": { ram: "5000", disk: "3000", cpu: "120" },
        "6gb-v2": { ram: "6000", disk: "3000", cpu: "140" },
        "7gb-v2": { ram: "7000", disk: "4000", cpu: "160" },
        "8gb-v2": { ram: "8000", disk: "4000", cpu: "180" },
        "9gb-v2": { ram: "9000", disk: "5000", cpu: "200" },
        "10gb-v2": { ram: "10000", disk: "5000", cpu: "220" },
        "unlimited-v2": { ram: "0", disk: "0", cpu: "0" }
    };
    
    let { ram, disk, cpu } = resourceMap[command] || { ram: "0", disk: "0", cpu: "0" };

    let username = usernem.toLowerCase();
    let email = username + "@gmail.com";
    let name = global.capital(username) + " Server";
    let password = username + "001";

    try {
        let f = await fetch(domainV2 + "/api/application/users", {
            method: "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json", "Authorization": "Bearer " + apikeyV2 },
            body: JSON.stringify({ email, username, first_name: name, last_name: "Server", language: "en", password })
        });
        let data = await f.json();
        if (data.errors) return m.reply("Error: " + JSON.stringify(data.errors[0], null, 2));
        let user = data.attributes;

        let f1 = await fetch(domainV2 + `/api/application/nests/${nestidV2}/eggs/` + eggV2, {
            method: "GET",
            headers: { "Accept": "application/json", "Content-Type": "application/json", "Authorization": "Bearer " + apikeyV2 }
        });
        let data2 = await f1.json();
        let startup_cmd = data2.attributes.startup;

        let f2 = await fetch(domainV2 + "/api/application/servers", {
            method: "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json", "Authorization": "Bearer " + apikeyV2 },
            body: JSON.stringify({
                name,
                description: global.tanggal(Date.now()),
                user: user.id,
                egg: parseInt(eggV2),
                docker_image: "ghcr.io/parkervcp/yolks:nodejs_20",
                startup: startup_cmd,
                environment: { INST: "npm", USER_UPLOAD: "0", AUTO_UPDATE: "0", CMD_RUN: "npm start" },
                limits: { memory: ram, swap: 0, disk, io: 500, cpu },
                feature_limits: { databases: 5, backups: 5, allocations: 5 },
                deploy: { locations: [parseInt(locV2)], dedicated_ip: false, port_range: [] },
            })
        });
        let result = await f2.json();
        if (result.errors) return m.reply("Error: " + JSON.stringify(result.errors[0], null, 2));
        
        let server = result.attributes;
        var orang = nomor
        if (orang !== m.chat) {
        await m.reply(`Berhasil membuat akun panel ✅\ndata akun terkirim ke nomor ${nomor.split("@")[0]}`)
        }

let teks = `
*Berikut detail akun panel kamu*

📡 Server ID: ${server.id}
👤 Username: \`${user.username}\`
🔐 Password: \`${password}\`
🗓️ Tanggal Aktivasi: ${global.tanggal(Date.now())}

*⚙️ Spesifikasi server panel*
- RAM: ${ram == "0" ? "Unlimited" : ram / 1000 + "GB"}
- Disk: ${disk == "0" ? "Unlimited" : disk / 1000 + "GB"}
- CPU: ${cpu == "0" ? "Unlimited" : cpu + "%"}
- Panel: ${global.domainV2}

*Rules pembelian panel :*  
- Masa aktif 30 hari  
- Data bersifat pribadi, mohon disimpan dengan aman  
- Garansi berlaku 15 hari (1x replace)  
- Klaim garansi wajib menyertakan *bukti chat pembelian*
`
        await sock.sendMessage(orang, { text: teks }, { quoted: m });
    } catch (err) {
        return m.reply("Terjadi kesalahan: " + err.message);
    }
}
break

case "listpanel-v2":
case "listserver-v2": {
    if (!isOwner) return m.reply(mess.owner);

    try {
        const response = await fetch(`${domainV2}/api/application/servers`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apikeyV2}`,
            },
        });

        const result = await response.json();
        const servers = result.data;

        if (!servers || servers.length === 0) {
            return m.reply("Tidak ada server panel!");
        }

        let messageText = `\n*Total server panel :* ${servers.length}\n`

        for (const server of servers) {
            const s = server.attributes;

            const resStatus = await fetch(`${domainV2}/api/client/servers/${s.uuid.split("-")[0]}/resources`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${capikeyV2}`,
                },
            });

            const statusData = await resStatus.json();

            const ram = s.limits.memory === 0
                ? "Unlimited"
                : s.limits.memory >= 1024
                ? `${Math.floor(s.limits.memory / 1024)} GB`
                : `${s.limits.memory} MB`;

            const disk = s.limits.disk === 0
                ? "Unlimited"
                : s.limits.disk >= 1024
                ? `${Math.floor(s.limits.disk / 1024)} GB`
                : `${s.limits.disk} MB`;

            const cpu = s.limits.cpu === 0
                ? "Unlimited"
                : `${s.limits.cpu}%`;

            messageText += `
- ID : *${s.id}*
- Nama Server : *${s.name}*
- Ram : *${ram}*
- Disk : *${disk}*
- CPU : *${cpu}*
- Created : *${s.created_at.split("T")[0]}*\n`;
        }                  
        await m.reply(messageText)

    } catch (err) {
        console.error("Error listing panel servers:", err);
        m.reply("Terjadi kesalahan saat mengambil data server.");
    }
}
break

case "delpanel-v2": {
    if (!isOwner) return m.reply(mess.owner);
    const rows = []
    rows.push({
title: `Hapus Semua`,
description: `Hapus semua server panel`, 
id: `.delpanel-all`
})            
    try {
        const response = await fetch(`${domainV2}/api/application/servers`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apikeyV2}`,
            },
        });

        const result = await response.json();
        const servers = result.data;

        if (!servers || servers.length === 0) {
            return m.reply("Tidak ada server panel!");
        }

        let messageText = `\n*Total server panel :* ${servers.length}\n`

        for (const server of servers) {
            const s = server.attributes;

            const resStatus = await fetch(`${domainV2}/api/client/servers/${s.uuid.split("-")[0]}/resources`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${capikeyV2}`,
                },
            });

            const statusData = await resStatus.json();

            const ram = s.limits.memory === 0
                ? "Unlimited"
                : s.limits.memory >= 1024
                ? `${Math.floor(s.limits.memory / 1024)} GB`
                : `${s.limits.memory} MB`;

            const disk = s.limits.disk === 0
                ? "Unlimited"
                : s.limits.disk >= 1024
                ? `${Math.floor(s.limits.disk / 1024)} GB`
                : `${s.limits.disk} MB`;

            const cpu = s.limits.cpu === 0
                ? "Unlimited"
                : `${s.limits.cpu}%`;
            rows.push({
title: `${s.name} || ID:${s.id}`,
description: `Ram ${ram} || Disk ${disk} || CPU ${cpu}`, 
id: `.delpanel-response-v2 ${s.id}`
})            
        }                  
        await sock.sendMessage(m.chat, {
  buttons: [
    {
    buttonId: 'action',
    buttonText: { displayText: 'ini pesan interactiveMeta' },
    type: 4,
    nativeFlowInfo: {
        name: 'single_select',
        paramsJson: JSON.stringify({
          title: 'Pilih Server Panel',
          sections: [
            {
              title: `© ${global.namebot} Version ${global.versi}`,
              rows: rows
            }
          ]
        })
      }
      }
  ],
  headerType: 1,
  viewOnce: true,
  text: `\nPilih Server Panel Yang Ingin Dihapus\n`
}, { quoted: m })

    } catch (err) {
        console.error("Error listing panel servers:", err);
        m.reply("Terjadi kesalahan saat mengambil data server.");
    }
}
break

case "delpanel-response-v2": {
    if (!isOwner) return m.reply(mess.owner);
    if (!text) return 
    
    try {
        const serverResponse = await fetch(domain + "/api/application/servers", {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + apikeyV2
            }
        });
        const serverData = await serverResponse.json();
        const servers = serverData.data;
        
        let serverName;
        let serverSection;
        let serverFound = false;
        
        for (const server of servers) {
            const serverAttr = server.attributes;
            
            if (Number(text) === serverAttr.id) {
                serverSection = serverAttr.name.toLowerCase();
                serverName = serverAttr.name;
                serverFound = true;
                
                const deleteServerResponse = await fetch(domainV2 + `/api/application/servers/${serverAttr.id}`, {
                    method: "DELETE",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + apikeyV2
                    }
                });
                
                if (!deleteServerResponse.ok) {
                    const errorData = await deleteServerResponse.json();
                    console.error("Gagal menghapus server:", errorData);
                }
                
                break
            }
        }
        
        if (!serverFound) {
            return m.reply("Gagal menghapus server!\nID server tidak ditemukan");
        }
        
        const userResponse = await fetch(domainV2 + "/api/application/users", {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + apikeyV2
            }
        });
        const userData = await userResponse.json();
        const users = userData.data;
        
        for (const user of users) {
            const userAttr = user.attributes;
            
            if (userAttr.first_name.toLowerCase() === serverSection) {
                const deleteUserResponse = await fetch(domainV2 + `/api/application/users/${userAttr.id}`, {
                    method: "DELETE",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + apikeyV2
                    }
                });
                
                if (!deleteUserResponse.ok) {
                    const errorData = await deleteUserResponse.json();
                    console.error("Gagal menghapus user:", errorData);
                }
                
                break
            }
        }
        
        await m.reply(`Barhasil Menghapus Sever Panel ✅\nNama Server: ${capital(serverName)}`);
        
    } catch (error) {
        console.error("Error dalam proses delpanel:", error);
        await m.reply("Terjadi kesalahan saat memproses permintaan");
    }
}
break

case "delpanel-all-v2": {
if (!isOwner) return m.reply(mess.owner)
await m.reply(`Memproses penghapusan semua user & server panel yang bukan admin`)
try {
const PTERO_URLV2 = global.domainV2
// Ganti dengan URL panel Pterodactyl
const API_KEYV2 = global.apikeyV2// API Key dengan akses admin

// Konfigurasi headers
const headers = {
  "Authorization": "Bearer " + API_KEYV2,
  "Content-Type": "application/json",
  "Accept": "application/json",
};

// Fungsi untuk mendapatkan semua user
async function getUsers() {
  try {
    const res = await axios.get(`${PTERO_URLV2}/api/application/users`, { headers });
    return res.data.data;
  } catch (error) {
    m.reply(JSON.stringify(error.response?.data || error.message, null, 2))
    
    return [];
  }
}

// Fungsi untuk mendapatkan semua server
async function getServers() {
  try {
    const res = await axios.get(`${PTERO_URLV2}/api/application/servers`, { headers });
    return res.data.data;
  } catch (error) {
    m.reply(JSON.stringify(error.response?.data || error.message, null, 2))
    return [];
  }
}

// Fungsi untuk menghapus server berdasarkan UUID
async function deleteServer(serverUUID) {
  try {
    await axios.delete(`${PTERO_URLV2}/api/application/servers/${serverUUID}`, { headers });
    console.log(`Server ${serverUUID} berhasil dihapus.`);
  } catch (error) {
    console.error(`Gagal menghapus server ${serverUUID}:`, error.response?.data || error.message);
  }
}

// Fungsi untuk menghapus user berdasarkan ID
async function deleteUser(userID) {
  try {
    await axios.delete(`${PTERO_URLV2}/api/application/users/${userID}`, { headers });
    console.log(`User ${userID} berhasil dihapus.`);
  } catch (error) {
    console.error(`Gagal menghapus user ${userID}:`, error.response?.data || error.message);
  }
}

// Fungsi utama untuk menghapus semua user & server yang bukan admin
async function deleteNonAdminUsersAndServers() {
  const users = await getUsers();
  const servers = await getServers();
  let totalSrv = 0

  for (const user of users) {
    if (user.attributes.root_admin) {
      console.log(`Lewati admin: ${user.attributes.username}`);
      continue; // Lewati admin
    }

    const userID = user.attributes.id;
    const userEmail = user.attributes.email;

    console.log(`Menghapus user: ${user.attributes.username} (${userEmail})`);

    // Cari server yang dimiliki user ini
    const userServers = servers.filter(srv => srv.attributes.user === userID);

    // Hapus semua server user ini
    for (const server of userServers) {
      await deleteServer(server.attributes.id);
      totalSrv += 1
    }

    // Hapus user setelah semua servernya terhapus
    await deleteUser(userID);
  }
await m.reply(`Berhasil menghapus ${totalSrv} user & server panel yang bukan admin.`)
}

// Jalankan fungsi
return deleteNonAdminUsersAndServers();
} catch (err) {
return m.reply(`${JSON.stringify(err, null, 2)}`)
}
}
break

case "cadmin-v2": {
    if (!isOwner) return m.reply(mess.owner);
    if (!text) return m.reply(`Masukan username & nomor (opsional)\n*contoh:* ${cmd} FhkryxzOfficial,628XXX`)
    let nomor, usernem;
    const tek = text.split(",");
    if (tek.length > 1) {
        let [users, nom] = tek;
        if (!users || !nom) return m.reply(`Masukan username & nomor (opsional)\n*contoh:* ${cmd} FhkryxzOfficial,628XXX`)

        nomor = nom.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        usernem = users.toLowerCase();
    } else {
        usernem = text.toLowerCase();
        nomor = m.isGroup ? m.sender : m.chat;
    }

    const onWa = await sock.onWhatsApp(nomor.split("@")[0]);
    if (onWa.length < 1) return m.reply("Nomor target tidak terdaftar di WhatsApp!");

    const username = usernem.toLowerCase();
    const email = `${username}@gmail.com`;
    const name = global.capital(args[0]);
    const password = `${username}001`;

    try {
        const res = await fetch(`${domainV2}/api/application/users`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apikeyV2}`
            },
            body: JSON.stringify({
                email,
                username,
                first_name: name,
                last_name: "Admin",
                root_admin: true,
                language: "en",
                password
            })
        });

        const data = await res.json();
        if (data.errors) return m.reply(JSON.stringify(data.errors[0], null, 2));

        const user = data.attributes;
        const orang = nomor;

        if (nomor !== m.chat) {
            await m.reply(`Berhasil membuat akun admin panel ✅\nData akun terkirim ke nomor ${nomor.split("@")[0]}`);
        }

        const teks = `
*Berikut detail akun admin panel*

📡 Server ID: ${user.id}
👤 Username: \`${user.username}\`
🔐 Password: \`${password}\`
🗓️ Tanggal Aktivasi: ${global.tanggal(Date.now())}
*🌐* ${global.domainV2}

*Rules pembelian admin panel:*  
- Masa aktif 30 hari  
- Data bersifat pribadi, mohon disimpan dengan aman  
- Garansi berlaku 15 hari (1x replace)  
- Klaim garansi wajib menyertakan *bukti chat pembelian*
        `;

        await sock.sendMessage(orang, { text: teks }, { quoted: m });

    } catch (err) {
        console.error(err);
        m.reply("Terjadi kesalahan saat membuat akun admin panel.");
    }
}
break

case "deladmin-v2": {
    if (!isOwner) return m.reply(mess.owner);
    try {
        const res = await fetch(`${domainV2}/api/application/users`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apikeyV2}`
            }
        });
        const rows = []
        const data = await res.json();
        const users = data.data;

        const adminUsers = users.filter(u => u.attributes.root_admin === true);
        if (adminUsers.length < 1) return m.reply("Tidak ada admin panel.");

        let teks = `\n*Total admin panel :* ${adminUsers.length}\n`
        adminUsers.forEach((admin, idx) => {
            teks += `
- ID : *${admin.attributes.id}*
- Nama : *${admin.attributes.first_name}*
- Created : ${admin.attributes.created_at.split("T")[0]}
`;
rows.push({
title: `${admin.attributes.first_name} || ID:${admin.attributes.id}`,
description: `Created At: ${admin.attributes.created_at.split("T")[0]}`, 
id: `.deladmin-response-v2 ${admin.attributes.id}`
})            
        });

        await sock.sendMessage(m.chat, {
  buttons: [
    {
    buttonId: 'action',
    buttonText: { displayText: 'ini pesan interactiveMeta' },
    type: 4,
    nativeFlowInfo: {
        name: 'single_select',
        paramsJson: JSON.stringify({
          title: 'Pilih Admin Panel',
          sections: [
            {
              title: `© ${global.namebot} Version ${global.versi}`,
              rows: rows
            }
          ]
        })
      }
      }
  ],
  headerType: 1,
  viewOnce: true,
  text: `\nPilih Admin Panel Yang Ingin Dihapus\n`
}, { quoted: m })

    } catch (err) {
        console.error(err);
        m.reply("Terjadi kesalahan saat mengambil data admin.");
    }
}
break

case "deladmin-response-v2": {
    if (!isOwner) return m.reply(mess.owner);
    if (!text) return 
    try {
        const res = await fetch(`${domainV2}/api/application/users`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apikeyV2}`
            }
        });

        const data = await res.json();
        const users = data.data;

        let targetAdmin = users.find(
            (e) => e.attributes.id == args[0] && e.attributes.root_admin === true
        );

        if (!targetAdmin) {
            return m.reply("Gagal menghapus akun!\nID user tidak ditemukan");
        }

        const idadmin = targetAdmin.attributes.id;
        const username = targetAdmin.attributes.username;

        const delRes = await fetch(`${domainV2}/api/application/users/${idadmin}`, {
            method: "DELETE",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apikeyV2}`
            }
        });

        if (!delRes.ok) {
            const errData = await delRes.json();
            return m.reply(`Gagal menghapus akun admin!\n${JSON.stringify(errData.errors[0], null, 2)}`);
        }

        await m.reply(`Berhasil Menghapus Admin Panel ✅\nNama User: ${global.capital(username)}`);

    } catch (err) {
        console.error(err);
        m.reply("Terjadi kesalahan saat menghapus akun admin.");
    }
}
break

case "listadmin-v2": {
    if (!isOwner) return m.reply(mess.owner);

    try {
        const res = await fetch(`${domainV2}/api/application/users`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apikeyV2}`
            }
        });

        const data = await res.json();
        const users = data.data;

        const adminUsers = users.filter(u => u.attributes.root_admin === true);
        if (adminUsers.length < 1) return m.reply("Tidak ada admin panel.");

        let teks = `\n*Total admin panel :* ${adminUsers.length}\n`
        adminUsers.forEach((admin, idx) => {
            teks += `
- ID : *${admin.attributes.id}*
- Nama : *${admin.attributes.first_name}*
- Created : ${admin.attributes.created_at.split("T")[0]}
`;
        });

        await m.reply(teks)

    } catch (err) {
        console.error(err);
        m.reply("Terjadi kesalahan saat mengambil data admin.");
    }
}
break

//----------------------------- SETTINGS PANEL PTERODACTYL V1 - V2 -----------------------------//

case "updomain": {
    const newDomain = m.quoted ? m.quoted.text : text;
    if (!isOwner) return m.reply("❌ *Akses ditolak! Perintah ini hanya untuk pemilik bot.*");
    if (!newDomain) return m.reply(`⚠️ *Format salah!*\n\n📌 *Contoh:* ${m.prefix + command} domain.com`);

    try {
        global.domain = newDomain;
        const settingsPath = './settings.js';
        let settingsContent = fs.readFileSync(settingsPath, 'utf8');
        settingsContent = settingsContent.replace(
            /global\.domain\s?=\s?["'].*?["']/,
            `global.domain = '${newDomain}'`
        );
        
        fs.writeFileSync(settingsPath, settingsContent);
        
        const waktu = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
        await m.reply(`✨ *Domain Panel Berhasil Diganti!*\n\n🌐 Domain baru: *${newDomain}*`);

        // Notif owner
        const ownerJid = `${global.owner}@s.whatsapp.net`;
        await sock.sendMessage(ownerJid, {
            text: `📢 *Pemberitahuan Perubahan Domain*\n\n🌐 Domain telah diganti:\n- *Domain Baru*: ${newDomain}\n- *Tanggal & Waktu*: ${waktu}\n\n⚙️ Sistem Bot Anda telah diperbarui.`,
        });
    } catch (err) {
        console.error("Error updating domain:", err);
        m.reply("❌ Gagal memperbarui domain. Cek logs untuk detail.");
    }
}
break

case "upapikey": {
    const newApiKey = m.quoted ? m.quoted.text : text;
    if (!isOwner) return m.reply("❌ *Akses ditolak! Perintah ini hanya untuk pemilik bot.*");
    if (!newApiKey) return m.reply(`⚠️ *Format salah!*\n\n📌 *Contoh:* ${m.prefix + command} ApiKeyBaru123`);

    try {
        global.apikey = newApiKey;
        const settingsPath = './settings.js';
        let settingsContent = fs.readFileSync(settingsPath, 'utf8');
        settingsContent = settingsContent.replace(
            /global\.apikey\s?=\s?["'].*?["']/,
            `global.apikey = '${newApiKey}'`
        );
        
        fs.writeFileSync(settingsPath, settingsContent);
        
        const waktu = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
        await m.reply(`🔑 *API Key Panel Berhasil Diganti!*\n\n🔐 API Key baru: *${newApiKey}*`);

        // Notif owner
        const ownerJid = `${global.owner}@s.whatsapp.net`;
        await sock.sendMessage(ownerJid, {
            text: `📢 *Pemberitahuan Perubahan API Key*\n\n🔑 API Key telah diganti:\n- *API Key Baru*: ${newApiKey}\n- *Tanggal & Waktu*: ${waktu}\n\n⚙️ Sistem Bot Anda telah diperbarui.`,
        });
    } catch (err) {
        console.error("Error updating API key:", err);
        m.reply("❌ Gagal memperbarui API key. Cek logs untuk detail.");
    }
}
break

case "upcapikey": {
    const newCaApiKey = m.quoted ? m.quoted.text : text;
    if (!isOwner) return m.reply("❌ *Akses ditolak! Perintah ini hanya untuk pemilik bot.*");
    if (!newCaApiKey) return m.reply(`⚠️ *Format salah!*\n\n📌 *Contoh:* ${m.prefix + command} CaApiKeyBaru123`);

    try {
        global.capikey = newCaApiKey;
        const settingsPath = './settings.js';
        let settingsContent = fs.readFileSync(settingsPath, 'utf8');
        settingsContent = settingsContent.replace(
            /global\.capikey\s?=\s?["'].*?["']/,
            `global.capikey = '${newCaApiKey}'`
        );
        
        fs.writeFileSync(settingsPath, settingsContent);
        
        const waktu = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
        await m.reply(`💡 *CA API Key Panel Berhasil Diganti!*\n\n🛡️ CA API Key baru: *${newCaApiKey}*`);

        // Notif owner
        const ownerJid = `${global.owner}@s.whatsapp.net`;
        await sock.sendMessage(ownerJid, {
            text: `📢 *Pemberitahuan Perubahan CA API Key*\n\n💡 CA API Key telah diganti:\n- *CA API Key Baru*: ${newCaApiKey}\n- *Tanggal & Waktu*: ${waktu}\n\n⚙️ Sistem Bot Anda telah diperbarui.`,
        });
    } catch (err) {
        console.error("Error updating CA API key:", err);
        m.reply("❌ Gagal memperbarui CA API key. Cek logs untuk detail.");
    }
}
break

case "updomain-v2": {
    const newDomain = m.quoted ? m.quoted.text : text;
    if (!isOwner) return m.reply("❌ *Akses ditolak! Perintah ini hanya untuk pemilik bot.*");
    if (!newDomain) return m.reply(`⚠️ *Format salah!*\n\n📌 *Contoh:* ${m.prefix + command} domain.com`);

    try {
        global.domainV2 = newDomain;
        
        const settingsPath = './settings.js';
        let settingsContent = fs.readFileSync(settingsPath, 'utf8');
        
        settingsContent = settingsContent.replace(
            /global\.domainV2\s?=\s?["'].*?["']/,
            `global.domainV2 = '${newDomain}'`
        );
        
        fs.writeFileSync(settingsPath, settingsContent);
        
        const waktu = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
        await m.reply(`✨ *Domain V2 Panel Berhasil Diganti!*\n\n🌐 Domain baru: *${newDomain}*`);

        // Notif owner
        const ownerJid = `${global.owner}@s.whatsapp.net`;
        await sock.sendMessage(ownerJid, {
            text: `📢 *Pemberitahuan Perubahan Domain V2*\n\n🌐 Domain telah diganti:\n- *Domain Baru*: ${newDomain}\n- *Tanggal & Waktu*: ${waktu}\n\n⚙️ Sistem Bot Anda telah diperbarui.`,
        });
    } catch (err) {
        console.error("Error updating domain V2:", err);
        m.reply("❌ Gagal memperbarui domain V2. Cek logs untuk detail.");
    }
}
break

case "upapikey-v2": {
    const newApiKey = m.quoted ? m.quoted.text : text;
    if (!isOwner) return m.reply("❌ *Akses ditolak! Perintah ini hanya untuk pemilik bot.*");
    if (!newApiKey) return m.reply(`⚠️ *Format salah!*\n\n📌 *Contoh:* ${m.prefix + command} ApiKeyBaru123`);

    try {
        global.apikeyV2 = newApiKey;
        
        const settingsPath = './settings.js';
        let settingsContent = fs.readFileSync(settingsPath, 'utf8');
        
        settingsContent = settingsContent.replace(
            /global\.apikeyV2\s?=\s?["'].*?["']/,
            `global.apikeyV2 = '${newApiKey}'`
        );
        
        fs.writeFileSync(settingsPath, settingsContent);
        
        const waktu = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
        await m.reply(`🔑 *API Key V2 Panel Berhasil Diganti!*\n\n🔐 API Key baru: *${newApiKey}*`);

        // Notif owner
        const ownerJid = `${global.owner}@s.whatsapp.net`;
        await sock.sendMessage(ownerJid, {
            text: `📢 *Pemberitahuan Perubahan API Key V2*\n\n🔑 API Key telah diganti:\n- *API Key Baru*: ${newApiKey}\n- *Tanggal & Waktu*: ${waktu}\n\n⚙️ Sistem Bot Anda telah diperbarui.`,
        });
    } catch (err) {
        console.error("Error updating API key V2:", err);
        m.reply("❌ Gagal memperbarui API key V2. Cek logs untuk detail.");
    }
}
break

case "upcapikey-v2": {
    const newCaApiKey = m.quoted ? m.quoted.text : text;
    if (!isOwner) return m.reply("❌ *Akses ditolak! Perintah ini hanya untuk pemilik bot.*");
    if (!newCaApiKey) return m.reply(`⚠️ *Format salah!*\n\n📌 *Contoh:* ${m.prefix + command} CaApiKeyBaru123`);

    try {
        global.capikeyV2 = newCaApiKey;
        
        const settingsPath = './settings.js';
        let settingsContent = fs.readFileSync(settingsPath, 'utf8');
        
        settingsContent = settingsContent.replace(
            /global\.capikeyV2\s?=\s?["'].*?["']/,
            `global.capikeyV2 = '${newCaApiKey}'`
        );
        
        fs.writeFileSync(settingsPath, settingsContent);
        
        const waktu = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
        await m.reply(`💡 *CA API Key V2 Panel Berhasil Diganti!*\n\n🛡️ CA API Key baru: *${newCaApiKey}*`);

        // Notif owner
        const ownerJid = `${global.owner}@s.whatsapp.net`;
        await sock.sendMessage(ownerJid, {
            text: `📢 *Pemberitahuan Perubahan CA API Key V2*\n\n💡 CA API Key telah diganti:\n- *CA API Key Baru*: ${newCaApiKey}\n- *Tanggal & Waktu*: ${waktu}\n\n⚙️ Sistem Bot Anda telah diperbarui.`,
        });
    } catch (err) {
        console.error("Error updating CA API key V2:", err);
        m.reply("❌ Gagal memperbarui CA API key V2. Cek logs untuk detail.");
    }
}
break

case "listconfig": {
    if (!isOwner) return m.reply(mess.owner);
    
    const teks = `
╭───⧁ *CONFIGURATION PANEL* ⧁───╮
┃
┃ 🌐 *Domain Utama*: ${global.domain || 'null'}
┃ 🔑 *API Key*: ${global.apikey || 'null'}
┃ 🛡️ *CA API Key*: ${global.capikey || 'null'}
┃
┃ 🌐 *Domain V2*: ${global.domainV2 || 'null'}
┃ 🔑 *API Key V2*: ${global.apikeyV2 || 'null'}
┃ 🛡️ *CA API Key V2*: ${global.capikeyV2 || 'null'}
┃
╰─⧁━━━━━━━━━━━━━━━━━━━━━━━━━━⧁─╯
`;

await sock.sendMessage(m.chat, { 
    text: teks,
    delete: {
        remoteJid: m.chat,
        id: (await message).key.id,
        participant: m.sender,
        fromMe: true,
        seconds: 30 // Hapus Otomatis Dalam 30 Detik
    }
});
}
break

//----------------------------- PANEL INSTALLER -----------------------------//

case "installpanel": {
    if (!isOwner) return reply(mess.owner)
    if (!text) return reply("\nFormat salah!\n\n*Contoh penggunaan :*\nketik .instalpanel ipvps|pwvps|panel.com|node.com|ramserver *(contoh 100000)*");
    
    let vii = text.split("|");
    if (vii.length < 5) return reply("\nFormat salah!\n\n*Contoh penggunaan :*\nketik .instalpanel ipvps|pwvps|panel.com|node.com|ramserver *(contoh 100000)*");
    
    const ress = new ssh2.Client();
    const connSettings = {
        host: vii[0],
        port: '22',
        username: 'root',
        password: vii[1]
    };
    
    const jids = m.chat
    const pass = "admin001";
    let passwordPanel = pass;
    const domainpanel = vii[2];
    const domainnode = vii[3];
    const ramserver = vii[4];
    const deletemysql = `\n`;
    const commandPanel = `bash <(curl -s https://pterodactyl-installer.se)`;
    
    async function instalWings() {
    ress.exec(commandPanel, async (err, stream) => {
        if (err) {
            console.error('Wings installation error:', err);
            reply(`Gagal memulai instalasi Wings: ${err.message}`);
            return ress.end();
        }
        
        stream.on('close', async (code, signal) => {
            await InstallNodes()            
        }).on('data', async (data) => {
            const dataStr = data.toString();
            console.log('Wings Install: ' + dataStr);
            
            if (dataStr.includes('Input 0-6')) {
                stream.write('1\n');
            }
            else if (dataStr.includes('(y/N)')) {
                stream.write('y\n');
            }
            else if (dataStr.includes('Enter the panel address (blank for any address)')) {
                stream.write(`${domainpanel}\n`);
            }
            else if (dataStr.includes('Database host username (pterodactyluser)')) {
                stream.write('admin\n');
            }
            else if (dataStr.includes('Database host password')) {
                stream.write('admin\n');
            }
            else if (dataStr.includes('Set the FQDN to use for Let\'s Encrypt (node.example.com)')) {
                stream.write(`${domainnode}\n`);
            }
            else if (dataStr.includes('Enter email address for Let\'s Encrypt')) {
                stream.write('admin@gmail.com\n');
            }
        }).stderr.on('data', async (data) => {
            console.error('Wings Install Error: ' + data);
            reply(`Error pada instalasi Wings:\n${data}`);
        });
    });
}

    async function InstallNodes() {
        ress.exec('bash <(curl -s https://raw.githubusercontent.com/SkyzoOffc/Pterodactyl-Theme-Autoinstaller/main/createnode.sh)', async (err, stream) => {
            if (err) throw err;
            
            stream.on('close', async (code, signal) => {
                let teks = `
*Install Panel Telah Berhasil ✅*

*Berikut Detail Akun Panel Kamu 📦*

*👤 Username :* admin
*🔐 Password :* ${passwordPanel}
*🌐 Domain Panel:* ${domainpanel}

Silahkan setting alocation & ambil token node di node yang sudah di buat oleh bot

*Cara menjalankan wings :*
*.startwings* ipvps|pwvps|tokennode
`;                
                await reply(teks, jids)
                ress.end();
            }).on('data', async (data) => {
                await console.log(data.toString());
                if (data.toString().includes("Masukkan nama lokasi: ")) {
                    stream.write('Singapore\n');
                }
                if (data.toString().includes("Masukkan deskripsi lokasi: ")) {
                    stream.write('Node By Fhkryxz\n');
                }
                if (data.toString().includes("Masukkan domain: ")) {
                    stream.write(`${domainnode}\n`);
                }
                if (data.toString().includes("Masukkan nama node: ")) {
                    stream.write('FhkryxzOffc\n');
                }
                if (data.toString().includes("Masukkan RAM (dalam MB): ")) {
                    stream.write(`${ramserver}\n`);
                }
                if (data.toString().includes("Masukkan jumlah maksimum disk space (dalam MB): ")) {
                    stream.write(`${ramserver}\n`);
                }
                if (data.toString().includes("Masukkan Locid: ")) {
                    stream.write('1\n');
                }
            }).stderr.on('data', async (data) => {
                console.log('Stderr : ' + data);
                reply(`Error pada instalasi Wings: ${data}`);
            });
        });
    }

    async function instalPanel() {
        ress.exec(commandPanel, (err, stream) => {
            if (err) throw err;
            
            stream.on('close', async (code, signal) => {
                await instalWings();
            }).on('data', async (data) => {
                if (data.toString().includes('Input 0-6')) {
                    stream.write('0\n');
                } 
                if (data.toString().includes('(y/N)')) {
                    stream.write('y\n');
                } 
                if (data.toString().includes('Database name (panel)')) {
                    stream.write('\n');
                }
                if (data.toString().includes('Database username (pterodactyl)')) {
                    stream.write('admin\n');
                }
                if (data.toString().includes('Password (press enter to use randomly generated password)')) {
                    stream.write('admin\n');
                } 
                if (data.toString().includes('Select timezone [Europe/Stockholm]')) {
                    stream.write('Asia/Jakarta\n');
                } 
                if (data.toString().includes('Provide the email address that will be used to configure Let\'s Encrypt and Pterodactyl')) {
                    stream.write('admin@gmail.com\n');
                } 
                if (data.toString().includes('Email address for the initial admin account')) {
                    stream.write('admin@gmail.com\n');
                } 
                if (data.toString().includes('Username for the initial admin account')) {
                    stream.write('admin\n');
                } 
                if (data.toString().includes('First name for the initial admin account')) {
                    stream.write('admin\n');
                } 
                if (data.toString().includes('Last name for the initial admin account')) {
                    stream.write('admin\n');
                } 
                if (data.toString().includes('Password for the initial admin account')) {
                    stream.write(`${passwordPanel}\n`);
                } 
                if (data.toString().includes('Set the FQDN of this panel (panel.example.com)')) {
                    stream.write(`${domainpanel}\n`);
                } 
                if (data.toString().includes('Do you want to automatically configure UFW (firewall)')) {
                    stream.write('y\n')
                } 
                if (data.toString().includes('Do you want to automatically configure HTTPS using Let\'s Encrypt? (y/N)')) {
                    stream.write('y\n');
                } 
                if (data.toString().includes('Select the appropriate number [1-2] then [enter] (press \'c\' to cancel)')) {
                    stream.write('1\n');
                } 
                if (data.toString().includes('I agree that this HTTPS request is performed (y/N)')) {
                    stream.write('y\n');
                }
                if (data.toString().includes('Proceed anyways (your install will be broken if you do not know what you are doing)? (y/N)')) {
                    stream.write('y\n');
                } 
                if (data.toString().includes('(yes/no)')) {
                    stream.write('y\n');
                } 
                if (data.toString().includes('Initial configuration completed. Continue with installation? (y/N)')) {
                    stream.write('y\n');
                } 
                if (data.toString().includes('Still assume SSL? (y/N)')) {
                    stream.write('y\n');
                } 
                if (data.toString().includes('Please read the Terms of Service')) {
                    stream.write('y\n');
                }
                if (data.toString().includes('(A)gree/(C)ancel:')) {
                    stream.write('A\n');
                } 
                console.log('Logger: ' + data.toString());
            }).stderr.on('data', (data) => {
                reply(`Error Terjadi kesalahan :\n${data}`);
                console.log('STDERR: ' + data);
            });
        });
    }

    ress.on('ready', async () => {
        await reply(`*Memproses install server panel 🚀*\n\n` +
                     `*IP Address:* ${vii[0]}\n` +
                     `*Domain Panel:* ${domainpanel}\n\n` +
                     `Mohon tunggu 10-20 menit hingga proses install selesai`);
        
        ress.exec(deletemysql, async (err, stream) => {
            if (err) throw err;
            
            stream.on('close', async (code, signal) => {
                await instalPanel();
            }).on('data', async (data) => {
                await stream.write('\t');
                await stream.write('\n');
                await console.log(data.toString());
            }).stderr.on('data', async (data) => {
                reply(`Error Terjadi kesalahan :\n${data}`);
                console.log('Stderr : ' + data);
            });
        });
    });

    ress.on('error', (err) => {
        console.error('SSH Connection Error:', err);
        reply(`Gagal terhubung ke server: ${err.message}`);
    });

    ress.connect(connSettings);
}
break

case "startwings":
case "configurewings": {
    if (!isOwner) return reply(mess.owner)
    let t = text.split('|');
    if (t.length < 3) return reply("\nFormat salah!\n\n*Contoh penggunaan :*\nketik .startwings ipvps|pwvps|token_wings");

    let ipvps = t[0].trim();
    let passwd = t[1].trim();
    let token = t[2].trim();

    const connSettings = {
        host: ipvps,
        port: 22,
        username: 'root',
        password: passwd
    };

    const command = `${token} && systemctl start wings`;

    const ress = new ssh2.Client();

    ress.on('ready', () => {
        ress.exec(command, (err, stream) => {
            if (err) {
                reply('Gagal menjalankan perintah di VPS');
                ress.end();
                return;
            }

            stream.on('close', async (code, signal) => {
                await reply("Berhasil menjalankan wings node panel pterodactyl ✅");
                ress.end();
            }).on('data', (data) => {
                console.log("STDOUT:", data.toString());
            }).stderr.on('data', (data) => {
                console.log("STDERR:", data.toString());
                // Opsi jika perlu input interaktif
                stream.write("y\n");
                stream.write("systemctl start wings\n");
                reply('Terjadi error saat eksekusi:\n' + data.toString());
            });
        });
    }).on('error', (err) => {
        console.log('Connection Error:', err.message);
        reply('Gagal terhubung ke VPS: IP atau password salah.');
    }).connect(connSettings);
}
break

case "uninstallpanel": { 
if (!isOwner) return reply(mess.owner);
if (!text || !text.split("|")) return reply(`*Contoh penggunaan :*
ketik ${cmd} ipvps|pwvps`)
var vpsnya = text.split("|"); 
if (vpsnya.length < 2) return reply(`*Contoh penggunaan :*
ketik ${cmd} ipvps|pwvps`)
let ipvps = vpsnya[0]; 
let passwd = vpsnya[1]; 
const connSettings = { host: ipvps, port: '22', username: 'root', password: passwd }; 
const boostmysql = `
apt-get remove --purge -y mysql-server mysql-client mysql-common && \
apt-get autoremove -y && apt-get autoclean -y && \
rm -rf /etc/mysql /var/lib/mysql && \
echo "✅ MySQL berhasil dibersihkan."
`;
const command = `bash <(curl -s https://pterodactyl-installer.se)`; 
const ress = new ssh2.Client();

ress.on('ready', async () => {
    await reply("Memproses *uninstall* server panel\nTunggu 1-10 menit hingga proses selesai");

    ress.exec(command, async (err, stream) => {
        if (err) throw err;
        stream.on('close', async (code, signal) => {
            await ress.exec(boostmysql, async (err, stream) => {
                if (err) throw err;
                stream.on('close', async (code, signal) => {
                    await reply("Berhasil *uninstall* server panel ✅");
                }).on('data', async (data) => {
                    await console.log(data.toString());
                    if (data.toString().includes(`Remove all MariaDB databases? [yes/no]`)) {
                        await stream.write("yes\n");
                    }
                }).stderr.on('data', (data) => {
                    reply('Berhasil Membersihkan Database MYSQL Server Panel ✅');
                });
            });
        }).on('data', async (data) => {
            await console.log(data.toString());
            if (data.toString().includes(`Input 0-6`)) {
                await stream.write("6\n");
            }
            if (data.toString().includes(`(y/N)`)) {
                await stream.write("y\n");
            }
            if (data.toString().includes(`* Choose the panel user (to skip don\'t input anything):`)) {
                await stream.write("\n");
            }
            if (data.toString().includes(`* Choose the panel database (to skip don\'t input anything):`)) {
                await stream.write("\n");
            }
        }).stderr.on('data', (data) => {
            m.reply('STDERR: ' + data);
        });
    });
}).on('error', (err) => {
    m.reply('Katasandi atau IP tidak valid');
}).connect(connSettings);

}
break

case "hbpanel":
case "hackbackpanel": {
    if (!isOwner) return reply(mess.owner);

    const t = text.split('|');
    if (t.length < 2) return reply(`*Contoh penggunaan :*
ketik ${cmd} ipvps|pwvps`)

    const ipvps = t[0].trim();
    const passwd = t[1].trim();
    const newuser = "admin" + getRandom("");
    const newpw = "admin" + getRandom("");

    const connSettings = {
        host: ipvps,
        port: 22,
        username: 'root',
        password: passwd
    };

    const command = `bash <(curl -s https://raw.githubusercontent.com/SkyzoOffc/Pterodactyl-Theme-Autoinstaller/main/install.sh)`;
    const ress = new ssh2.Client();

    ress.on('ready', () => {
        ress.exec(command, (err, stream) => {
            if (err) {
                console.error("Exec error:", err);
                reply("Terjadi kesalahan saat menjalankan perintah.");
                ress.end();
                return;
            }

            // Menulis input ke installer
            let hasWritten = false;
            stream.stderr.on('data', (data) => {
                const stderrOutput = data.toString().toLowerCase();
                    stream.write("skyzodev\n");
                    stream.write("7\n");
                    stream.write(`${newuser}\n`);
                    stream.write(`${newpw}\n`);
            });

            stream.on('close', async (code, signal) => {
                let teks = `
*Hackback panel pterodactyl berhasil ✅*

- Username: *${newuser}*
- Password: *${newpw}*
- IP VPS: ${ipvps}
`;
                await sock.sendMessage(m.chat, { text: teks }, { quoted: m });
                ress.end();
            });

            stream.on('data', (data) => {
                console.log(data.toString());
            });
        });
    }).on('error', (err) => {
        console.error('Connection Error:', err);
        reply('❌ Gagal terkoneksi ke VPS. Pastikan IP dan password benar.');
    }).connect(connSettings);
}
break

case "subdo": case "subdomain": {
    if (!isOwner) return m.reply(mess.owner);
    if (!text.includes("|")) return reply(`*Contoh penggunaan :*\nketik ${cmd} hostname|ipvps`);

    let subdomain;
    try {
        const data = fs.readFileSync("./Library/Database/domain.json", 'utf8');
        subdomain = JSON.parse(data);
    } catch (err) {
        console.error("Gagal membaca atau parse file domain.json:", err);
        return reply("Terjadi kesalahan saat membaca konfigurasi domain.");
    }

    const obj = Object.keys(subdomain);
    if (obj.length < 1) return reply("Tidak ada domain yang tersedia di file domain.json");

    const rows = [];
    const [hostname, ip] = text.split("|");

    if (!hostname || !ip) return reply(`*Format salah!*\nContoh: ${cmd} hostname|ipvps`);

    obj.forEach((domain, index) => {
        rows.push({
            title: `🌐 ${domain}`,
            description: `Hasil: https://${hostname.toLowerCase().trim()}.${domain}`,
            id: `.subdomain-response ${index + 1} ${hostname.trim()}|${ip.trim()}`
        });
    });

    await sock.sendMessage(m.chat, {
        buttons: [{
            buttonId: 'action',
            buttonText: { displayText: 'Pilih Domain Anda' },
            type: 4,
            nativeFlowInfo: {
                name: 'single_select',
                paramsJson: JSON.stringify({
                    title: 'Pilih Domain',
                    sections: [{
                        title: `© ${global.namebot} Version ${global.versi}`,
                        rows: rows
                    }]
                })
            }
        }],
        headerType: 1,
        viewOnce: true,
        text: `\nPilih Domain Server Yang Tersedia\nTotal Domain: ${obj.length}\n`
    }, { quoted: m });
}
break

case "subdomain-response": {
    if (!isOwner) return m.reply(mess.owner);
    if (!text || !args[0] || isNaN(args[0])) return reply("Pilihan domain tidak valid!");

    let subdomain;
    try {
        const data = fs.readFileSync("./Library/Database/domain.json", 'utf8');
        subdomain = JSON.parse(data);
    } catch (err) {
        console.error("Gagal membaca atau parse file domain.json:", err);
        return reply("Terjadi kesalahan saat membaca konfigurasi domain.");
    }
    
    const dom = Object.keys(subdomain);
    const domainIndex = Number(args[0]) - 1;

    if (domainIndex >= dom.length || domainIndex < 0) return reply("Domain tidak ditemukan!");
    if (!args[1] || !args[1].includes("|")) return reply("Hostname/IP tidak ditemukan!");

    let tldnya = dom[domainIndex];
    const [host, ip] = args[1].split("|").map(str => str.trim());

    async function subDomain1(host, ip) {
        return new Promise((resolve) => {
            axios.post(
                `https://api.cloudflare.com/client/v4/zones/${subdomain[tldnya].zone}/dns_records`,
                {
                    type: "A",
                    name: `${host.replace(/[^a-z0-9.-]/gi, "")}.${tldnya}`,
                    content: ip.replace(/[^0-9.]/gi, ""),
                    ttl: 3600,
                    priority: 10,
                    proxied: false,
                },
                {
                    headers: {
                        Authorization: `Bearer ${subdomain[tldnya].apitoken}`,
                        "Content-Type": "application/json",
                    },
                }
            ).then(response => {
                const res = response.data;
                if (res.success) {
                    resolve({ success: true, name: res.result?.name, ip: res.result?.content });
                } else {
                    resolve({ success: false, error: "Gagal membuat subdomain." });
                }
            }).catch(error => {
                const errorMsg = error.response?.data?.errors?.[0]?.message || error.message || "Terjadi kesalahan!";
                resolve({ success: false, error: errorMsg });
            });
        });
    }

    try {
        await reply(`⏳ Membuat subdomain *${host.toLowerCase()}.${tldnya}*...`);
        
        let result = await subDomain1(host.toLowerCase(), ip);

        if (result.success) {
            let teks = `✅ Subdomain Berhasil Dibuat!\n\n` +
                       `- IP: *${result.ip}*\n` +
                       `- Subdomain: *${result.name}*`;
            await reply(teks);
        } else {
            return reply(result.error);
        }
    } catch (err) {
        return reply(`❌ Terjadi kesalahan: ${err.message}`);
    }
}
break

//-------------------------------------------------------------------------------------------//

case "addcase": {
    if (!isOwner) return m.reply(mess.owner)
    if (!text && !m.quoted) return m.reply('Mana case nya');
    const fs = require('fs');
    const namaFile = 'Xorizo.js';
    const caseBaru = m.quoted ? m.quoted.text : text;
    
    fs.readFile(namaFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Terjadi kesalahan saat membaca file:', err);
            return m.reply('Gagal membaca file');
        }
        
        // Cari posisi default:
        const posisiDefault = data.indexOf("\ndefault:");
        if (posisiDefault === -1) return m.reply('Tidak dapat menemukan default case');
        
        // Sisipkan case baru + 3 baris kosong SEBELUM default
        const kodeBaruLengkap = 
            data.slice(0, posisiDefault) + 
            '\n' + caseBaru +     // Case baru
            '\n\n' +       // 3 baris jarak
            data.slice(posisiDefault);
            
        fs.writeFile(namaFile, kodeBaruLengkap, 'utf8', (err) => {
            if (err) {
                m.reply('Terjadi kesalahan saat menulis file: ' + err);
            } else {
                m.reply('Case baru berhasil ditambahkan.');
            }
        });
    });
}
break;

case "getcase": {
    if (!isOwner) return m.reply(mess.owner)
    if (!text) {
        const code = fs.readFileSync('Xorizo.js', 'utf8');
        const regex = /case\s+["'`](.+?)["'`]\s*:/g;
        let match;
        const cases = [];
        while ((match = regex.exec(code)) !== null) {
          cases.push(match[1]);
        }
        const rows = []
        cases.forEach((name, index) => rows.push({
        title: `${name}`,
        description: `Klik untuk melihat detail case ${name}`, 
        id: `.getcase ${name}`
        }))
        return sock.sendMessage(m.chat, {
          buttons: [
            {
            buttonId: 'action',
            buttonText: { displayText: 'ini pesan interactiveMeta' },
            type: 4,
            nativeFlowInfo: {
                name: 'single_select',
                paramsJson: JSON.stringify({
                  title: 'Pilih Case',
                  sections: [
                    {
                      title: `© ${global.namebot} Version ${global.versi}`,
                      rows: rows
                    }
                  ]
                })
              }
              }
          ],
          headerType: 1,
          viewOnce: true,
          text: `\nPilih Case Yang Ingin Dilihat\nTotal Case: ${cases.length}\n`
        }, { quoted: m })
    }
    const getcase = (cases) => {
        return "case "+`\"${cases}\"`+fs.readFileSync('./Xorizo.js').toString().split('case \"'+cases+'\"')[1].split("break")[0]+"break"
    }
    try {
        m.reply(`${getcase(q)}`)
    } catch (e) {
        return m.reply(`Case *${text}* tidak ditemukan`)
    }
}
break;

case "listcase": {
    if (!isOwner) return m.reply(mess.owner)
    const code = fs.readFileSync('Xorizo.js', 'utf8');
    const regex = /case\s+["'`](.+?)["'`]\s*:/g;
    let match;
    const cases = [];
    while ((match = regex.exec(code)) !== null) {
      cases.push(match[1]);
    }
    return m.reply(`
*Total Case:* ${cases.length}

- ${cases.join("\n- ")}
`);
}
break;

case "delcase": {
    if (!isOwner) return m.reply(mess.owner)
    if (!text) return m.reply('Masukkan nama case yang ingin dihapus')
    const fs = require('fs')
    const namaFile = 'Xorizo.js'
    fs.readFile(namaFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Terjadi kesalahan saat membaca file:', err)
            return m.reply('Gagal membaca file')
        }
        const casePattern = new RegExp(`case ['"]${text}['"]:[\\s\\S]*?break`, 'g')
        if (!casePattern.test(data)) {
            return m.reply(`Case '${text}' tidak ditemukan`)
        }
        const newContent = data.replace(casePattern, '')
        fs.writeFile(namaFile, newContent, 'utf8', (err) => {
            if (err) {
                console.error('Terjadi kesalahan saat menulis file:', err)
                return m.reply('Gagal menghapus case')
            }
            m.reply(`Case '${text}' berhasil dihapus`)
        })
    })
}
break;

case "addcase2": {
    if (!isOwner) return m.reply(mess.owner);
    if (!text && !m.quoted) return m.reply('Mana teks case yang ingin ditambahkan?');

    const namaFile = './Xorizo.js';
    const caseBaru = m.quoted ? m.quoted.text : text;

    try {
        let data = await fs.promises.readFile(namaFile, 'utf8');
        const posisiDefault = data.lastIndexOf('\ndefault:');

        if (posisiDefault === -1) {
            return m.reply('❌ Tidak dapat menemukan blok `default:`.');
        }

        const caseDenganBreak = caseBaru.trim().endsWith('break;') ? caseBaru : `${caseBaru}\nbreak;`;
        const kodeBaruLengkap = 
            data.slice(0, posisiDefault) + 
            `\n${caseDenganBreak}\n` +
            data.slice(posisiDefault);
            
        await fs.promises.writeFile(namaFile, kodeBaruLengkap, 'utf8');
        m.reply("✅ Case baru berhasil ditambahkan.\n\n⚠️ *PENTING:* Harap restart bot agar fitur baru dapat digunakan.");

    } catch (err) {
        console.error('Gagal menambah case:', err);
        m.reply('❌ Terjadi kesalahan saat memproses file.');
    }
}
break;

case "getcase2": {
    if (!isOwner) return m.reply(mess.owner);

    try {
        const code = await fs.promises.readFile('./Xorizo.js', 'utf8');

        if (!text) {
            const regex = /case\s+["'`](.+?)["'`]\s*:/g;
            let match;
            const cases = [];
            while ((match = regex.exec(code)) !== null) { cases.push(match[1]); }

            if (cases.length === 0) return m.reply("Tidak ada case yang ditemukan.");
            
            const rows = cases.map(name => ({
                title: name,
                description: `Klik untuk melihat detail kode case '${name}'`,
                id: `${m.prefix}getcase ${name}`
            }));
            
            return sock.sendMessage(m.chat, { /* ... pesan tombol Anda ... */ }, { quoted: m });
        }

        const casePattern = new RegExp(`(case ['"\`]${text}['"\`]:[\\s\\S]*?break;)`, 'g');
        const result = casePattern.exec(code);

        if (result && result[0]) {
            return m.reply(`*Kode untuk case "${text}":*\n\n\`\`\`javascript\n${result[0]}\n\`\`\``);
        } else {
            return m.reply(`❌ Case *'${text}'* tidak ditemukan.`);
        }

    } catch (e) {
        console.error("Gagal mendapatkan case:", e);
        return m.reply("❌ Terjadi kesalahan saat memproses file.");
    }
}
break;

case "listcase2": {
    if (!isOwner) return m.reply(mess.owner);

    try {
        const code = await fs.promises.readFile('./Xorizo.js', 'utf8');
        const regex = /case\s+["'`](.+?)["'`]\s*:/g;
        let match;
        const cases = [];
        while ((match = regex.exec(code)) !== null) { cases.push(match[1]); }
        
        return m.reply(`*Total Case Ditemukan:* ${cases.length}\n\n- ${cases.join("\n- ")}`);
    } catch (e) {
        console.error("Gagal list case:", e);
        m.reply("❌ Terjadi kesalahan saat membaca file.");
    }
}
break;

case "delcase2": {
    if (!isOwner) return m.reply(mess.owner);
    if (!text) return m.reply('Masukkan nama case yang ingin dihapus.');

    try {
        let data = await fs.promises.readFile('./Xorizo.js', 'utf8');
        const casePattern = new RegExp(`case ['"\`]${text}['"\`]:[\\s\\S]*?break;`, 'g');
        
        if (!data.match(casePattern)) {
            return m.reply(`❌ Case '${text}' tidak ditemukan.`);
        }
        
        const newContent = data.replace(casePattern, '');
        await fs.promises.writeFile('./Xorizo.js', newContent, 'utf8');
        
        m.reply(`✅ Case '${text}' berhasil dihapus.\n\n⚠️ *PENTING:* Harap restart bot agar perubahan efektif.`);

    } catch (err) {
        console.error('Gagal menghapus case:', err);
        m.reply('❌ Terjadi kesalahan saat memproses file.');
    }
}
break;

case "editcase":
    if (!q) return m.reply('Ups! Formatnya kurang tepat. Contoh: *editcase menu|menuBaru* ⚙️');
    if (!isOwner) return m.reply(mess.owner);

    const [oldCaseName, newCaseName] = q.split('|').map(name => name.trim());
    if (!oldCaseName || !newCaseName) {
        return m.reply('Format kurang lengkap. Coba gini: *editcase namaLama|namaBaru* ✨');
    }

    const filePath = path.join(__dirname, 'Xorizo.js');

    try {
        let fileContent = fs.readFileSync(filePath, 'utf8');

        const regex = new RegExp(`case\\s+['"\`]${oldCaseName}['"\`]\\s*:\\s*`, 'g');

        if (!regex.test(fileContent)) {
            return m.reply(`Case *${oldCaseName}* nggak ditemukan di file ❌`);
        }

        const replaced = fileContent.replace(regex, `case '${newCaseName}':`);
        fs.writeFileSync(filePath, replaced, 'utf8');

        m.reply(`Case *${oldCaseName}* berhasil diubah jadi *${newCaseName}* ✅`);
    } catch (err) {
        console.error(err);
        m.reply('Terjadi error saat memproses file. Coba dicek lagi, ya! ⚠️');
    }
    break
    
case "selftimer":
case "publictimer": {
    if (!isOwner) return m.reply(mess.owner);

    if (args.length < 1) return m.reply(`⏳ Masukkan durasi dalam menit!\nContoh: .${command} 15`);
    
    const minutes = parseInt(args[0]);
    if (isNaN(minutes) || minutes <= 0) return m.reply('⚠️ Waktu harus berupa angka valid (menit).');

    if (global.modeTimer) {
        clearTimeout(global.modeTimer);
        m.reply('⏳ Timer mode sebelumnya telah dibatalkan.');
    }

    const targetMode = command === 'selftimer' ? 'Self' : 'Public';
    const targetModeBool = targetMode === 'Public';

    await m.reply(`✅ Timer diatur! Bot akan masuk ke mode *${targetMode}* dalam *${minutes} menit*.\n\nKetik *.canceltimer* untuk membatalkan.`);

    global.modeTimer = setTimeout(() => {
        try {
            const settingsPath = './settings.js';
            let data = fs.readFileSync(settingsPath, 'utf8');
            
            global.mode_bot = targetModeBool;
            sock.public = targetModeBool;
            let newData = data.replace(/global\.mode_bot\s*=\s*(true|false)/, `global.mode_bot = ${targetModeBool}`);
            fs.writeFileSync(settingsPath, newData, 'utf8');
            
            m.reply(`✅ Bot sekarang dalam mode *${targetMode}*.\nPengaturan telah disimpan secara permanen.`);
            
            global.modeTimer = null;

        } catch (err) {
            console.error("Gagal mengubah mode via timer:", err);
            m.reply(`❌ Gagal mengubah mode secara otomatis. Error: ${err.message}`);
        }
    }, minutes * 60 * 1000);
}
break

case "canceltimer": {
    if (!isOwner) return m.reply(mess.owner);

    if (global.modeTimer) {
        clearTimeout(global.modeTimer);
        global.modeTimer = null;
        m.reply('✅ Timer mode otomatis berhasil dibatalkan.');
    } else {
        m.reply('ℹ️ Tidak ada timer mode yang sedang berjalan.');
    }
}
break

case "payment": case "pay": {
const teksPayment = `
╭──⧁ *Daftar Payment ${global.namaOwner} 🕊*
┃ ➣ 𝐃𝐚𝐧𝐚 : ${global.dana}
┃ ➣ 𝐆𝐨𝐩𝐚𝐲 : ${global.gopay}
┃ ➣ 𝐎𝐯𝐨 : ${global.ovo}
┃ ➣ 𝐒𝐞𝐚𝐛𝐚𝐧𝐤 : ${global.seabank}
┃ ➣ 𝐐𝐑𝐈𝐒 𝐓𝐈𝐍𝐆𝐆𝐀𝐋 𝐒𝐂𝐀𝐍 𝐃𝐈𝐀𝐓𝐀𝐒
╰─⧁━━━━━━━━━━━━━━━━━━━━━━━❍

*Penting!*
Wajib kirimkan bukti transfer demi keamanan bersama!
`
return sock.sendMessage(m.chat, {image: {url: global.qris}, caption: teksPayment, contextInfo: {
isForwarded: true, 
forwardingScore: 9999
}}, {quoted: null})
}
break

case "done":
case "don":
case "proses": {
    if (!isOwner) return reply("Fitur ini hanya untuk owner pemilik bot!");
    if (!text) {
        return reply(`*Format salah!*\n*Contoh:*\n${cmd} nama barang|10000`);
    }
    let itemName, price;
    if (text.includes('|')) {
        const parts = text.split('|');
        price = parts.pop().trim();
        itemName = parts.join('|').trim();
    } else if (text.includes(',')) {
        const parts = text.split(',');
        price = parts.pop().trim();
        itemName = parts.join(',').trim();
    } else {
        return reply(`*Format salah!*\n*Contoh:*\n${cmd} nama barang | 10000`);
    }
    if (!itemName || !price) return reply(`Format tidak lengkap. Pastikan ada nama barang dan harga.`);
    if (isNaN(price)) {
        return reply(`Harga harus berupa angka.\n*Contoh:* ${cmd} ${itemName}|10000`);
    }
    const formattedPrice = `Rp ${parseInt(price).toLocaleString('id-ID')}`;
    const status = /done|don/.test(command) ? "Transaksi Done ✅" : "Dana Telah Diterima ✅";
    
    const teks = `${status}

📦 Pembelian: ${itemName}
💰 Harga: ${formattedPrice}
🗓️ Tanggal: ${global.tanggal(Date.now())}

📢 Cek Testimoni Pembeli:
${global.linkChannel.split("https://")[1] || "-"}

📣 Gabung Grup Share & Promosi:
${global.linkGrup.split("https://")[1] || "-"}`;
    await sock.sendMessage(m.chat, {
        text: teks,
        contextInfo: {
            isForwarded: true,
            forwardingScore: 9999
        }
    }, { quoted: null });
}
break

case "ping": {
    const os = require('os');
    const nou = require('node-os-utils');
    const speed = require('performance-now');

    try {
        const timestamp = speed();
        const tio = await nou.os.oos();
        const tot = await nou.drive.info();
        const memInfo = await nou.mem.info();
        const totalGB = (memInfo.totalMemMb / 1024).toFixed(2);
        const usedGB = (memInfo.usedMemMb / 1024).toFixed(2);
        const freeGB = (memInfo.freeMemMb / 1024).toFixed(2);
        const cpuCores = os.cpus().length;
        const vpsUptime = runtime(os.uptime());
        const botUptime = runtime(process.uptime());
        const latency = (speed() - timestamp).toFixed(4);

        const serverInfo = `
╭───⧁ *SERVER INFORMATION* ⧁───╮
┃
┃ 🖥️ *OS Platform*: ${nou.os.type()}
┃ 💾 *RAM Usage*: ${usedGB}/${totalGB} GB (${freeGB} GB free)
┃ 🗄️ *Disk Space*: ${tot.usedGb}/${tot.totalGb} GB used
┃ 🔢 *CPU Cores*: ${cpuCores} Core(s)
┃ ⏱️ *VPS Uptime*: ${vpsUptime}
┃
╰───⧁ *BOT INFORMATION* ⧁───╯
┃
┃ ⚡ *Response Time*: ${latency} sec
┃ 🔋 *Bot Uptime*: ${botUptime}
┃ 🧠 *CPU Model*: ${os.cpus()[0].model}
┃ 🏷️ *Architecture*: ${os.arch()}
┃ 🏠 *Hostname*: ${os.hostname()}
┃
╰─⧁━━━━━━━━━━━━━━━━━━━━━━━━━━⧁─╯
        `;

        await sock.sendMessage(m.chat, {
            text: serverInfo,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999
            }
        }, { quoted: m });

    } catch (err) {
        console.error("Error in ping command:", err);
        m.reply("❌ Gagal mengambil informasi server. Cek logs untuk detail.");
    }
}
break

case "backupsc":
case "bck":
case "backup": {
    if (m.sender.split("@")[0] !== global.owner && m.sender !== botNumber)
        return m.reply(mess.owner);
    try {        
        const tmpDir = "./Tmp";
        if (fs.existsSync(tmpDir)) {
            const files = fs.readdirSync(tmpDir).filter(f => !f.endsWith(".js"));
            for (let file of files) {
                fs.unlinkSync(`${tmpDir}/${file}`);
            }
        }
        await m.reply("Processing Backup Script . .");        
        const name = `Script-XorizoV5`; 
        const exclude = ["node_modules", "Session", "package-lock.json", "yarn.lock", ".npm", ".cache"];
        const filesToZip = fs.readdirSync(".").filter(f => !exclude.includes(f) && f !== "");

        if (!filesToZip.length) return m.reply("Tidak ada file yang dapat di-backup.");

        execSync(`zip -r ${name}.zip ${filesToZip.join(" ")}`);

        await sock.sendMessage(m.sender, {
            document: fs.readFileSync(`./${name}.zip`),
            fileName: `${name}.zip`,
            mimetype: "application/zip"
        }, { quoted: m });

        fs.unlinkSync(`./${name}.zip`);

        if (m.chat !== m.sender) m.reply("Script bot berhasil dikirim ke private chat.");
    } catch (err) {
        console.error("Backup Error:", err);
        m.reply("Terjadi kesalahan saat melakukan backup.");
    }
}
break

case "own": case "owner": case "developer": {
await sock.sendContact(m.chat, [global.owner], global.namaOwner, "Developer Bot", m)
}
break

case "buyscriptxorizo": case "buyscxorizo": {
    const teks = `
*${global.namebot} Version ${global.versi}*

💰 Harga Script Xorizo ${global.versi} 💰
▫️ Script No Free Up — Rp10.000
▫️ Script Free Up — Rp15.000
▫️ Reseller Script — Rp20.000
▫️ Owner Script — Rp25.000
▫️ Partner Script = Rp30.000

📢 Fitur Unggulan Yang Ada Di Script Xorizo ${global.versi}
- Autoblock Ketika Ada Orang Tidak Dikenal Chat Di Private Message ❌
- Autojpmch Fitur Ini Bisa Mengirim Teks Kepada Channel Secara Otomatis 💯
- Autojpm Fitur Ini Bisa Mengirim Teks Kepada Grup Secara Otomatis ✅
- Group Only Fitur Ini Ketika Dinyalakan Hanya Group Yang Dapat Menggunakan Botnya 🔥
- Antitagowner Fitur Ini Ketika Nomor Owner Ditag Akan Dibalas Otomatis Oleh Bot ⚡
- Jpmch Cooldown Dan No Cooldown Cocok Untuk Yang Open Jasher 💯
- Jpmch Anti Kata Seperti $UNT1K, S3W4, Dan Masih Banyak Lgi Fitur Kerennya 🔥

👤 Mau Melihat Fitur Full Yang Tersedia Discript? Pv Owner Aja Ya 💯🔥

 📦𝗕𝗘𝗡𝗘𝗙𝗜𝗧 𝗣𝗔𝗞𝗘𝗧📦
 
🏷 No Free Update Script
- Tidak Dapat Update Script
- Batas Add Nomor 5
- 80% No Enc

🛍 Free Update Script
- Free Update Selamanya
- Bebas Add Nomor ( Minta Ke Owner )
- 80% No Enc

🛒 Reseller Script
- Bisa Dijual Kepada Orang Lain
- Akses Website Database
- Free Update Selamanya
- 80% No Enc

👑 Owner Script
- Bisa Dijual Kepada Orang Lain
- Akses Website Database
- Free Update Selamanya
- Bisa Jual Reseller Script
- 80% No Enc

👤 Partner Script
- Bisa Dijual Kepada Orang Lain
- Akses Website Database
- Free Update Selamanya
- Bisa Jual Reseller Script
- Bisa Jual Owner Script
- 100% No Enc Full

📲 Minat? Langsung Chat ${global.namasosmed}
👉 ${global.sosmed}
📃 Ragu? Langsung Cek Testimoni
👉 ${global.testimoni}
`;

await sock.relayMessage(m.chat, {
        requestPaymentMessage: {
            currencyCodeIso4217: 'IDR',
            amount1000: 15000000, // 15.000 * 1000
            requestFrom: m.sender,
            noteMessage: {
                extendedTextMessage: {
                    text: teks
                }
            }
        }
}, {});
}
break

default:
if (m.text.toLowerCase().startsWith("xx")) {
    if (!isOwner) return;

    try {
        const result = await eval(`(async () => { ${text} })()`);
        const output = typeof result !== "string" ? util.inspect(result) : result;
        return sock.sendMessage(m.chat, { text: util.format(output) }, { quoted: m });
    } catch (err) {
        return sock.sendMessage(m.chat, { text: util.format(err) }, { quoted: m });
    }
}

if (m.text.toLowerCase().startsWith("x")) {
    if (!isOwner) return;

    try {
        let result = await eval(text);
        if (typeof result !== "string") result = util.inspect(result);
        return sock.sendMessage(m.chat, { text: util.format(result) }, { quoted: m });
    } catch (err) {
        return sock.sendMessage(m.chat, { text: util.format(err) }, { quoted: m });
    }
}

if (m.text.startsWith('$')) {
    if (!isOwner) return;
    
    exec(m.text.slice(2), (err, stdout) => {
        if (err) {
            return sock.sendMessage(m.chat, { text: err.toString() }, { quoted: m });
        }
        if (stdout) {
            return sock.sendMessage(m.chat, { text: util.format(stdout) }, { quoted: m });
        }
    });
}

}

} catch (err) {
console.log(err)
await sock.sendMessage(global.owner+"@s.whatsapp.net", {text: err.toString()}, {quoted: m ? m : null })
}}

//=============================================//

process.on("uncaughtException", (err) => {
console.error("Caught exception:", err);
});


let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.blue(">> Update File:"), chalk.black.bgWhite(__filename));
    delete require.cache[file];
    require(file);
});