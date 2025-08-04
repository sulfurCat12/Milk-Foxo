require('dotenv').config();
const { exec } = require('child_process');
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
const prefix = "foxo ";

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

    // foxo qr ---
    if (message.content.startsWith(`${prefix}qr `)) {  
        const qrcode = message.content;  
        const qrtext = message.content.slice((`${prefix}qr `).length).trim(); 
        const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrtext)}`;
      

        const attachment = new AttachmentBuilder(qrImage, { name: 'qrImage.png' });  
        await message.channel.send({ files: [attachment] });  
    }

    // foxo cat
    if (message.content === `${prefix}cat`) {
        const catAPI = 'https://api.thecatapi.com/v1/images/search?';

        try {
            const response = await fetch(catAPI);
            const data = await response.json();
            const catImage = data[0].url;

            const attachment = new AttachmentBuilder(catImage, { name: 'catImage.png' });
            await message.channel.send({ files: [attachment] });            
        } catch (err){
            message.reply(">    \`Failed to fetch Cat\`\n>    \`[" + err + "]\`")
        }
    }

    // foxo fox
    if (message.content === `${prefix}fox`) {
        const foxAPI = 'https://randomfox.ca/floof/';

        try {
            const response = await fetch(foxAPI);
            const data = await response.json();
            const foxImage = data.image

            const attachment = new AttachmentBuilder(foxImage, { name: 'foxImage.png' });
            await message.channel.send({ files: [attachment] });
        } catch (err){
            message.reply(">    \`Failed to fetch Fox\`\n>    \`[" + err + "]\`")
        }
    }
});
// - - -



client.login(process.env.TOKEN);