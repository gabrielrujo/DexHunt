function pingCommand(message) {
  if (message.content === '!ping') {
    message.channel.send('Pong!');
  }
}

module.exports = { pingCommand };