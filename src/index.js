// Require the necessary discord.js classes
const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});

console.log('ENV TEST:', process.env);
console.log('TOKEN TEST:', process.env.token);

const { Client, Events, GatewayIntentBits } = require('discord.js')
const dotenv = require('dotenv')

dotenv.config();
console.log("Verifying the token: ", process.env.token)

const { token, CLIENT_ID } = process.env

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);