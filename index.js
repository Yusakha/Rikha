const { create, Client } = require('@open-wa/wa-automate')
const { color, messageLog } = require('./etc/func.js')
const msgHandler = require('./msgHandler.js')

const start = async (client = new Client()) => {
    console.log('[DEV]', color('Yusakha', 'yellow'))
    console.log('[CLIENT] CLIENT Started!')

    // Message log for analytic
    client.onAnyMessage((fn) => messageLog(fn.fromMe, fn.type))

    // Set all received message to seen
    client.onAck((x => {
        const { to } = x
        if (x !== 3) client.sendSeen(to)
    }))

    // Force it to keep the current session
    client.onStateChanged((state) => {
        console.log('[Client State]', state)
        if (state === 'CONFLICT' || state === 'DISCONNECTED') client.forceRefocus()
    })

    // listening on message
    client.onMessage((message) => {
        // Cut message Cache if cache more than 3K
        client.getAmountOfLoadedMessages().then((msg) => (msg >= 3000) && client.cutMsgCache())
        // Message Handler
        msgHandler(client, message)
    })

    // listen group invitation
    client.onAddedToGroup(({ groupMetadata: { id }, contact: { name } }) =>
        client.getGroupMembersId(id)
            .then((ids) => {
                console.log('[CLIENT]', color(`Invited to Group. [ ${name} => ${ids.length}]`, 'yellow'))
                // conditions if the group members are less than 10 then the bot will leave the group
                // if (ids.length <= 10) {
                //     client.sendText(id, 'Sorry, the minimum group member is 10 user to use this bot. Bye~').then(() => client.leaveGroup(id))
                // }
                // if {
                    client.sendText(id, `Hallo para penghuni *${name}*, terimakasih telah menggunakan bot Chi, kamu bisa melihat menu di *!menu*`)
                // }
            }))

    // listening on Incoming Call
    client.onIncomingCall(( async (call) => {
      await client.sendText(call.peerJid, 'Maaf, saya tidak bisa menerima panggilan. nelfon = block!')
      .then(() => client.contactBlock(call.peerJid))
    }))
}

const options = {
    sessionId: 'Yusakha',
    headless: true,
    qrTimeout: 0,
    authTimeout: 0,
    restartOnCrash: start,
    cacheEnabled: false,
    useChrome: true,
    killProcessOnBrowserClose: true,
    throwErrorOnTosBlock: false,
    chromiumArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--aggressive-cache-discard',
        '--disable-cache',
        '--disable-application-cache',
        '--disable-offline-load-stale-cache',
        '--disk-cache-size=0'
    ]
}

create(options)
    .then((client) => start(client))
    .catch((err) => new Error(err))
