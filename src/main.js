require('dotenv').config();
const { Client, IntentsBitField, AttachmentBuilder, MessageFlags } = require('discord.js');

const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

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

async function fetchWithTimeout(url, timeout = 10000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, { signal: controller.signal });
        return response;
    } finally {
        clearTimeout(id); // cleanup so it doesn’t leak timers
    }
}

// Commands
const prefix = "foxo ";
client.on('messageCreate', async function (message){
    if (message.author.bot) return;


    const content = message.content.toLowerCase();

    // foxo greet
    if (content === `${prefix}greet`) {
        await message.reply(`Hello there, ${message.author.tag}!`);
    }

    // foxo ping
    if (content === `${prefix}ping`) {
        const start = Date.now();
        const msg = await message.reply('Pinging…');
        const roundTrip = Date.now() - start;
        const apiPing = Math.round(message.client.ws.ping);
        await msg.edit(`🏓 Pong!\n• Bot latency: \`${roundTrip}ms\`\n• API latency: \`${apiPing}ms\``);
    }

    // foxo joke
    if (content === `${prefix}joke`) {
        const API = ['https://v2.jokeapi.dev/joke/Dark?type=twopart&blacklistFlags=nsfw,explicit',
                     'https://v2.jokeapi.dev/joke/Dark?type=single&blacklistFlags=nsfw,explicit',
                     'https://v2.jokeapi.dev/joke/Programming?type=twopart&blacklistFlags=nsfw,explicit',
                     'https://v2.jokeapi.dev/joke/Programming?type=single&blacklistFlags=nsfw,explicit',
                     'https://v2.jokeapi.dev/joke/Misc?type=twopart&blacklistFlags=nsfw,explicit',
                     'https://v2.jokeapi.dev/joke/Misc?type=single&blacklistFlags=nsfw,explicit'
        ];

        try {
            const randomIndex = Math.floor(Math.random() * API.length);
            const randomAPI = API[randomIndex];
            
            const response = await fetchWithTimeout(randomAPI, 10000);
            const data = await response.json();

            if (data.type === 'twopart') {
                await message.reply(`>  ${data.setup}\n\n>  ${data.delivery}`);
            } else if (data.type === 'single') {
                await message.reply(`>  ${data.joke}`)
            }
        } catch (err) {
            try {
                const randomIndex = Math.floor(Math.random() * API.length);
                const randomAPI = API[randomIndex];
                
                const response = await fetch(randomAPI, { signal: AbortSignal.timeout(10000) });
                const data = await response.json();

                if (data.type === 'twopart') {
                    await message.reply(`>  ${data.setup}\n\n>  ${data.delivery}`);
                } else if (data.type === 'single') {
                    await message.reply(`>  ${data.joke}`)
                }
            } catch (err0) {
                message.reply(">  \`ACTION FAILED\`\n>  \`[" + err0 + "]\`");
            }
        }
    }

    // foxo qr ---
    if (content.startsWith(`${prefix}qr `)) {
        const qrtext = message.content.slice((`${prefix}qr `).length).trim(); 
        const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrtext)}`;
      

        const attachment = new AttachmentBuilder(qrImage, { name: 'qrImage.png' });  
        await message.reply({
            content: `QR Code for __${qrtext}__`,
            files: [attachment]
        });  
    }

    // foxo cat
    if (content === `${prefix}cat`) {
        const catAPI = 'https://api.thecatapi.com/v1/images/search?';

        try {
            const response = await fetch(catAPI);
            const data = await response.json();
            const catImage = data[0].url;

            const attachment = new AttachmentBuilder(catImage, { name: 'catImage.png' });
            await message.reply({ files: [attachment] });            
        } catch (err){
            message.reply(">    \`Failed to fetch Cat\`\n>    \`[" + err + "]\`")
        }
    }

    // foxo fox
    if (content === `${prefix}fox`) {
        const foxAPI = 'https://randomfox.ca/floof/';

        try {
            const response = await fetch(foxAPI);
            const data = await response.json();
            const foxImage = data.image

            const attachment = new AttachmentBuilder(foxImage, { name: 'foxImage.png' });
            await message.reply({ files: [attachment] });
        } catch (err){
            message.reply(">    \`Failed to fetch Fox\`\n>    \`[" + err + "]\`")
        }
    }

    // foxo catgirl / foxgirl
    if (content === `${prefix}catgirl` || content === `${prefix}foxgirl`) {
        let API;
        if (content === `${prefix}catgirl`) {
            API = 'https://api.nekosia.cat/api/v1/images/catgirl'
        } else if (content === `${prefix}foxgirl`) {
            API = 'https://api.nekosia.cat/api/v1/images/foxgirl'
        }

        try {
            const response = await fetchWithTimeout(API, 10000);
            const data = await response.json();
            
            const imageURL = data.image.original.url;
            const imageSrc = data.source.url;
            const artist = data.attribution.artist.username;
            const artistProfile = data.attribution.artist.profile;

            const artistText = artist && artistProfile
                ? `Artist: [${artist}](${artistProfile})`
                : "Artist: Unknown";


            const attachment = new AttachmentBuilder(imageURL, { name: 'image.png'});
            await message.reply({
                content: `Link: ${imageSrc}\nArtist: ${artistText}`,
                files: [attachment],
                flags: MessageFlags.SuppressEmbeds
            });
            return;
        } catch (err){
            try {
                const response = await fetchWithTimeout(API, 10000);
                const data = await response.json();
                
                const imageURL = data.image.original.url;
                const imageSrc = data.source.url;
                const artist = data.attribution.artist.username;
                const artistProfile = data.attribution.artist.profile;
            
                const artistText = artist && artistProfile
                    ? `Artist: [${artist}](${artistProfile})`
                    : "Artist: Unknown";

                const attachment = new AttachmentBuilder(imageURL, { name: 'image.png'});
                await message.reply({
                    content: `Link: ${imageSrc}\n${artistText}`,
                    files: [attachment],
                    flags: MessageFlags.SuppressEmbeds
                });
                return;
            } catch (err0){
                message.reply(">  \`ACTION FAILED\`\n>  \`[" + err0 + "]\`")
                return;
            }
        }
    }

    // foxo fact
    if (content === `${prefix}fact`) {
        const API = 'https://uselessfacts.jsph.pl/api/v2/facts/random?language=en';

        try {
            const response = await fetch(API);
            const data = await response.json();
            const fact = data.text;

            await message.reply(`>    ${fact}`);
        } catch (err) {
            message.reply(">  \`ACTION FAILED\`\n>  \`[" + err + "]\`");
        }
    }



    // Utilities - -
    // foxo viewavatar
    if (content.startsWith(`${prefix}viewavatar`)) {
        try {
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
        } catch (err) {
            message.reply(`>    \`Failed to fetch Avatar\`\n>    \`[${err}]\``);
        }
    }

    // foxo viewicon
    if (content === `${prefix}viewicon`) {
        const icon = message.guild.iconURL({ dynamic: true, size: 2048 });
        const attachment = new AttachmentBuilder(icon, { name: 'icon.png' });

        message.reply({
            content: message.guild.name,
            files: [attachment]
        });
    }

    // foxo userinfo
    if (content.startsWith(`${prefix}userinfo`)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift();
        let input = args[0];

        try {
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
        } catch (err){
                message.reply(`>    \`Failed to fetch User\`\n>    \`[${err}]\``);
        }
    }

    // foxo saveinfo
    if (content.startsWith(`${prefix}saveinfo`)) {
        try {
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
        } catch (err) {
            message.reply(`>    \`Failed to save User Info\`\n>    \`[${err}]\``);
        }
    }

    // foxo serverinfo
    if (content === `${prefix}serverinfo`) {



        const channels = await message.guild.channels.fetch();

        const textChannels = channels.filter(channel =>
            channel.type === 0 ||
            channel.type === 5
        );

        const voiceChannels = channels.filter(channel =>
            channel.type === 2 ||
            channel.type === 13
        );

        const categories = channels.filter(channel =>
            channel.type === 4
        );

        const total = channels.size;


        const roles = await message.guild.roles.fetch();


        const allMembers = await message.guild.members.fetch();
        const bots = allMembers.filter(m => m.user.bot);
        const members = allMembers.filter(m => !m.user.bot);



        const embed = new EmbedBuilder()
            .setTitle(message.guild.name)
            .setDescription(`**ID**: \`${message.guild.id}\`\n**Owner**: <@${message.guild.ownerId}>\n**Creation Date**: <t:${Math.floor(message.guild.createdTimestamp / 1000)}:F>\n\n**Members**\nTotal:\`${message.guild.memberCount}\`\nMembers: \`${members.size}\`\nBots: \`${bots.size}\`\n\n**Channels**\nTotal: \`${total}\`\nText Channels: \`${textChannels.size}\`\nVoice Chat Channels: \`${voiceChannels.size}\`\nCategories: \`${categories.size}\`\n\n**Roles**: \`${roles.size}\`\n**Emoji**: \`${message.guild.emojis.cache.size}\`\n\n**Verification Level**: \`${message.guild.verificationLevel}\``)
            .setThumbnail(message.guild.iconURL())
            .setColor('#00B0F4');
            

        await message.reply({ embeds: [embed] });
    }



    // Help / Command List
    const help = "-h ";
    const commands = {
        "ls": "List of **Milk Foxo**'s available commands.",

        "ping": "Ping the bot!",
        "joke": "Get a random joke!",
        "qr": "Generate a QR code.",
        "cat": "Get a random picture of a cute cat!",
        "fox": "Get a random picture of a cute fox!",
        "fact": "Get a random useless fact.",
        "catgirl": "Get a random picture of a catgirl!",
        "foxgirl": "Get a random picture of a foxgirl!",

        "viewavatar": "View a user's profile picture.",
        "viewicon": "View the server's icon.",
        "userinfo": "List of user's basic informations",
        "serverinfo": "List of server informations—members, channels, etc."
    };

    // foxo -h COMMAND
    if (content.startsWith(`${prefix}${help}`)) {
        const command = content.slice((prefix + help).length).trim();

        if (commands[command]) {
            const embed = new EmbedBuilder()
                .setDescription(`\`foxo ${command}\` — ${commands[command]}`)
                .setColor('#00B0F4');
            
            await message.reply({ embeds: [embed] });
        } else {
            message.reply("❌ Command not found. Try one of these:\n" +
                Object.keys(commands).map(cmd => `${prefix}${help}${cmd}`).join("\n")
            );
        }
    }

    if (content === `${prefix}ls`) {
        const embed = new EmbedBuilder()
            .setTitle("Command List")
            .setDescription(`\`foxo ls\` — List of **Milk Foxo**'s available commands.\n\n\`foxo ping\` — Ping pong!\n\`foxo joke\` — Get a random joke.\n\`foxo qr\` — Generate a QR code.\n\`foxo cat\` — Get a random picture of a cute katze.\n\`foxo fox\` — Get a random image of a cute fox.\n\`foxo fact\` — Get a random useless fact.\n\`foxo catgirl\` — Get a random picture of a catgirl\n\`foxo foxgirl\` — Get a random picture of a foxgirl\n\n\`foxo viewavatar\` — View a user's profile picture.\n\`foxo viewicon\` — View the server's icon.\n\`foxo userinfo\` — List of user's basic informations.\n\`foxo serverinfo\` — List of server informations—members, channels, etc.`)
            .setColor('#00B0F4');

        await message.reply({ embeds: [embed] });
    }
});
// - - -

client.login(process.env.TOKEN);