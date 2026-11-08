
module.exports = {
  name: 'time',
  run: async ({ sock, from }) => {
    const t = new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' });
    await sock.sendMessage(from, { text: '🕐 Karachi time: ' + t });
  },
};
