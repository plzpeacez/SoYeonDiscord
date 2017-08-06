// Load up the discord.js library
const Discord = require("discord.js");

// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

// Here we load the config.json file that contains our token and our prefix values. 
const config = require("./config.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

// Load Osu Api
const osu = require("osu")(config.osuapi); // replace xxxxxxxx with your API key 

// variables in use
var beatmaps = null;
var refreshIntervalId;
var beatmapObj = null;
// const embed1;

client.on("ready", () => {
    // This event will run if the bot starts, and logs in, successfully.
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
    // Example of changing the bot's playing game to something useful. `client.user` is what the
    // docs refer to as the "ClientUser".
    //   client.user.setGame(`on ${client.guilds.size} servers`);
    client.user.setGame('->Command is the one that betrayed you!');
});

client.on("guildCreate", guild => {
    // This event triggers when the bot joins a guild.
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    //   client.user.setGame(`on ${client.guilds.size} servers`);
    client.user.setGame('->Command is the one that betrayed you!');
});

client.on("guildDelete", guild => {
    // this event triggers when the bot is removed from a guild.
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    //   client.user.setGame(`on ${client.guilds.size} servers`);
    client.user.setGame('->Command is the one that betrayed you!');
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
        const uStat = args.join(" ");
        // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
        // message.delete().catch(O_o => { });
        // And we get the bot to say the thing: 
        osu.get_user({
            "u": uStat,
            "m": 3
        }).then(function (result) {
            // console.log(result[0]);
            // message.channel.send(JSON.stringify(result[0].username));
            if (!result[0]) {
                message.channel.send("Doesn't matched.");
                return;
            }
            const embed = new Discord.RichEmbed()
                .setTitle("Level: " + JSON.stringify(result[0].level).replace(/\"/g, "") + " #" + JSON.stringify(result[0].pp_country_rank).replace(/\"/g, "") + " of " + JSON.stringify(result[0].country).replace(/\"/g, ""))
                .setAuthor("Stats for " + JSON.stringify(result[0].username).replace(/\"/g, ""))
                /*
                 * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
                 */
                .setColor(0x00AE86)
                .setDescription("Ranked Score: " + JSON.stringify(result[0].ranked_score).replace(/\"/g, ""))
                .addField("Hit Accuracy: ", JSON.stringify(result[0].accuracy + "%").replace(/\"/g, ""), true)
                // .setDescription("Hit Accuracy: " + JSON.stringify(result[0].accuracy))
                // .setDescription("Play Count: " + JSON.stringify(result[0].playcount))
                .addField("Play Count: ", JSON.stringify(result[0].playcount).replace(/\"/g, ""), true)
                // .setDescription("Total Score: " + JSON.stringify(result[0].total_score))
                .addField("Total Score: ", JSON.stringify(result[0].total_score).replace(/\"/g, ""), true)
                // .setDescription("SS: " + JSON.stringify(result[0].count_rank_ss) + " S: " + JSON.stringify(result[0].count_rank_s) + " A: " + JSON.stringify(result[0].count_rank_a))
                .addField("Total Rank achives ", "SS: " + JSON.stringify(result[0].count_rank_ss).replace(/\"/g, "") + " S: " + JSON.stringify(result[0].count_rank_s).replace(/\"/g, "") + " A: " + JSON.stringify(result[0].count_rank_a).replace(/\"/g, ""), true)
                // .setFooter("This is the footer text, it can hold 2048 characters")
                // .setImage("http://i.imgur.com/yVpymuV.png")
                .setThumbnail("http://s.ppy.sh/a/" + JSON.stringify(result[0].user_id).replace(/\"/g, ""))
                .setTimestamp()

            message.channel.send({ embed });
        });
        // message.channel.send(sayMessage);
    }

    if (command === "best") {
        // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
        // To get the "message" itself we join the `args` back into a string with spaces: 
        const uRecent = args.join(" ");
        // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
        // message.delete().catch(O_o => { });
        // And we get the bot to say the thing: 
        osu.get_user_best({
            "u": uRecent,
            "m": 3,
            "limit": 1
        }).then(function (result) {
            if (!result[0]) {
                message.channel.send("Doesn't matched.");
                return;
            }
            // console.log(result);
            beatmaps = JSON.stringify(result[0]);
            // console.log(beatmaps);
            refreshIntervalId = setInterval(function () {
                // getBm(result[0].beatmap_id);
                // message.channel.send(getBm(result[0].beatmap_id));
                osu.get_beatmaps({
                    "b": result[0].beatmap_id,
                    "m": 3,
                    "limit": 1
                }).then(function (result1) {
                    // console.log(result1);
                    clearInterval(refreshIntervalId);
                    // beatmapObj = result[0];
                    const embed = new Discord.RichEmbed()
                        .setTitle(JSON.stringify(result1[0].artist).replace(/\"/g, "") + " - " + JSON.stringify(result1[0].title).replace(/\"/g, ""))
                        .setColor(0x00FE16)
                        .setDescription("tags: " + JSON.stringify(result1[0].tags).replace(/\"/g, ""))
                        .addField("Total Score: ", JSON.stringify(result[0].score).replace(/\"/g, ""), true)
                        .addField("Max Combo: ", JSON.stringify(result[0].maxcombo).replace(/\"/g, ""), true)
                        .setTimestamp()
                        .setImage("https://b.ppy.sh/thumb/" + JSON.stringify(result1[0].beatmapset_id).replace(/\"/g, "") + "l.jpg")
                        .setThumbnail("https://s.ppy.sh/images/" + JSON.stringify(result[0].rank).replace(/\"/g, "") + ".png")
                    // .setImage("https://b.ppy.sh/thumb/"+JSON.stringify(result1[0].beatmapset_id)+".jpg")
                    // return embed1;
                    message.channel.send({ embed });
                    // beatmaps = null;
                });
            }, 2000);

            // message.channel.send({ embed1 });
        });
        // message.channel.send(sayMessage);
    }

    if (command === "recent") {
        // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
        // To get the "message" itself we join the `args` back into a string with spaces: 
        const uRecent = args.join(" ");
        // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
        // message.delete().catch(O_o => { });
        // And we get the bot to say the thing: 
        osu.get_user_recent({
            "u": uRecent,
            "m": 3,
            "limit": 1
        }).then(function (result) {
            if (!result[0]) {
                message.channel.send("Doesn't played in last 24 hr.");
                return;
            }
            // console.log(result);
            beatmaps = JSON.stringify(result[0]);
            // console.log(beatmaps);
            refreshIntervalId = setInterval(function () {
                // getBm(result[0].beatmap_id);
                // message.channel.send(getBm(result[0].beatmap_id));
                osu.get_beatmaps({
                    "b": result[0].beatmap_id,
                    "m": 3,
                    "limit": 1
                }).then(function (result1) {
                    // console.log(result1);
                    clearInterval(refreshIntervalId);
                    // beatmapObj = result[0];
                    const embed = new Discord.RichEmbed()
                        .setTitle(JSON.stringify(result1[0].artist).replace(/\"/g, "") + " - " + JSON.stringify(result1[0].title).replace(/\"/g, ""))
                        .setColor(0x00FE16)
                        .setDescription("tags: " + JSON.stringify(result1[0].tags).replace(/\"/g, ""))
                        .addField("Total Score: ", JSON.stringify(result[0].score).replace(/\"/g, ""), true)
                        .addField("Max Combo: ", JSON.stringify(result[0].maxcombo).replace(/\"/g, ""), true)
                        .setTimestamp()
                        .setImage("https://b.ppy.sh/thumb/" + JSON.stringify(result1[0].beatmapset_id).replace(/\"/g, "") + "l.jpg")
                        .setThumbnail("https://s.ppy.sh/images/" + JSON.stringify(result[0].rank).replace(/\"/g, "") + ".png")
                    // .setImage("https://b.ppy.sh/thumb/"+JSON.stringify(result1[0].beatmapset_id)+".jpg")
                    // return embed1;
                    message.channel.send({ embed });
                    // beatmaps = null;
                });
            }, 2000);

            // message.channel.send({ embed1 });
        });
        // message.channel.send(sayMessage);
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
    // If the message is "ping"
    if (message.content === '++') {
        // Send "pong" to the same channel
        message.channel.send(message.author.username + ' บอกว่า ++');
        // message.channel.send('บอกว่า ++');
    }
});

client.login(config.token);

// function getBm(bm) {
//     osu.get_beatmaps({
//         "b": bm,
//         "m": 3,
//         "limit": 1
//     }).then(function (result) {
//         console.log(result);
//         clearInterval(refreshIntervalId);
//         beatmapObj = result[0];
//         const embed1 = new Discord.RichEmbed()
//             .setTitle(JSON.stringify(result[0].artist).replace(/\"/g, "") + " - " + JSON.stringify(result[0].title).replace(/\"/g, ""))
//             .setColor(0x00AE86)
//             .setDescription("tags: " + JSON.stringify(result[0].tags).replace(/\"/g, ""))
//             .addField("Total Score: ", beatmaps.score.replace(/\"/g, ""), true)
//             .addField("Max Combo: ", beatmaps.maxcombo.replace(/\"/g, ""), true)
//             .setTimestamp()
//             .setThumbnail("https://b.ppy.sh/thumb/" + JSON.stringify(result[0].beatmapset_id).replace(/\"/g, "") + "l.png")
//         return embed1;
//     });

// }