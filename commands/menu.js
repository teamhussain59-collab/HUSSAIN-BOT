
module.exports = {
  name: 'menu',
  run: async ({ sock, from }) => {
    await sock.sendMessage(from, { text: '🤖 My Bot Commands\n\n.menu - ye list\n.ping - bot chal raha hai ya nahi 🏓\n.time - Karachi time 🕐' });
  },
};
