const { MessageEmbed } = require("discord.js");
const ayar = require("../settings.json");
const db = require("quick.db")
const kdb = new db.table("kullanıcı");
const moment = require("moment");
exports.run = async(client, message, args) => {
    if (!message.member.roles.cache.has(ayar.botCommands) && !message.member.roles.cache.has(ayar.jailHammer) && !message.member.hasPermission("ADMINISTRATOR")) return message.react(ayar.no)
    let embed = new MessageEmbed().setColor('RANDOM').setAuthor(message.author.tag, message.author.avatarURL({ dynamic: true }))


    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
    let user = message.guild.member(member)
    let reason = args.splice(1).join(" ") || "Sebep belirtilmedi."
    if (!user) return message.channel.send(embed.setDescription(`${message.author}, Eksik arguman kullandınız, \`.jail @etiket/ID 1m Küfür\``)).then(m => m.delete({ timeout: 7000 }) && message.delete({ timeout: 7000 }))

    if (user.id === message.author.id) return message.react(ayar.no)
    if (user.id === client.user.id) return message.react(ayar.no)
    if (user.roles.highest.position >= message.member.roles.highest.position) return message.react(ayar.no)
    if (user.hasPermission(8)) return message.react(ayar.no)


    let atilanAy = moment(Date.now()).format("MM");
    let atilanSaat = moment(Date.now()).format("HH:mm:ss");
    let atilanGün = moment(Date.now()).format("DD");
    let jailAtılma = `${atilanGün} ${atilanAy.replace("01", "Ocak").replace("02", "Şubat").replace("03", "Mart").replace("04", "Nisan").replace("05", "Mayıs").replace("06", "Haziran").replace("07", "Temmuz").replace("08", "Ağustos").replace("09", "Eylül").replace("10", "Ekim").replace("11", "Kasım").replace("12", "Aralık")} ${atilanSaat}`;

    let cezaID = db.get(`cezaid.${message.guild.id}`) + 1
    let puan = await kdb.fetch(`cezapuan.${user.id}`) || "0"
    let durum = await kdb.get(`durum.${user.id}.jail`)
    if (durum) return message.channel.send(embed.setDescription(`${user} Adlı kullanıcının aktif bir **JAİL** cezası bulunmakta.`)).then(m => m.delete({ timeout: 7000 }) && message.delete({ timeout: 6999 }))


    user.roles.set([ayar.jailRol])
    message.react(ayar.yes)
    message.channel.send(embed.setFooter(`Üyenin ceza puanı: ${puan}`).setDescription(`
${user} Adlı kullanıcı ${message.author} tarafından \`${reason}\` sebebiyle  cezalandırıldı. Ceza ID: \`#${cezaID}\``)).then(m => m.delete({ timeout: 7000 }) && message.delete({ timeout: 7000 }))

    db.add(`cezaid.${message.guild.id}`, +1)
    kdb.add(`jailler.${message.author.id}`, 1)
    kdb.add(`cezapuan.${user.id}`, 15)
    kdb.push(`sicil.${user.id}`, { userID: user.id, adminID: message.author.id, Tip: "JAİL", start: jailAtılma, cezaID: cezaID })
    kdb.set(`durum.${user.id}.jail`, true)
    client.channels.cache.get(ayar.jailLog).send(embed.setDescription(`
    ${user} Adlı kullanıcı cezalıya atıldı.
    
    \`•\` Yetkili: ${message.author} (\`${message.author.id}\`)
    \`•\` Sebep: \`${reason}\`
    \`•\` Tarih: \`${jailAtılma}\``))

};
exports.conf = {
    name: "jail",
    aliases: [],
    permLevel: 0
};
