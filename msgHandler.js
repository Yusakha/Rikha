require('dotenv').config()
const { decryptMedia } = require('@open-wa/wa-decrypt')
const moment = require('moment-timezone')
const fs = require('fs-extra')
moment.tz.setDefault('Asia/Jakarta').locale('id')

const get = require('get')
const { uploadImages } = require('./etc/fetcher.js')

const { menu, mess, info, donasi } = require('./etc/text.js')
const { copypasta, wangy, simp, gws, wibu, sange, crot } = require('./etc/text.js')
const { sreddit, custom } = require('./etc/api.js')
const { msgFilter, color, processTime, is } = require('./etc/func.js')


module.exports = msgHandler = async (client, message) => {
    try {
        const { type, id, from, t, sender, isGroupMsg, chat, author, caption, isMedia, isGif, mimetype, quotedMsg, quotedMsgObj, mentionedJidList } = message
        const { name, formattedTitle } = chat
        let { pushname, verifiedName, formattedName} = sender
        pushname = pushname || verifiedName || formattedName

        // Bot Prefix
        const prefix = '!'
        let { body } = message
        body = (type === 'chat' && body.startsWith(prefix)) ? body : (((type === 'image' || type === 'video') && caption) && caption.startsWith(prefix)) ? caption : ''
        const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
        const arg = body.substring(body.indexOf(' ') + 1)
        const args = body.trim().split(/ +/).slice(1)
        const isCmd = body.startsWith(prefix)
        const isQuotedImage = quotedMsg && quotedMsg.type === 'image'
        const url = args.length !== 0 ? args[0] : ''
        const uaOverride = process.env.UserAgent

        const bodys = caption || body || ''
        const bsplits =  bodys.split(' ')

        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : ''
        const groupMembers = isGroupMsg ? await client.getGroupMembersId(groupId) : ''
        const botNumber = await client.getHostNumber()
        const blockNumber = await client.getBlockedIds()
        const isGroupAdmins = isGroupMsg ? groupAdmins.includes(sender.id) : false
        const isBotGroupAdmins = isGroupMsg ? groupAdmins.includes(botNumber + '@c.us') : false
        const ownerNumber = ["6282230333327@c.us","6282230333327"] // replace with your whatsapp number
        const isOwner = ownerNumber.includes(sender.id)
        const isBlocked = blockNumber.includes(sender.id)

        // [BETA] Avoid Spam Message
        if (isCmd && msgFilter.isFiltered(from) && !isGroupMsg) { return console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname)) }
        if (isCmd && msgFilter.isFiltered(from) && isGroupMsg) { return console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle)) }
        //Console Log
        if (!isCmd && !isGroupMsg) { return console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Message from', color(pushname)) }
        if (!isCmd && isGroupMsg) { return console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Message from', color(pushname), 'in', color(name || formattedTitle)) }
        if (isCmd && !isGroupMsg) { console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname)) }
        if (isCmd && isGroupMsg) { console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle)) }
        // [BETA] Avoid Spam Message
        msgFilter.addFilter(from)

        if (isBlocked) return
        //if (!isOwner) return
        switch(command) {
        //Text
        case 'owner':
        case 'creator': {
            await client.sendContact(from, ownerNumber[0])
            } break
        case 'say':
            if (args.length == 0) return await client.reply(from, `Apa?`, id)
            else await client.sendText(from, arg)
            break
        case 'betatester':
            await client.reply(from, `> type : ${type}\n> id : ${id}\n> from : ${from}\n> t : ${t}\n> sender : ${sender}\n> isGroupMsg : ${isGroupMsg}\n> chat : ${chat}\n> author : ${author}\n> caption : ${caption}\n> isMedia : ${isMedia}\n> isGif : ${isGif}\n> mimetype : ${mimetype}\n> quotedMsg : ${quotedMsg}\n> quotedMsgObj : ${quotedMsgObj}\n> mentionedJidList : ${mentionedJidList}\n> pushname : ${pushname}\n> message : ${message}\n> body : ${body}\n> command : ${command}\n> arg : ${arg}\n> args : ${args}\n> isCmd : ${isCmd}\n> isQuotedImage : ${isQuotedImage}\n> url : ${url}\n> uaOverride : ${uaOverride}\n> bodys : ${bodys}\n> bsplits : ${bsplits}\n> groupId : ${groupId}\n> groupAdmins : ${groupAdmins}\n> groupMembers : ${groupMembers}\n> botNumber : ${botNumber}\n> blockNumber : ${blockNumber}\n> isGroupAdmins : ${isGroupAdmins}\n> isBotGroupAdmins : ${isBotGroupAdmins}\n> ownerNumber : ${ownerNumber}\n> isOwner : ${isOwner}\n> isBlocked : ${isBlocked}`, id)
            break
        case 'menu':
        case 'help':
            await client.reply(from, menu(prefix), id)
            break
        case 'donasi':
        case 'donate':
            await client.reply(from, donasi(pushname, prefix), id)
            break
        case 'info': {
            const loadedMsg = await client.getAmountOfLoadedMessages()
            const chatIds = await client.getAllChatIds()
            const groups = await client.getAllGroups()
            await client.reply(from, info(pushname, loadedMsg, chatIds, groups, prefix), id)
            } break
        case 'null':
        case 'kosong':
            await client.reply(from, "͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏", id)
            break
        //Sticker
        case 'sticker':
        case 'stiker':
        case 's':
            if (isMedia && type === 'image') {
                const mediaData = await decryptMedia(message, uaOverride)
                const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                await client.sendImageAsSticker(from, imageBase64).then(() => console.log(`Sticker Processed for ${processTime(t, moment())} Second`))
            } else if (quotedMsg && quotedMsg.type == 'image') {
                const mediaData = await decryptMedia(quotedMsg, uaOverride)
                const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                await client.sendImageAsSticker(from, imageBase64).then(() => console.log(`Sticker Processed for ${processTime(t, moment())} Second`))
            } else if (args.length === 1) {
                if (!is.Url(url)) { await client.reply(from, mess.error.St, id) }
                await client.sendStickerfromUrl(from, url).then((r) => (!r && r !== undefined)
                    ? client.sendText(from, mess.error.St)
                    : console.log(`Sticker Processed for ${processTime(t, moment())} Second`))
            } else {
                    await client.reply(from, mess.error.St, id)
            } break
        case 'stickergif':
        case 'stikergif':
            if (isMedia || isQuotedVideo) {
                if (mimetype === 'video/mp4' && message.duration < 10 || mimetype === 'image/gif' && message.duration < 10) {
                    var mediaData = await decryptMedia(message, uaOverride)
                    client.reply(from, '[WAIT] Sedang di proses⏳ silahkan tunggu ± 1 min!', id)
                    var filename = `./media/stickergif.${mimetype.split('/')[1]}`
                    await fs.writeFileSync(filename, mediaData)
                    await exec(`gify ${filename} ./media/stickergf.gif --fps=30 --scale=240:240`, async function (error, stdout, stderr) {
                        var gif = await fs.readFileSync('./media/stickergf.gif', { encoding: "base64" })
                        await client.sendImageAsSticker(from, `data:image/gif;base64,${gif.toString('base64')}`)
                        .catch(() => {
                            client.reply(from, 'Maaf filenya terlalu besar!', id)
                        })
                    })
                    } else {
                    client.reply(from, `[❗] Kirim gif dengan caption *${prefix}stickergif* max 10 sec!`, id)
                    }
                } else {
            client.reply(from, `[❗] Kirim gif dengan caption *${prefix}stickergif*`, id)
            }
            break
        //Send random sticker
        case 'roll': {
            const dice = Math.floor(Math.random() * 6) + 1
            await client.sendStickerfromUrl(from, 'https://www.random.org/dice/dice' + dice + '.png')
            } break
        case 'flip': {
            const side = Math.floor(Math.random() * 2) + 1
            if (side == 1) {
            await client.sendStickerfromUrl(from, 'https://i.ibb.co/LJjkVK5/heads.png')
            } else {
            await client.sendStickerfromUrl(from, 'https://i.ibb.co/wNnZ4QD/tails.png')
            }} break
        //Copypasta
        case 'stress':
        case 'copypasta':
            await client.reply(from, copypasta(prefix), id)
            break
        case 'wangy':
            if (body.slice(7).length > 0) {
                await client.reply(from, wangy(body.slice(7)), id)
            } else {
                await client.reply(from, mess.error.It, id)
            } break
        case 'simp':
            if (body.slice(6).length > 0) {
                await client.reply(from, simp(body.slice(6)), id)
            } else {
                await client.reply(from, mess.error.It, id)
            } break
        case 'gws':
            if (body.slice(5).length > 0) {
                await client.reply(from, gws(body.slice(5)), id)
            } else {
                await client.reply(from, mess.error.It, id)
            } break
        case 'wibu':
            if (body.slice(6).length > 0) {
                await client.reply(from, wibu(body.slice(6)), id)
            } else {
                await client.reply(from, mess.error.It, id)
            } break
        case 'sange':
            if (body.slice(7).length > 0) {
                await client.reply(from, sange(body.slice(7)), id)
            } else {
                await client.reply(from, mess.error.It, id)
            } break
        case 'crot':
            if (body.slice(6).length > 0) {
                await client.reply(from, crot(body.slice(6)), id)
            } else {
                await client.reply(from, mess.error.It, id)
            } break
        case 'reddit': {
            if (!isGroupMsg) return await client.reply(from, mess.error.Go, id)
            const arguments = body.slice(8)
            const reddit = await sreddit(arguments)
            if (reddit.nsfw == true) await client.reply(from, mess.error.Nn, id)
            else await client.sendFileFromUrl(from, reddit.url, 'reddit.jpg', `${arguments}\n${reddit.title}\nFrom : ${reddit.author}\nHD : ${reddit.url}`, id)
            .catch(() => {
                client.reply(from, mess.error.Er, id)
            })} break
        // Random Image
        case 'ss':{
            const sesPic = await client.getSnapshot()
            await client.sendFile(from, sesPic, 'session_rin.png', 'Mau buat apaan...', id)
            } break
        case 'toimage':
        case 'toimg': {
            if(!quotedMsg) return await client.reply(from, 'Tidak ada sticker', id)
            else if (quotedMsg && quotedMsg.type == 'video'){
            return await client.reply(from, 'Bukan stiker', id)
            } if(quotedMsg) {
            const mediaData = await decryptMedia(quotedMsg)
            const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
            await client.sendFile(from, imageBase64, 'sticker.jpg')
            }} break
        case 'kucing': {
            q2 = Math.floor(Math.random() * 900) + 300;
            q3 = Math.floor(Math.random() * 900) + 300;
            await client.sendFileFromUrl(from, 'http://placekitten.com/'+q3+'/'+q2, 'neko.png','Neko')
            } break
        case 'awallpaper':
        case 'animewallpaper':
        case 'awp': {
            if (!isGroupMsg) return await client.reply(from, mess.error.Go, id)
            const animewallpaper = await sreddit('Animewallpaper')
            if (animewallpaper.nsfw == true) await client.reply(from, mess.error.Nn, id)
            else await client.sendFileFromUrl(from, animewallpaper.url, 'animewallpaper.jpg', `Anime Wallpaper\n${animewallpaper.title}\nFrom : ${animewallpaper.author}\nHD : ${animewallpaper.url}`, id)
            .catch(() => {
                client.reply(from, mess.error.Er, id)
            })} break
        case 'awallpaperhp':
        case 'animewallpaperhp':
        case 'awphp': {
            if (!isGroupMsg) return await client.reply(from, mess.error.Go, id)
            const animewallpaper = await sreddit('AnimePhoneWallpapers')
            if (animewallpaper.nsfw == true) await client.reply(from, mess.error.Nn, id)
            else await client.sendFileFromUrl(from, animewallpaper.url, 'animewallpaperhp.jpg', `Anime Wallpaper HP\n${animewallpaper.title}\nFrom : ${animewallpaper.author}\nHD : ${animewallpaper.url}`, id)
            .catch(() => {
                client.reply(from, mess.error.Er, id)
            })} break
        case 'neko': {
            if (!isGroupMsg) return await client.reply(from, mess.error.Go, id)
            const neko = await sreddit('kemonomimi')
            if (neko.nsfw == true) await client.reply(from, mess.error.Nn, id)
            else await client.sendFileFromUrl(from, neko.url, 'neko.jpg', `*[Neko]* ${neko.title}\nFrom : ${neko.author}\nHD : ${neko.url}`, id)
            .catch(() => {
                client.reply(from, mess.error.Er, id)
            })} break
        case 'milf': {
            if (!isGroupMsg) return await client.reply(from, mess.error.Go, id)
            const milf = await sreddit('LolisAllGrownUp')
            if (milf.nsfw == true) await client.reply(from, mess.error.Nn, id)
            else await client.sendFileFromUrl(from, milf.url, 'milf.jpg', `Milf\n${milf.title}\nFrom : ${milf.author}\nHD : ${milf.url}`, id)
            .catch(() => {
                client.reply(from, mess.error.Er, id)
            })} break
        case 'loli': {
            if (!isGroupMsg) return await client.reply(from, mess.error.Go, id)
            const loli = await sreddit('Lolirefugees')
            if (loli.nsfw == true) await client.reply(from, mess.error.Nn, id)
            else await client.sendFileFromUrl(from, loli.url, 'loli.jpg', `Loli\n${loli.title}\nFrom : ${loli.author}\nHD : ${loli.url}`, id)
            .catch(() => {
                client.reply(from, mess.error.Er, id)
            })} break
        case 'neechan':
        case 'onechan':
        case 'oneechan':
        case 'neesan':
        case 'onesan':
        case 'oneesan': {
            if (!isGroupMsg) return await client.reply(from, mess.error.Go, id)
            const oneechan = await sreddit('oneesan')
            if (oneechan.nsfw == true) await client.reply(from, mess.error.Nn, id)
            else await client.sendFileFromUrl(from, oneechan.url, 'oneechan.jpg', `Neesan\n${oneechan.title}\nFrom : ${oneechan.author}\nHD : ${oneechan.url}`, id)
            .catch(() => {
                client.reply(from, mess.error.Er, id)
            })} break
        case 'twintails':
        case 'twintail': {
            if (!isGroupMsg) return await client.reply(from, mess.error.Go, id)
            const twintail = await sreddit('twintails')
            if (twintail.nsfw == true) await client.reply(from, mess.error.Nn, id)
            else await client.sendFileFromUrl(from, twintail.url, 'twintail.jpg', `Twintail\n${twintail.title}\nFrom : ${twintail.author}\nHD : ${twintail.url}`, id)
            .catch(() => {
                client.reply(from, mess.error.Er, id)
            })} break
        case 'tsundere':
        case 'tsun': {
            if (!isGroupMsg) return await client.reply(from, mess.error.Go, id)
            const tsundere = await sreddit('Tsunderes')
            if (tsundere.nsfw == true) await client.reply(from, mess.error.Nn, id)
            else await client.sendFileFromUrl(from, tsundere.url, 'tsundere.jpg', `Tsundere\n${tsundere.title}\nFrom : ${tsundere.author}\nHD : ${tsundere.url}`, id)
            .catch(() => {
                client.reply(from, mess.error.Er, id)
            })} break
        case 'meme':
            if ((isMedia || isQuotedImage) && args.length >= 2) {
                const arg = body.trim().substring(body.indexOf(' ') + 1)
                const top = arg.split('|')[0]
                const bottom = arg.split('|')[1]
                const encryptMedia = isQuotedImage ? quotedMsg : message
                const mediaData = await decryptMedia(encryptMedia, uaOverride)
                const getUrl = await uploadImages(mediaData, false)
                const ImageBase64 = await custom(getUrl, top, bottom)
                await client.sendFile(from, ImageBase64, 'meme.png', '', null, true)
            } else {
                client.reply(from, mess.error.Ni, id)
            }
            break
        case 'memesticker':
        case 'memestiker':
        case 'stikermeme':
        case 'stickermeme':
            if ((isMedia || isQuotedImage) && args.length >= 2) {
                const arg = body.trim().substring(body.indexOf(' ') + 1)
                const top = arg.split('|')[0]
                const bottom = arg.split('|')[1]
                const encryptMedia = isQuotedImage ? quotedMsg : message
                const mediaData = await decryptMedia(encryptMedia, uaOverride)
                const getUrl = await uploadImages(mediaData, false)
                const ImageBase64 = await custom(getUrl, top, bottom)
                await client.sendImageAsSticker(from, ImageBase64)
            } else {
                await client.reply(from, mess.error.Ni, id)
            }
            break
        //Group Command
        case 'tag': {
            if (!isGroupMsg) return await client.reply(from, mess.error.Go, id)
            if (!isGroupAdmins) return await client.reply(from, mess.error.Ao, id)
            const groupMem = await client.getGroupMembers(groupId)
            let hehe = `〘 ${pushname} 〙\n${body.slice(5)}\n ╔══✪〘 @${author} 〙✪══\n`
            for (let i = 0; i < groupMem.length; i++) {
                hehe += '╠➥'
                hehe += ` @${groupMem[i].id.replace(/@c.us/g, '')}\n`
            }
            hehe += '╚═〘 Rikha BOT 〙'
            await client.sendTextWithMentions(from, hehe)
            } break
        case 'add': {
            const orang = body.slice(5)
            if (!isGroupMsg) return await client.reply(from, mess.error.Go, id)
            if (bsplits.length === 1) return await client.reply(from, `[❗] Untuk menggunakan fitur ini, kirim perintah *${prefix}add* 628xxxxx`, id)
            if (!isGroupAdmins) return await client.reply(from, mess.error.Ao, id)
            if (!isBotGroupAdmins) return await client.reply(from, mess.error.Ba, id)
            try {
                await client.addParticipant(from,`${orang}@c.us`)
            } catch {
                client.reply(from, mess.error.Ad, id)
            }} break
        case 'kick': {
            if (!isGroupMsg) return await client.reply(from, mess.error.Go, id)
            if (!isGroupAdmins) return await client.reply(from, mess.error.Ao, id)
            if (!isBotGroupAdmins) return await client.reply(from, mess.error.Ba, id)
            if (mentionedJidList.length === 0) return await client.reply(from, `[❗] Untuk menggunakan Perintah ini, kirim perintah *${prefix}kick* @tagmember`, id)
            await client.sendTextWithMentions(from, `Request diterima, mengeluarkan:\n${mentionedJidList.map(x => `@${x.replace('@c.us', '')}`).join('\n')}`)
            for (let i = 0; i < mentionedJidList.length; i++) {
                if (groupAdmins.includes(mentionedJidList[i])) return await client.sendText(from, mess.error.Ag)
                await client.removeParticipant(groupId, mentionedJidList[i])
            }} break
        case 'promote': {
            if (!isGroupMsg) return await client.reply(from, mess.error.Go, id)
            if (!isGroupAdmins) return await client.reply(from, mess.error.Ao, id)
            if (!isBotGroupAdmins) return await client.reply(from, mess.error.Ba, id)
            if (mentionedJidList.length === 0) return await client.reply(from, `[❗] Untuk menggunakan fitur ini, kirim perintah *${prefix}promote* @tagmember`, id)
            if (mentionedJidList.length >= 2) return await client.reply(from, '[❗] Maaf, perintah ini hanya dapat digunakan kepada 1 user.', id)
            if (groupAdmins.includes(mentionedJidList[0])) return await client.reply(from, '[❗] Maaf, user tersebut sudah menjadi admin.', id)
            await client.promoteParticipant(groupId, mentionedJidList[0])
            await client.sendTextWithMentions(from, `Perintah diterima, menambahkan @${mentionedJidList[0]} sebagai admin.`)
            } break
        case 'demote': {
            if (!isGroupMsg) return await client.reply(from, mess.error.Go, id)
            if (!isGroupAdmins) return await client.reply(from, mess.error.Ao, id)
            if (!isBotGroupAdmins) return await client.reply(from, mess.error.Ba, id)
            if (mentionedJidList.length === 0) return await client.reply(from, `[❗] Untuk menggunakan fitur ini, kirim perintah *${prefix}demote* @tagadmin`, id)
            if (mentionedJidList.length >= 2) return await client.reply(from, '[❗] Maaf, perintah ini hanya dapat digunakan kepada 1 orang.', id)
            if (!groupAdmins.includes(mentionedJidList[0])) return await client.reply(from, '[❗] Maaf, user tersebut tidak menjadi admin.', id)
            await client.demoteParticipant(groupId, mentionedJidList[0])
            await client.sendTextWithMentions(from, `Perintah diterima, menghapus jabatan @${mentionedJidList[0]}.`)
            } break
        //Owner command
        case 'delete':
        case 'del':
            // if (!isGroupMsg) return await client.reply(from, 'Fitur ini hanya bisa di gunakan dalam group', id)
            // if (!isGroupAdmins) return await client.reply(from, 'Fitur ini hanya bisa di gunakan oleh admin group', id)
            if (!quotedMsg) return await client.reply(from, `[❗] Salah!!, kirim perintah *${prefix}delete [tagpesanbot]*`, id)
            if (!quotedMsgObj.fromMe) return await client.reply(from, '[❗] Maaf.. Bot tidak bisa mengahpus chat user lain', id)
            await client.deleteMessage(quotedMsgObj.chatId, quotedMsgObj.id, false)
            break
        case 'bc': {
            if (!isOwner) return await client.reply(from, mess.error.Ow, id)
            let msg = body.slice(4)
            const allChats = await client.getAllChatIds()
            for (let ids of allChats) {
                var person = await client.getChatById(ids)
                if (!person.isReadOnly) await client.sendText(ids, `[ Rikha BOT Broadcast ]\n\n${msg}`)
            }
            await client.reply(from, 'Broadcast Success!', id)
            } break
        case 'leaveall': {
            if (!isOwner) return await client.reply(from, mess.error.Ow, id)
            const allChats = await client.getAllChatIds()
            const allGroups = await client.getAllGroups()
            for (let gclist of allGroups) {
                await client.sendText(gclist.contact.id, `Maaf bot sedang pembersihan, total chat aktif : ${allChats.length}\nBot Private <`)
                await client.leaveGroup(gclist.contact.id)
                await client.deleteChat(gclist.contact.id)
            } await client.sendText(from, 'Succes leave all group!')
            } break
        case 'clearall': {
            if (!isOwner) return await client.reply(from, mess.error.Ow, id)
            const allChats = await client.getAllChats()
            for (let dchat of allChats) {
                await client.deleteChat(dchat.id)
            }
            await client.sendText(from, 'Succes clear all chat!')
            } break
        // Not Test
        case 'cg': {
            if (!isOwner) return await client.reply(from, mess.error.Ow, id)
            let msg = body.slice(4)
            const allChats = await client.getAllGroups()
            for (let ids of allChats) {
                await client.sendText(ids.contact.id, msg)
            } await client.reply(from, 'Broadcast Success!', id)
            } break
        //

        default:
            console.log(color('[ERROR]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Unregistered Command from', color(pushname))
            break
        }
    } catch (err) {
        console.error(color(err, 'red'))
    }
}