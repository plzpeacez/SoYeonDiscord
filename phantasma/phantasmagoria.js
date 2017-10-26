// Load up the discord.js library
const Discord = require("discord.js");

// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

// Here we load the config.json file that contains our token and our prefix values. 
const config = require("./phantasma.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

// Load Osu Api
const osu = require("../osu/osuapi");

// Load WG API
const wg = require("../wg/wgapi");

// Load Ships embed
const ship = require("./ship");

// Load shadowverse embed
const sdv = require("./shadowverse");

//YTDL-CORE
// const YTDL = require("ytdl-core");

// play musics
const servers = {};

// variables in use
// var beatmaps = null;
var refreshIntervalId;
var beatmapObj = null;
// const embed1;

client.on("ready", () => {
    // This event will run if the bot starts, and logs in, successfully.
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
    // Example of changing the bot's playing game to something useful. `client.user` is what the
    // docs refer to as the "ClientUser".
    //   client.user.setGame(`on ${client.guilds.size} servers`);
    client.user.setPresence({ game: { name: 'SoYeon serving on ' + client.guilds.size + ' servers with ' + client.users.size + ' members! thanks for trusting.', type: 0 } });
    // client.user.setGame('+Command is the one that betrayed you!', 'https://www.twitch.tv/osulive');
});

client.on("guildCreate", guild => {
    // This event triggers when the bot joins a guild.
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    //   client.user.setGame(`on ${client.guilds.size} servers`);
    client.user.setGame('+Command is the one that betrayed you!', 'https://www.twitch.tv/osulive');
});

client.on("guildDelete", guild => {
    // this event triggers when the bot is removed from a guild.
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    //   client.user.setGame(`on ${client.guilds.size} servers`);
    client.user.setGame('+Command is the one that betrayed you!', 'https://www.twitch.tv/osulive');
});


client.on("message", async message => {
    // This event will run on every single message received, from any channel or DM.

    // It's good practice to ignore other bots. This also makes your bot ignore itself
    // and not get into a spam loop (we call that "botception").
    if (message.author.bot) return;

    // Also good practice to ignore any message that does not start with our prefix, 
    // which is set in the configuration file.
    if (message.content.indexOf(config.prefix) !== 0) return;

    // Here we separate our "command" name, and our "arguments" for the command. 
    // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
    // command = say
    // args = ["Is", "this", "the", "real", "life?"]
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // Let's go with a few common example commands! Feel free to delete or change those.

    if (command === "ping") {
        // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
        // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
        const m = await message.channel.send("Ping?");
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
    }

    if (command === "help") {
        message.channel.send("Go to \nhttp://rchelincle.me/soyeon \nfor check out all commands");
    }

    if (command === "play") {
        if (!args[0]) {
            message.channel.sendMessage("ใส่ link เพลงด้วยจ้า ~")
            return
        }

        if (!message.member.voiceChannel) {
            message.channel.sendMessage("คุณไม่ได้อยู่ใน voice channel จ้า ~")
            return
        }

        if (!servers[message.guild.id]) {
            servers[message.guild.id] = {
                queue: []
            }
        }

        const server = servers[message.guild.id];

        server.queue.push(args[0]);

        if (!message.guild.voiceConnection) {
            message.member.voiceChannel.join().then(function (connection) {
                play(connection, message);
            })
        }
    }

    if (command === "skip") {
        const server = servers[message.guild.id];

        message.channel.send('Skipped to next song.', { code: true });
        if (server.dispatcher) server.dispatcher.end();
    }

    if (command === "stop") {
        const server = servers[message.guild.id];

        server.queue = [];

        message.channel.send('Stop playing and leave the Voice Channel.', { code: true });
        if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
        return;
    }

    if (command === "queue") {
        const server = servers[message.guild.id];

        if (!servers[message.guild.id]) {
            message.channel.send("ยังไม่มีเพลงต่อไปในรายการ", { code: true })
            return;
        }

        if (server.queue.length == 0) {
            message.channel.send("ยังไม่มีเพลงต่อไปในรายการ", { code: true })
            return;
        }

        for (var i = 0; i < server.queue.length; i++) {
            // console.log(server.queue[i])
            let song = await ytdlgetInfo(server.queue[i]);
            message.channel.send('Next: ' + song, { code: true });
        }
        console.log(server.queue.length)
    }

    if (command === "say") {
        // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
        // To get the "message" itself we join the `args` back into a string with spaces: 
        const sayMessage = args.join(" ");
        // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
        message.delete().catch(O_o => { });
        // And we get the bot to say the thing: 
        message.channel.send(sayMessage);
    }

    if (command === "kick") {
        // This command must be limited to mods and admins. In this example we just hardcode the role names.
        // Please read on Array.some() to understand this bit: 
        // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some?
        if (!message.member.roles.some(r => ["Administrator", "Moderator"].includes(r.name)))
            return message.reply("Sorry, you don't have permissions to use this!");

        // Let's first check if we have a member and if we can kick them!
        // message.mentions.members is a collection of people that have been mentioned, as GuildMembers.
        let member = message.mentions.members.first();
        if (!member)
            return message.reply("Please mention a valid member of this server");
        if (!member.kickable)
            return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");

        // slice(1) removes the first part, which here should be the user mention!
        let reason = args.slice(1).join(' ');
        if (!reason)
            return message.reply("Please indicate a reason for the kick!");

        // Now, time for a swift kick in the nuts!
        await member.kick(reason)
            .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
        message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);

    }

    if (command === "ban") {
        // Most of this command is identical to kick, except that here we'll only let admins do it.
        // In the real world mods could ban too, but this is just an example, right? ;)
        if (!message.member.roles.some(r => ["Administrator"].includes(r.name)))
            return message.reply("Sorry, you don't have permissions to use this!");

        let member = message.mentions.members.first();
        if (!member)
            return message.reply("Please mention a valid member of this server");
        if (!member.bannable)
            return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");

        let reason = args.slice(1).join(' ');
        if (!reason)
            return message.reply("Please indicate a reason for the ban!");

        await member.ban(reason)
            .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
        message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
    }

    if (command === "purge") {
        // This command removes all messages from all users in the channel, up to 100.

        // get the delete count, as an actual number.
        const deleteCount = parseInt(args[0], 10);

        // Ooooh nice, combined conditions. <3
        if (!deleteCount || deleteCount < 2 || deleteCount > 100)
            return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");

        // So we get our messages, and delete them. Simple enough, right?
        const fetched = await message.channel.fetchMessages({ count: deleteCount });
        message.channel.bulkDelete(fetched)
            .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
    }

    if (command === "stat") {
        // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
        // To get the "message" itself we join the `args` back into a string with spaces: 
        const uStat = args[0];
        const mode = args[1];
        const uMode = await getMode(mode);
        if (!args[1]) {
            message.channel.send("ระบุโหมดด้วยจ้า~ \nosu | taiko | ctb | mania \nตัวอย่าง +stat cookiezi osu");
            return;
        }
        // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
        // message.delete().catch(O_o => { });
        // And we get the bot to say the thing: 
        let m = message.channel.send({
            embed: {
                color: 3441103,
                description: "ขอไปหาแปปนะ !"
            }
        });
        try {
            const result = await osu.getUserStat(uStat, uMode)
            // console.log(result)
            if (!result[0]) {
                // message.channel.send("Doesn't matched.");
                m.then((m) => {
                    m.edit({
                        embed: {
                            color: 2441199,
                            description: "หาไม่เจอเลยจ้า T_T"
                        }
                    });
                })
                return;
            }
            const embed = new Discord.RichEmbed()
                .setTitle("Player: " + JSON.stringify(result[0].username).replace(/\"/g, "") + " Level: " + Math.floor(Number(result[0].level)) + " #" + JSON.stringify(result[0].pp_country_rank).replace(/\"/g, "") + " of " + JSON.stringify(result[0].country).replace(/\"/g, ""))
                .setAuthor("Stats for " + JSON.stringify(result[0].username).replace(/\"/g, "") + " #" + Number(result[0].pp_rank).toLocaleString())
                .setColor([0, 174, 164])
                .setDescription("Ranked Score: " + Number(result[0].ranked_score).toLocaleString())
                .addField("Hit Accuracy: ", Number(result[0].accuracy).toFixed(2) + "%", true)
                .addField("Play Count: ", Number(result[0].playcount).toLocaleString(), true)
                .addField("Total Score: ", Number(result[0].total_score).toLocaleString(), true)
                // .setDescription("SS: " + JSON.stringify(result[0].count_rank_ss) + " S: " + JSON.stringify(result[0].count_rank_s) + " A: " + JSON.stringify(result[0].count_rank_a))
                .addField("Total Rank achives ", "SS: " + JSON.stringify(result[0].count_rank_ss).replace(/\"/g, "") + " S: " + JSON.stringify(result[0].count_rank_s).replace(/\"/g, "") + " A: " + JSON.stringify(result[0].count_rank_a).replace(/\"/g, ""), true)
                .addField("Total Hit Count ", "300: " + Number(result[0].count300).toLocaleString() + " Hits \n100: " + Number(result[0].count100).toLocaleString() + " Hits \n50: " + Number(result[0].count50).toLocaleString() + " Hits", true)
                .setThumbnail("http://s.ppy.sh/a/" + JSON.stringify(result[0].user_id).replace(/\"/g, ""))
                .setTimestamp()
                .setFooter("Requested @ " + message.author.username, message.author.avatarURL)
                .setURL("https://osu.ppy.sh/u/" + JSON.stringify(result[0].user_id).replace(/\"/g, ""))

            message.channel.send({ embed });
            m.then((m) => {
                m.delete()
            })
        } catch (err) {
            // message.channel.send("Doesn't matched.");
            m.then((m) => {
                m.edit({
                    embed: {
                        color: 2441199,
                        description: "หาไม่เจอเลยจ้า T_T"
                    }
                });
            })
        }

        // message.channel.send(sayMessage);
    }

    if (command === "best") {
        // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
        // To get the "message" itself we join the `args` back into a string with spaces: 
        const uRecent = args[0];
        const mode = args[1];
        const uMode = await getMode(mode);
        if (!args[1]) {
            message.channel.send("ระบุโหมดด้วยจ้า~ \nosu | taiko | ctb | mania \nตัวอย่าง +best cookiezi osu");
            return;
        }
        // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
        // message.delete().catch(O_o => { });
        // And we get the bot to say the thing: 
        let m = message.channel.send({
            embed: {
                color: 3441103,
                description: "ขอไปหาแปปนะ !"
            }
        });
        try {
            const result = await osu.getUserBest(uRecent, uMode);
            if (!result[0]) {
                // message.channel.send("Doesn't matched.");
                m.then((m) => {
                    m.edit({
                        embed: {
                            color: 2441199,
                            description: "หาไม่เจอเลยจ้า T_T"
                        }
                    });
                })
                return;
            }
            const result1 = await osu.getBeatmap(result[0].beatmap_id, uMode);
            const embed = new Discord.RichEmbed()
                .setTitle(JSON.stringify(result1[0].artist).replace(/\"/g, "") + " - " + JSON.stringify(result1[0].title).replace(/\"/g, ""))
                .setColor(0x00FE16)
                .setDescription("tags: " + JSON.stringify(result1[0].tags).replace(/\"/g, ""))
                .addField("Total Score: ", Number(result[0].score).toLocaleString(), true)
                .addField("Max Combo: ", Number(result[0].maxcombo).toLocaleString(), true)
                .addField("Statistics ", "Hit 300:  " + Number(result[0].count300).toLocaleString() + " \nHit 100:   " + Number(result[0].count100).toLocaleString() + " \nHit 50:     " + Number(result[0].count50).toLocaleString() + " \nMiss:       " + Number(result[0].countmiss).toLocaleString(), true)
                .setTimestamp()
                .setFooter("Requested @ " + message.author.username, message.author.avatarURL)
                .setImage("https://b.ppy.sh/thumb/" + JSON.stringify(result1[0].beatmapset_id).replace(/\"/g, "") + "l.jpg")
                .setThumbnail("https://s.ppy.sh/images/" + JSON.stringify(result[0].rank).replace(/\"/g, "") + ".png")
            message.channel.send({ embed });
            m.then((m) => {
                m.delete()
            })
        } catch (err) {
            // message.channel.send("Doesn't matched.");
            m.then((m) => {
                m.edit({
                    embed: {
                        color: 2441199,
                        description: "หาไม่เจอเลยจ้า T_T"
                    }
                });
            })
        }
    }

    if (command === "recent") {
        // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
        // To get the "message" itself we join the `args` back into a string with spaces: 
        const uRecent = args[0];
        const mode = args[1];
        const uMode = await getMode(mode);
        if (!args[1]) {
            message.channel.send("ระบุโหมดด้วยจ้า~ \nosu | taiko | ctb | mania \nตัวอย่าง +recent cookiezi osu");
            return;
        }
        // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
        // message.delete().catch(O_o => { });
        // And we get the bot to say the thing: 
        let m = message.channel.send({
            embed: {
                color: 3441103,
                description: "ขอไปหาแปปนะ !"
            }
        });
        try {
            const recent = await osu.getUesrRecent(uRecent, uMode);
            if (!recent[0]) {
                // message.channel.send("Doesn't played in last 24 hr.");
                m.then((m) => {
                    m.edit({
                        embed: {
                            color: 2441199,
                            description: "รู้สึกจะไม่ได้เข้าเลยใน 1 วันที่ผ่านมา"
                        }
                    });
                })
                return;
            }
            const beatmap = await osu.getBeatmap(recent[0].beatmap_id, uMode);
            const embed = new Discord.RichEmbed()
                .setTitle(JSON.stringify(beatmap[0].artist).replace(/\"/g, "") + " - " + JSON.stringify(beatmap[0].title).replace(/\"/g, ""))
                .setColor(0x00FE16)
                .setDescription("tags: " + JSON.stringify(beatmap[0].tags).replace(/\"/g, ""))
                .addField("Total Score: ", Number(recent[0].score).toLocaleString(), true)
                .addField("Max Combo: ", Number(recent[0].maxcombo).toLocaleString(), true)
                .addField("Statistics ", "Hit 300:  " + Number(recent[0].count300).toLocaleString() + " \nHit 100:   " + Number(recent[0].count100).toLocaleString() + " \nHit 50:     " + Number(recent[0].count50).toLocaleString() + " \nMiss:       " + Number(recent[0].countmiss).toLocaleString(), true)
                .setTimestamp()
                .setFooter("Requested @ " + message.author.username, message.author.avatarURL)
                .setImage("https://b.ppy.sh/thumb/" + JSON.stringify(beatmap[0].beatmapset_id).replace(/\"/g, "") + "l.jpg")
                .setThumbnail("https://s.ppy.sh/images/" + JSON.stringify(recent[0].rank).replace(/\"/g, "") + ".png")
            message.channel.send({ embed });
            m.then((m) => {
                m.delete()
            })
        } catch (err) {
            // message.channel.send("Doesn't played in last 24 hr.");
            m.then((m) => {
                m.edit({
                    embed: {
                        color: 2441199,
                        description: "รู้สึกจะไม่ได้เข้าเลยใน 1 วันที่ผ่านมา"
                    }
                });
            })
        }
    }

    if (command === "shipinfo") {
        // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
        // To get the "message" itself we join the `args` back into a string with spaces: 
        let type = args[0];
        let name = args.slice(1).join(' ');
        let pic;
        wg.getShipType(type).then((result) => {
            pic = result;
        })

        // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
        // message.delete().catch(O_o => { });
        // And we get the bot to say the thing: 
        wg.searchByName(name, type).then((result) => {
            let obj;
            // console.log(Object.keys(result));
            for (var i in result) {
                obj = result[i];
                // console.log(result[i].description);
            }

            // Stat here
            let surv
            if (obj.default_profile.armour.total !== 0)
                surv = "\nSurvivability: " + Number(obj.default_profile.armour.total).toLocaleString() + "\n" + statDisplay(Number(obj.default_profile.armour.total))
            else surv = ""
            let tor
            if (obj.default_profile.weaponry.torpedoes !== 0)
                tor = "\nTorpedoes: " + Number(obj.default_profile.weaponry.torpedoes).toLocaleString() + "\n" + statDisplay(Number(obj.default_profile.weaponry.torpedoes))
            else tor = ""
            let airc
            if (obj.default_profile.weaponry.aircraft !== 0)
                airc = "\nAircraft: " + Number(obj.default_profile.weaponry.aircraft).toLocaleString() + "\n" + statDisplay(Number(obj.default_profile.weaponry.aircraft))
            else airc = ""
            let arti
            if (obj.default_profile.weaponry.artillery !== 0)
                arti = "\nArtillery: " + Number(obj.default_profile.weaponry.artillery).toLocaleString() + "\n" + statDisplay(Number(obj.default_profile.weaponry.artillery))
            else arti = ""
            let aad
            if (obj.default_profile.weaponry.anti_aircraft !== 0)
                aad = "\nAA Defense: " + Number(obj.default_profile.weaponry.anti_aircraft).toLocaleString() + "\n" + statDisplay(Number(obj.default_profile.weaponry.anti_aircraft))
            else aad = ""
            let mane
            if (obj.default_profile.mobility.total !== 0)
                mane = "\nManeuverability: " + Number(obj.default_profile.mobility.total).toLocaleString() + "\n" + statDisplay(Number(obj.default_profile.mobility.total))
            else mane = ""
            let conc
            if (obj.default_profile.concealment.total !== 0)
                conc = "\nConcealment: " + Number(obj.default_profile.concealment.total).toLocaleString() + "\n" + statDisplay(Number(obj.default_profile.concealment.total))
            else conc = ""
            let stat = surv + tor + airc + arti + aad + mane + conc

            // Richembed here
            const embed = new Discord.RichEmbed()
                .setColor(3447003)
                .setTitle("World of Warships Encyclopedia")
                .setAuthor(JSON.stringify(obj.name).replace(/\"/g, ""))
                .setDescription(JSON.stringify(obj.description).replace(/\"|\\/g, ""))
                .addField("Nation: ", JSON.stringify(obj.nation).replace(/\"/g, ""), true)
                .addField("Price: ", Number(obj.price_credit).toLocaleString() + " credits", true)
                .addField("Tier: ", Number(obj.tier).toLocaleString(), true)
                .addField("Type: ", JSON.stringify(obj.type).replace(/\"/g, ""), true)
                .addField("Health: ", Number(obj.default_profile.armour.health).toLocaleString(), true)
                .addField("Turning Radius: ", Number(obj.default_profile.mobility.turning_radius).toLocaleString() + " m", true)
                .addField("Max Speed: ", Number(obj.default_profile.mobility.max_speed).toLocaleString() + " knots", true)
                .addField("Stats: ", stat, false)
                .setTimestamp()
                .setFooter("Requested @ " + message.author.username, message.author.avatarURL)
                .setThumbnail("http://glossary-asia-static.gcdn.co/icons/wows/current/vehicle/types/" + JSON.stringify(pic).replace(/\"/g, "") + "/normal.png")
                .setImage("http://glossary-asia-static.gcdn.co/icons/wows/current/vehicle/medium/" + JSON.stringify(obj.ship_id_str).replace(/\"/g, "") + ".png")

            message.channel.send({ embed });
        }).catch((err) => {
            console.log(err);
            message.channel.send("ประเภทเรือหรือชื่อเรือ ไม่ตรงกับคำค้นหา ลองใหม่จ้า~ \nตัวอย่างนะ  +shipinfo bb ARP Kongō");
        })
    }

    if (command === "xxxxxxuserpvp") {
        // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
        // To get the "message" itself we join the `args` back into a string with spaces: 
        let username = args[0];
        let type = args[1];
        let name = args.slice(2).join(' ');
        let pic;
        wg.getStr(name, type).then((result) => {
            pic = result;
        })

        // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
        // message.delete().catch(O_o => { });
        // And we get the bot to say the thing: 
        wg.pvpStatics(name, type, username).then((result) => {
            let obj = result;
            // console.log(obj)
            let stat = "Maximum destroyed per battle: " + Number(obj.pvp.max_frags_battle).toLocaleString() + "\nBase capture points: " + Number(obj.pvp.capture_points).toLocaleString();
            let stat2 = "\nDraws: " + Number(obj.pvp.draws).toLocaleString() + "\nVictories: " + Number(obj.pvp.wins).toLocaleString();
            let stat3 = "\nDefeats: " + Number(obj.pvp.losses).toLocaleString() + "\nMaximum Experience Points per battle: " + Number(obj.pvp.max_xp).toLocaleString();
            let stat4 = "\nEnemy aircraft destroyed: " + Number(obj.pvp.planes_killed).toLocaleString() + "\nDamage caused: " + Number(obj.pvp.damage_dealt).toLocaleString();
            let stat5 = "\nWarships destroyed: " + Number(obj.pvp.frags).toLocaleString() + "\nMax ships spotted: " + Number(obj.pvp.max_ships_spotted).toLocaleString();

            let main = 'Maximum destroyed per battle: ' + Number(obj.pvp.main_battery.max_frags_battle).toLocaleString() + "\nHits: " + Number(obj.pvp.main_battery.hits).toLocaleString();
            let main2 = '\nWarships destroyed: ' + Number(obj.pvp.main_battery.frags).toLocaleString() + "\nShots fired: " + Number(obj.pvp.main_battery.shots).toLocaleString();

            let sec = 'Maximum destroyed per battle: ' + Number(obj.pvp.second_battery.max_frags_battle).toLocaleString() + "\nHits: " + Number(obj.pvp.second_battery.hits).toLocaleString();
            let sec2 = '\nWarships destroyed: ' + Number(obj.pvp.second_battery.frags).toLocaleString() + "\nShots fired: " + Number(obj.pvp.second_battery.shots).toLocaleString();

            let torp = 'Maximum destroyed per battle: ' + Number(obj.pvp.torpedoes.max_frags_battle).toLocaleString() + "\nHits: " + Number(obj.pvp.torpedoes.hits).toLocaleString();
            let torp2 = '\nWarships destroyed: ' + Number(obj.pvp.torpedoes.frags).toLocaleString() + "\nShots fired: " + Number(obj.pvp.torpedoes.shots).toLocaleString();

            let ramm = 'Warships destroyed: ' + Number(obj.pvp.ramming.frags).toLocaleString() + '\nMaximum destroyed per battle: ' + Number(obj.pvp.ramming.max_frags_battle).toLocaleString();

            const embed = new Discord.RichEmbed()
                .setColor("#34dde1")
                .setTitle("Statistics of Player's Ships : " + name)
                .setAuthor("Player: " + username)
                // .setDescription(JSON.stringify(obj.description).replace(/\"|\\/g, ""))
                .addField("Battles fought: ", Number(obj.battles).toLocaleString() + " Times", true)
                .addField("Travelled: ", Number(obj.distance).toLocaleString() + " Miles", true)
                .addField("Main battery firing statistics: ", main + main2, false)
                .addField("Secondary armament firing statistics: ", sec + sec2, true)
                .addField("Statistics of attacking targets with torpedoes: ", sec + sec2, false)
                .addField("Statistics of ramming enemy warships: ", ramm, false)
                .addField("Random battles: ", stat + stat2 + stat3 + stat4 + stat5, true)
                // .addField("Stats: ", stat+stat2+stat3+stat4, true)
                .setTimestamp()
            // .setThumbnail("http://glossary-asia-static.gcdn.co/icons/wows/current/vehicle/small/" + JSON.stringify(pic).replace(/\"/g, "") + ".png")
            // .setImage("http://glossary-asia-static.gcdn.co/icons/wows/current/vehicle/medium/" + JSON.stringify(pic).replace(/\"/g, "") + ".png")

            message.channel.send({ embed });
            // console.log(pic)
        }).catch((err) => {
            console.log(err);
            message.channel.send("ประเภทเรือหรือชื่อเรือ ไม่ตรงกับคำค้นหา ลองใหม่จ้า~ \nตัวอย่างนะ  +userpvp YONE cv Midway");
        })
    }

    if (command === "shipstats") {
        // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
        // To get the "message" itself we join the `args` back into a string with spaces: 
        let type = args[0];
        let name = args.slice(1).join(' ');
        let m = message.channel.send({
            embed: {
                color: 3441103,
                description: "ขอไปหาแปปนะ !"
            }
        });
        try {
            const emb = await ship.getEmbed(name, type);
            message.channel.send({ embed: emb })
            m.then((m) => {
                m.delete()
            })
        } catch (err) {
            // message.channel.send(emb)
            m.then((m) => {
                m.edit({
                    embed: {
                        color: 2441199,
                        description: "ประเภทเรือหรือชื่อเรือ ไม่ตรงกับคำค้นหา ลองใหม่จ้า~ \nตัวอย่างนะ  +shipstats bb ARP Kongō\n(สำหรับบางลำมันเช็ค top modules ไม่ได้ สาเหตุมาจาก API ครับ เช่น Iowa งี้ กำลังหาทางแก้อยู่"
                    }
                });
            })
        }
    }

    if (command === "card") {
        // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
        // To get the "message" itself we join the `args` back into a string with spaces: 
        let evolved = false;
        let type;
        let name;
        if (args[0] === "evolv") {
            type = args[1];
            name = args.slice(2).join(' ');
            evolved = true;
        } else {
            type = args[0];
            name = args.slice(1).join(' ');
        }
        let m = message.channel.send({
            embed: {
                color: 3441103,
                description: "Searching...!"
            }
        });
        try {
            const emb = await sdv.getEmbed(name, type, evolved);
            if (!emb) {
                m.then((m) => {
                    m.edit({
                        embed: {
                            color: 2441199,
                            description: "ไม่เจอเลยจ้า ~"
                        }
                    });
                })
            }
            // message.channel.send({ embed: emb })
            m.then((m) => {
                m.edit({ embed: emb })
            })
        } catch (err) {
            // message.channel.send(emb)
            m.then((m) => {
                m.edit({
                    embed: {
                        color: 2441199,
                        description: "ไม่เจอเลยจ้า ~"
                    }
                });
            })
        }
    }

    if (command === "dm") {
        let dmCh = args[0];
        let word = args.slice(1).join(' ');
        let ch = client.channels.get(dmCh);
        ch.sendMessage(word)
    }
});

// Create an event listener for new guild members
client.on('guildMemberAdd', member => {
    // Send the message to the guilds default channel (usually #general), mentioning the member
    member.guild.defaultChannel.send(`Welcome to the server, ${member}!`);

    // If you want to send the message to a designated channel on a server instead
    // you can do the following:
    const channel = member.guild.channels.find('name', 'member-log');
    // Do nothing if the channel wasn't found on this server
    if (!channel) return;
    // Send the message, mentioning the member
    channel.send(`Welcome to the server, ${member}`);
});

// Create an event listener for messages
client.on('message', message => {
    if (message.author.bot) return;
    // If the message is "ping"
    if (message.content === '++' || /\+\+/.test(message.content)) {
        // Send "pong" to the same channel
        message.channel.send(message.author.username + ' บอกว่า ' + message.content);
        // message.channel.send('บอกว่า ++');
    }

    var randomWord = [
        "Me ?",
        "⊙﹏⊙",
        "ヽ( ´ー`)ノ",
        "o(︶︿︶)o",
        "（*｀・_ゝ・）",
        "Hey There!"
    ]

    if (message.mentions.users.find(val => val.username === 'SoYeon')) {
        // console.log(message.mentions.users);
        message.channel.send(randomWord[Math.floor(Math.random() * randomWord.length)]);
    }

    // if (message.content === '555' || /555/.test(message.content)) {
    //     // Send "pong" to the same channel
    //     message.channel.send('โอ้ยขำ 555+');
    //     // message.channel.send('บอกว่า ++');
    // }
});

client.login(config.token);

client.on("message", async message => {
    const args = message.content.slice(config.keyword.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if (message.channel.type === "dm") {
        // message.author.send("ต้องขอโทษด้วยครับเนื่องจากบอท ไม่สามารถตอบคำถามอะไรได้มากในตอนนี้ \nหากมีคำถามหรือข้อสงสัย Add มาที่discord SoYeon#8163 ได้เลยครับ \nขออภัยในความไม่สะดวก");
        // console.log(message.content);
        var ch = client.channels.get('355605045745680384');
        ch.sendMessage('('+message.author.dmChannel.id+')'+message.author+": "+message.content);
        if (command === "sig") {
            const sigMessage = args.join(" ");
            // message.author.send("Your message here." + message.content);
            client.user.setPresence({ game: { name: sigMessage, type: 0 } });
            message.author.send("Your message was setted.");
        }

        if (command === "stream") {
            const stream = args[0];
            const sigMessage = args.slice(1).join(' ');
            // message.author.send("Your message here." + message.content);
            client.user.setGame(sigMessage, stream);
            message.author.send("Your message was setted.");
        }

        if (command === "status") {
            const sigMessage = await args.join(" ");
            if (sigMessage === "online") {
                client.user.setStatus("online");
                message.author.send("Your status was set to online.");
            }
            if (sigMessage === "idle") {
                client.user.setStatus("idle");
                message.author.send("Your status was set to idle.");
            }
            if (sigMessage === "invisible") {
                client.user.setStatus("invisible");
                message.author.send("Your status was set to invisible.");
            }
            if (sigMessage === "dnd") {
                client.user.setStatus("dnd");
                message.author.send("Your status was set to dnd.");
            }
            // message.author.send("Your message here." + message.content);
        }
    }
});

function getMode(mode) {
    if (mode === "osu") {
        return 0;
    }
    else if (mode === "taiko") {
        return 1;
    }
    else if (mode === "ctb") {
        return 2;
    }
    else if (mode === "mania") {
        return 3;
    }
    else {
        return 0;
    }
}

function statDisplay(num) {
    let dis = ""
    for (var i = 1; i <= num; i++) {
        if (i % 10 | i == 0) {
            dis += "l"
        }
        else {
            dis += "|"
        }
    }
    // console.log(dis)
    return dis;
}

function play(connection, message) {
    const server = servers[message.guild.id];

    server.dispatcher = connection.playStream(YTDL(server.queue[0], { filter: "audioonly" }));

    YTDL.getInfo(server.queue[0], function (err, info) {
        // console.log(info)
        // message.channel.send('Now playing: '+info.title+' โดยคุณ '+message.author.username, {code:true});
        const embed = new Discord.RichEmbed()
            .setColor(3441103)
            .addField("Now Playing", "[" + info.title + "](" + info.video_url + ")", false)
            .setFooter("Requested @ " + message.author.username, message.author.avatarURL)
            .setThumbnail(info.iurlmaxres)
        message.channel.send({ embed });
    });

    server.queue.shift();

    server.dispatcher.on("end", function () {
        if (server.queue[0]) play(connection, message);
        else connection.disconnect();
    })
}

function ytdlgetInfo(url) {
    return new Promise((resolve, reject) => {
        YTDL.getInfo(url, function (err, info) {
            if (!err) {
                resolve(info.title)
            }
        })
    })
}