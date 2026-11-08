
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const config = require('./config.js');

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    browser: ['Ubuntu', 'Chrome', '120.0.0'],
  });

  if (!sock.authState.creds.registered) {
    setTimeout(async () => {
      const code = await sock.requestPairingCode(config.ownerNumber);
      console.log('Pairing code:', code);
    }, 5000);
  }

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'open') console.log('Bot connected.');
    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) {
        console.log('Logged out. Auth folder delete karo aur dobara deploy karo.');
      } else {
        start();
      }
    }
  });

  const commands = new Map();
  const dir = path.join(__dirname, 'commands');
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.js'))) {
    const cmd = require(path.join(dir, f));
    commands.set(cmd.name, cmd);
  }

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const m of messages) {
      if (!m.message || !m.key.fromMe) continue;
      const text = m.message.conversation || m.message.extendedTextMessage?.text || '';
      if (!text.startsWith(config.prefix)) continue;
      const name = text.slice(config.prefix.length).trim().split(/\s+/)[0].toLowerCase();
      const cmd = commands.get(name);
      if (cmd) await cmd.run({ sock, from: m.key.remoteJid, m });
    }
  });
}

start();
