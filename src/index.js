const path = require('path')
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
})

const { Client, Events, GatewayIntentBits } = require('discord.js')

// só pra testar se carregou
console.log('TOKEN:', process.env.token)

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
})

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`)
})

client.on('messageCreate', (message) => {
  if (message.author.bot) return

  if (message.content === '!ping') {
    message.channel.send('Pong!')
  }
})

client.login(process.env.token)
