
module.exports = {
  name: 'ping',
  run: async ({ sock, from }) => {
    await sock.sendMessage(from, { text: 'Pong! Bot chal raha hai. 🏓' });
  },
};
