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
const prefix = "foxo ";
client.on('messageCreate', async function (message){
    if (message.author.bot) return;


    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../userData.json');

    const { EmbedBuilder } = require('discord.js');



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



    // Utilities - -

    // foxo viewavatar
    if (message.content.startsWith(`${prefix}viewavatar`)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift();
        let input = args[0];

        if (command === "viewavatar") {
            if (input.startsWith('<@') && input.endsWith('>')) {
                input = input.slice(2, -1);
                if (input.startsWith('!')) {
                    input = input.slice(1);
                }
            }

            const user = await client.users.fetch(input);
            const proPic = user.displayAvatarURL({ dynamic: true, size: 2048 });
            const attachment = new AttachmentBuilder(proPic, { name: 'proPic.png' });

            message.reply({
                content: `${user.tag}'s Avatar:\n\`${proPic}\``,
                files: [attachment]
            });
        }
    }

    // foxo userinfo
    if (message.content.startsWith(`${prefix}userinfo`)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift();
        let input = args[0];

        if (command === "userinfo") {
            if (input.startsWith('<@') && input.endsWith('>')) {
                input = input.slice(2, -1);
                if (input.startsWith('!')) {
                    input = input.slice(1);
                }
            }


            const FLAG_NAMES = {
                HypeSquadOnlineHouse1: 'HypeSquad – Bravery',
                HypeSquadOnlineHouse2: 'HypeSquad – Brilliance',
                HypeSquadOnlineHouse3: 'HypeSquad – Balance',
                ActiveDeveloper: 'Active Developer'
            };


            const user = await client.users.fetch(input, { force: true });

            const badgeNames = user.flags?.toArray() ?? [];
            const badgeList  = badgeNames.length ? badgeNames.map(flag => FLAG_NAMES[flag] || flag).join(', ') : 'None';


            const embed = new EmbedBuilder()
                .setTitle(`Information: ${user.tag} — ${user.id}`)
                .setDescription(`
                    **Username**: \`${user.tag}\`
                    **User ID**: \`${user.id}\`
                    **Join Date**: \`${user.createdAt}\`
                    **Bot Account**: \`${user.bot}\`
                    **Badges**: \`${badgeList}\`
                    
                    **Avatar URL**: \`${user.displayAvatarURL({ dynamic: true, size: 2048 })}\`
                    **Banner URL**: \`${user.bannerURL({ dynamic: true, size: 2048 }) || 'None'}\`
                    **Profile Colour**: \`${user.hexAccentColor || 'None'}\`
                    **Avatar Decoration**: \`${user.avatarDecorationURL() || 'None'}\`
                `)
                .setThumbnail(`${user.displayAvatarURL()}`)
                .setColor(user.hexAccentColor ?? '#00B0F4');

            await message.reply({ embeds: [embed] });
        }
    }

    // foxo saveinfo
    if (message.content.startsWith(`${prefix}saveinfo`)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift();
        let input = args[0];

        if (command === "saveinfo") {
            if (input.startsWith('<@') && input.endsWith('>')) {
                input = input.slice(2, -1);
                if (input.startsWith('!')) {
                    input = input.slice(1);
                }
            }
        }


        const FLAG_NAMES = {
            HypeSquadOnlineHouse1: 'HypeSquad – Bravery',
            HypeSquadOnlineHouse2: 'HypeSquad – Brilliance',
            HypeSquadOnlineHouse3: 'HypeSquad – Balance',
            ActiveDeveloper: 'Active Developer'
        };


        const user = await client.users.fetch(input, { force: true });


        const badgeNames = user.flags?.toArray() ?? [];
        const badgeList  = badgeNames.length ? badgeNames.map(f => FLAG_NAMES[f] || f).join(', '): 'None';



        const filePath = path.join(__dirname, '../userData.json');
        const raw      = fs.readFileSync(filePath, 'utf8');
        const data     = JSON.parse(raw);

        data.users = data.users || {};
        data.users[user.id] = {
            Username: user.tag,
            UserID:   user.id,
            Join_Date: user.createdAt,
            Badges:   badgeList,

            Avatar_URL: `${user.displayAvatarURL()}`,
            Banner_URL: `${user.bannerURL()}`,
            Profile_Colour: `${user.hexAccentColor}`,
            Avatar_Decoration: `${user.avatarDecorationURL()}`
        };

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

        const embed = new EmbedBuilder()
            .setDescription("Information for **" + user.tag + "** has been saved under ID __" + user.id + "__.")
            .setColor(user.hexAccentColor ?? '#00B0F4');

        await message.reply({ embeds: [embed] });
    }
});
// - - -


// Level/XP System
client.on('messageCreate', function (message){
    if (message.author.bot) return;
});
// - - -



client.login(process.env.TOKEN);