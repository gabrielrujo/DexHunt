const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const { Client, Collection, Events, GatewayIntentBits } = require('discord.js')
const handleInteractionCreate = require('./events/interactionCreate')

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
})

client.commands = new Collection()

const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file))
  if (command?.data && command?.execute) {
    client.commands.set(command.data.name, command)
  } else {
    console.warn(`[WARN] Comando inválido em ${file}`)
  }
}

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`)

  const commandsData = client.commands.map((cmd) => cmd.data.toJSON())

  try {
    if (process.env.GUILD_ID) {
      const guild = await client.guilds.fetch(process.env.GUILD_ID)
      await guild.commands.set(commandsData)
      console.log(`Registered ${commandsData.length} guild commands`)
    } else {
      await client.application.commands.set(commandsData)
      console.log(`Registered ${commandsData.length} global commands`)
    }
  } catch (err) {
    console.error('Failed to register commands:', err)
  }
})

client.on(Events.InteractionCreate, handleInteractionCreate)

client.login(process.env.token)

