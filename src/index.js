require('dotenv').config();
const { Client, IntentsBitField, AttachmentBuilder } = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
});

client.on('ready', function (c){
    console.log(`✅ ${c.user.tag} is online.`)
});



// Commands
const prefix = "foxo "

client.on('messageCreate', async function (message){
    if (message.author.bot) return;


    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../userData.json');


    // foxo greet
    if (message.content === `${prefix}greet`) {
        await message.reply(`Hello there, ${message.author.tag}!`);
    }

    // foxo ping
    if (message.content === `${prefix}ping`) {
        const start = Date.now();
        const msg = await message.reply('Pinging…');
        const roundTrip = Date.now() - start;
        const apiPing = Math.round(message.client.ws.ping);
        await msg.edit(`🏓 Pong!\n• Bot latency: \`${roundTrip}ms\`\n• API latency: \`${apiPing}ms\``);
    }

    // foxo joke
    if (message.content === `${prefix}joke`) {
        const response = await fetch('https://icanhazdadjoke.com/', {
            headers: { 'Accept': 'application/json' }
        });
        const data = await response.json();
        await message.reply(data.joke);
    }

    // foxo init
    if (message.content === `${prefix}init`) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(raw);

        if (!data.users) data.users = {};

        if (data.users[message.author.id]){
            await message.reply("You already have a Fox Wallet!");
            return;
        }

        data.users[message.author.id] = {
            Username: message.author.tag,
            Money: 500
        };

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

        const balance = data.users[message.author.id].Money;
        await message.reply(`Your Fox Wallet has been initialized!\nYou currently have \`${balance}\` fox coins in your wallet.`);
    }

    // foxo wallet
    if (message.content === `${prefix}wallet`) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(raw);

        if (!data.users || !data.users[message.author.id]) {
            await message.reply("You don't have a Fox Wallet yet!\nUse `foxo init` to create one.");
            return;
        }

        const balance = data.users[message.author.id].Money;
        await message.reply(`Foxo Wallet: \`${balance}\``);
    }

});
// - - -



client.login(process.env.TOKEN);