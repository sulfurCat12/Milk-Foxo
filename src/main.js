require('dotenv').config();
const { Client, IntentsBitField, AttachmentBuilder, MessageFlags, Embed } = require('discord.js');

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


// - - - | - - - | - - -

let startTime;
let intervalId;

const startTimer = () => {
    startTime = Date.now();
    clearInterval(intervalId);
    intervalId = setInterval(() => {
        updateTimer();
    }, 1000);
};

const updateTimer = () => {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);

    const days = Math.floor(elapsedTime / 86400);
    const hours = Math.floor((elapsedTime % 86400) / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = elapsedTime % 60;

    const dayText = days > 0 ? `${days}d ` : "";
    return `${dayText}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

client.on('ready', function (c){
    console.log(`✅ ${c.user.tag} is online.`)
    startTimer();

    setInterval(() => {
        const currentRuntime = updateTimer();
        client.user.setPresence({
            activities: [{ name: `Uptime: ${currentRuntime}`, type: 0 }],
            status: 'online'
        });
    }, 1000);
});

async function fetchWithTimeout(url, timeout = 10000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, { signal: controller.signal });
        return response;
    } finally {
        clearTimeout(id);
    }
}
// - - - | - - - | - - -


// Commands
client.on('messageCreate', async function (message){
    const prefix = "foxo ";
    if (message.author.bot) return;

    const content = message.content.toLowerCase();

    // foxo runtime
    if (content === `${prefix}uptime`) {
        const currentRuntime = updateTimer();
        const embed = new EmbedBuilder()
        .setTitle("Uptime")
        .setDescription(`<@1396403512375640134> has been running for: \`${currentRuntime}\``)
        .setColor("#00AFF4");

        message.reply({ embeds: [embed] });
    }

    // foxo ping
    if (content === `${prefix}ping`) {
        const embed0 = new EmbedBuilder()
            .setDescription("Pinging . . .")
            .setColor("#00AFF4");

        const start = Date.now();
        const msg = await message.reply({ embeds: [embed0] });
        const roundTrip = Date.now() - start;
        const apiPing = Math.round(message.client.ws.ping);

        const embed1 = new EmbedBuilder()
            .setTitle("🏓 Pong!")
            .setDescription(`• Bot latency: \`${roundTrip}ms\`\n• API latency: \`${apiPing}ms\``)
            .setColor("#00AFF4");

        await msg.edit({ embeds: [embed1] });
    }

    // foxo joke
    if (content === `${prefix}joke`) {
        const API = [
            'https://v2.jokeapi.dev/joke/Dark?type=twopart&blacklistFlags=nsfw,explicit',
            'https://v2.jokeapi.dev/joke/Dark?type=single&blacklistFlags=nsfw,explicit',
            'https://v2.jokeapi.dev/joke/Programming?type=twopart&blacklistFlags=nsfw,explicit',
            'https://v2.jokeapi.dev/joke/Programming?type=single&blacklistFlags=nsfw,explicit',
            'https://v2.jokeapi.dev/joke/Misc?type=twopart&blacklistFlags=nsfw,explicit',
            'https://v2.jokeapi.dev/joke/Misc?type=single&blacklistFlags=nsfw,explicit'
        ];

        const joke = async () => {
            const randomIndex = Math.floor(Math.random() * API.length);
            const randomAPI = API[randomIndex];
            
            const response = await fetchWithTimeout(randomAPI, 10000);
            const data = await response.json();

            if (data.type === 'twopart') {
                const twoPartEmbed = new EmbedBuilder()
                    .setDescription(`${data.setup}\n${data.delivery}`)
                    .setColor("#00AFF4");

                await message.reply({ embeds: [twoPartEmbed] });
            } else if (data.type === 'single') {
                const singleEmbed = new EmbedBuilder()
                    .setDescription(`${data.joke}`)
                    .setColor("#00AFF4");

                await message.reply({ embeds: [singleEmbed] });
            }
        }

        try {
            joke()
        } catch (err) {
            try {
                joke()
            } catch (err0) {
                const embed = new EmbedBuilder()
                    .setTitle("[⛔] — ERR0R:")
                    .setDescription(`Action failed:\n\`[ ${err0} ]\``)
                    .setColor("#E24B4B");

                message.reply({ embeds: [embed] });
            }
        }
    }

    // foxo qr ---
    if (content.startsWith(`${prefix}qr `)) {
        try {
            // const qrtext = message.content.slice((`${prefix}qr `).length).trim(); 
            const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrtext)}`;
        
            const embed = new EmbedBuilder()
                .setDescription(`QR Code for \`${qrtext}\``)
                .setImage(qrImage)
                .setColor("#00AFF4");

            await message.reply({ embeds: [embed] });
        } catch (err){
            const embed = new EmbedBuilder()
                .setTitle("[⛔] — ERR0R:")
                .setDescription(`⚠️・Action failed:\n\`[ ${err} ]\`\n\n💡・Usage:\n\`\`\`foxo qr EXAMPLE\`\`\``)
                .setColor("#E24B4B");

            message.reply({ embeds: [embed] });
        }
    }

    // foxo cat
    if (content === `${prefix}cat`) {
        const catAPI = 'https://api.thecatapi.com/v1/images/search?';

        try {
            const response = await fetch(catAPI);
            const data = await response.json();
            const catImage = data[0].url;

            const embed = new EmbedBuilder()
                .setImage(catImage)
                .setColor("#00AFF4");

            await message.reply({ embeds: [embed] });            
        } catch (err){
            const embed = new EmbedBuilder()
                .setTitle("[⛔] — ERR0R:")
                .setDescription(`Action failed:\n\`[ ${err} ]\``)
                .setColor("#E24B4B");

            message.reply({ embeds: [embed] });
        }
    }

    // foxo fox
    if (content === `${prefix}fox`) {
        const foxAPI = 'https://randomfox.ca/floof/';

        try {
            const response = await fetch(foxAPI);
            const data = await response.json();
            const foxImage = data.image

            const embed = new EmbedBuilder()
                .setImage(foxImage)
                .setColor("#00AFF4");

            await message.reply({ embeds: [embed] });
        } catch (err){
            const embed = new EmbedBuilder()
                .setTitle("[⛔] — ERR0R:")
                .setDescription(`Action failed:\n\`[ ${err} ]\``)
                .setColor("#E24B4B");

            message.reply({ embeds: [embed] });
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

        const catfox = async () => {
            const response = await fetchWithTimeout(API, 10000);
            const data = await response.json();
            
            const imageURL = data.image.original.url;
            const imageSrc = data.source.url;
            const artist = data.attribution.artist.username;
            const artistProfile = data.attribution.artist.profile;

            const artistText = artist && artistProfile
                ? `Artist: [${artist}](${artistProfile})`
                : "Artist: \`Unknown\`";

            const embed = new EmbedBuilder()
                .setDescription(`Source: ${imageSrc}\n${artistText}`)
                .setImage(imageURL)
                .setColor("#00AFF4");

            await message.reply({ embeds: [embed] });
            return;
        }

        try {
            catfox()
        } catch (err){
            try {
                    catfox()
            } catch (err0){
                const embed = new EmbedBuilder()
                    .setTitle("[⛔] — ERR0R:")
                    .setDescription(`Action failed:\n\`[ ${err} ]\``)
                    .setColor("#E24B4B");

                message.reply({ embeds: [embed] });
            }
        }
    }

    // foxo kanji
    if (content.startsWith(`${prefix}kanji`)) {
        const kanji = content.slice(11);
        let API = 'https://kanjiapi.dev/v1/kanji/' + kanji;
        
        const doKanji = async () => {
            const response = await fetchWithTimeout(API, 10000);
            const data = await response.json();

            let meaningList = "";
            let kunReadings = "";
            let onReadings = "";

            data.meanings.forEach(function(entry) {
                meaningList += `${entry}, `;
            });
            meaningList = meaningList.slice(0, -2);

            data.kun_readings.forEach(function(entry) {
                kunReadings += `${entry}, `;
            });
            kunReadings = kunReadings.slice(0, -2);

            data.on_readings.forEach(function(entry) {
                onReadings += `${entry}, `;
            });
            onReadings = onReadings.slice(0, -2);

            const embed = new EmbedBuilder()
                .setTitle(`Kanji — ${data.kanji}`)
                .setDescription(`
                    JLPT: \`${data.jlpt ?? 'No info'}\`
                    Grade: \`${data.grade ?? 'No info'}\`\n

                    Meanings: \`${meaningList}\`
                    Kunyomi: \`${kunReadings || 'None'}\`
                    Onyomi: \`${onReadings || 'None'}\`
                    Strokes: \`${data.stroke_count ?? 'No info'}\`
                `)
                .setColor('#00B0F4');

            await message.reply({ embeds: [embed] });
        }

        try {
            doKanji();
        } catch (err) {
            try {
                doKanji();
            } catch (err0) {
                const embed = new EmbedBuilder()
                    .setTitle("[⛔] — ERR0R:")
                    .setDescription(`Action failed:\n\`[ ${err} ]\``)
                    .setColor("#E24B4B");

                message.reply({ embeds: [embed] });
            }
        }
    }


    // - - - | - - - | - - -


    // foxo viewavatar
    if (content.startsWith(`${prefix}viewavatar`)) {
        let input = content.split(" ")[2];

        try {
            if (input.startsWith('<@') && input.endsWith('>')) {
                input = input.slice(2, -1);
                if (input.startsWith('!')) {
                    input = input.slice(1);
                }
            }

            const user = await client.users.fetch(input);
            const proPic = user.displayAvatarURL({ dynamic: true, size: 2048 });

            const embed = new EmbedBuilder()
                .setDescription(`${user.tag}'s [Avatar](${proPic})`)
                .setImage(proPic)
                .setColor('#00B0F4');

            message.reply({ embeds: [embed] });
        } catch (err) {
            const embed = new EmbedBuilder()
                .setTitle("[⛔] — ERR0R:")
                .setDescription(`⚠️・Action failed:\n\`[ ${err} ]\`\n\n💡・Usage: \`\`\`foxo viewavatar @MENTION/USER_ID\`\`\``)
                .setColor("#E24B4B");

            message.reply({ embeds: [embed] });
        }
    }

    // foxo viewicon
    if (content === `${prefix}viewicon`) {
        const icon = message.guild.iconURL({ dynamic: true, size: 2048 });

        const embed = new EmbedBuilder()
            .setTitle(message.guild.name)
            .setImage(message.guild.iconURL({ dynamic: true, size: 2048 }))
            .setColor('#00B0F4');

        message.reply({ embeds: [embed] });
    }

    // foxo userinfo
    if (content.startsWith(`${prefix}userinfo`)) {
        let inpUser = content.split(" ")[2];

        try {
            if (inpUser.startsWith('<@') && inpUser.endsWith('>')) {
                inpUser = inpUser.slice(2, -1);
                if (inpUser.startsWith('!')) {
                    inpUser = inpUser.slice(1);
                }
            }

            const FLAG_NAMES = {
                HypeSquadOnlineHouse1: 'HypeSquad — Bravery',
                HypeSquadOnlineHouse2: 'HypeSquad — Brilliance',
                HypeSquadOnlineHouse3: 'HypeSquad — Balance',
                ActiveDeveloper: 'Active Developer'
            };

            const user = await client.users.fetch(inpUser, { force: true });

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
        } catch (err){
            const embed = new EmbedBuilder()
                .setTitle("[⛔] — ERR0R:")
                .setDescription(`⚠️・Action failed:\n\`[ ${err} ]\`\n\n💡・Usage: \`\`\`foxo userinfo @MENTION/USER_ID\`\`\``)
                .setColor("#E24B4B");

            message.reply({ embeds: [embed] });
        }
    }

    // foxo saveinfo
    if (content.startsWith(`${prefix}saveinfo`)) {
        let inpUser = content.split(" ")[2];

        try {
            if (inpUser.startsWith('<@') && inpUser.endsWith('>')) {
                inpUser = inpUser.slice(2, -1);
                if (inpUser.startsWith('!')) {
                    inpUser = inpUser.slice(1);
                }
            }

            const FLAG_NAMES = {
                HypeSquadOnlineHouse1: 'HypeSquad — Bravery',
                HypeSquadOnlineHouse2: 'HypeSquad — Brilliance',
                HypeSquadOnlineHouse3: 'HypeSquad — Balance',
                ActiveDeveloper: 'Active Developer'
            };

            const user = await client.users.fetch(inpUser, { force: true });

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

            const embed = new EmbedBuilder()
                .setDescription(`Information for **<@${user.id}>** (${user.tag}) has been saved under ID \`${user.id}\`.`)
                .setColor(user.hexAccentColor ?? '#00B0F4');

            await message.reply({ embeds: [embed] });

            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        } catch (err) {
            const embed = new EmbedBuilder()
                .setTitle("[⛔] — ERR0R:")
                .setDescription(`⚠️・Action failed:\n\`[ ${err} ]\`\n\n💡・Usage: \`\`\`foxo saveinfo @MENTION/USER_ID\`\`\``)
                .setColor("#E24B4B");

            message.reply({ embeds: [embed] });
        }
    }

    // foxo serverinfo
    if (content === `${prefix}serverinfo`) {

        const channels = await message.guild.channels.fetch();

        const textChannels = channels.filter(channel => channel.type === 0 || channel.type === 5 );
        const voiceChannels = channels.filter(channel => channel.type === 2 || channel.type === 13 );
        const categories = channels.filter(channel => channel.type === 4 );
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


    // - - - | - - - | - - -


    // Help / Command List
    const info = "-i ";
    const commands = {
        "ls": "List of **Milk Foxo**'s available commands.",

        "ping": "Ping the bot!",
        "joke": "Get a random joke!",
        "qr": "Generate a QR code.\n\n💡・Usage: \`\`\`foxo qr EXAMPLE\`\`\`",
        "cat": "Get a random picture of a cute cat!",
        "fox": "Get a random picture of a cute fox!",
        "catgirl": "Get a random picture of a catgirl!",
        "foxgirl": "Get a random picture of a foxgirl!",
        "kanji": "Get informations about the Kanji.\n\n💡・Usage: \`\`\`foxo kanji KANJI\`\`\`",

        "viewavatar": "View a user's profile picture.\n\n💡・Usage: \`\`\`foxo viewavatar MENTION/USER_ID\`\`\`",
        "viewicon": "View the server's icon.",
        "userinfo": "List of user's basic informations.\n\n💡・Usage: \`\`\`foxo userinfo MENTION/USER_ID\`\`\`",
        "serverinfo": "List of server informations—members, channels, etc."
    };

    // foxo -i COMMAND
    if (content.startsWith(`${prefix}${info}`)) {
        const command = content.split(" ")[2];

        if (commands[command]) {
            const embed = new EmbedBuilder()
                .setDescription(`ℹ️・\`foxo ${command}\` — ${commands[command]}`)
                .setColor('#00B0F4');
            
            await message.reply({ embeds: [embed] });
        }
    }

    if (content === `${prefix}ls`) {
        const embed = new EmbedBuilder()
            .setTitle("Command List")
            .setDescription(`\`foxo ls\` — List of **Milk Foxo**'s available commands.\n\n\`foxo ping\` — Ping pong!\n\`foxo joke\` — Get a random joke.\n\`foxo qr\` — Generate a QR code.\n\`foxo cat\` — Get a random picture of a cute katze.\n\`foxo fox\` — Get a random image of a cute fox.\n\`foxo catgirl\` — Get a random picture of a catgirl\n\`foxo foxgirl\` — Get a random picture of a foxgirl\n\`foxo kanji\` — Get information about the Kanji.\n\n\`foxo viewavatar\` — View a user's profile picture.\n\`foxo viewicon\` — View the server's icon.\n\`foxo userinfo\` — List of user's basic informations.\n\`foxo serverinfo\` — List of server informations—members, channels, etc.`)
            .setColor('#00B0F4');

        await message.reply({ embeds: [embed] });
    }
});
// - - -

client.login(process.env.TOKEN);