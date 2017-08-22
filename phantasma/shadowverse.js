const sv = require('../shadowverse/sdvapi')

// Load up the discord.js library
const Discord = require("discord.js");

function getClan(clan) {
    return new Promise((resolve, reject) => {
        if (clan.toLowerCase() === "neutral") {
            resolve('0');
        }
        if (clan.toLowerCase() === "forest" || clan.toLowerCase() === "forestcraft" || clan.toLowerCase() === "elf") {
            resolve('1');
        }
        if (clan.toLowerCase() === "sword" || clan.toLowerCase() === "swordcraft" || clan.toLowerCase() === "royal") {
            resolve('2');
        }
        if (clan.toLowerCase() === "rune" || clan.toLowerCase() === "runecraft" || clan.toLowerCase() === "mage" || clan.toLowerCase() === "witch") {
            resolve('3');
        }
        if (clan.toLowerCase() === "dragon" || clan.toLowerCase() === "dragoncraft") {
            resolve('4');
        }
        if (clan.toLowerCase() === "shadow" || clan.toLowerCase() === "shadowcraft" || clan.toLowerCase() === "necro" || clan.toLowerCase() === "necromancer") {
            resolve('5');
        }
        if (clan.toLowerCase() === "blood" || clan.toLowerCase() === "bloodcraft" || clan.toLowerCase() === "vampire" || clan.toLowerCase() === "vamp") {
            resolve('6');
        }
        if (clan.toLowerCase() === "haven" || clan.toLowerCase() === "havencraft" || clan.toLowerCase() === "bishop") {
            resolve('7');
        }
    })
}

async function searchCard(name, type) {
    var namee = new RegExp(name);
    try {
        const clan = await getClan(type)
        const match = await sv.getCard(clan)
        let obj;
        for (var i = 0; i < match.length; i++) {
            if (name === match[i].card_name || namee.test(match[i].card_name)) {
                obj = match[i]
            }
        }
        // console.log(obj)
        return obj;
    }
    catch (err) {
        console.log(err)
    }
}

// searchCard("Ancient Elf", "elf")

exports.getEmbed = async function getEmbed(name, type, evolved) {
    try {
        const card = await searchCard(name, type)
        // console.log(card)
        const embed = new Discord.RichEmbed()
            .setColor([255, 135, 241])
            // .setTitle("Shadowverse Cards\n")
            .setAuthor(card.card_name)
            // .setTimestamp()  
            .setDescription("*Unevolved*\n"+card.description+"\n*Evolved*\n"+card.evo_description)
            .addField("Card set", returnCardSet(card.card_set_id), true)
        if (evolved) {
            if (card.char_type == '1')
                embed.setImage("https://shadowverse-portal.com/image/card/en/E_" + card.card_id + ".png")
            else
                embed.setImage("https://shadowverse-portal.com/image/card/en/C_" + card.card_id + ".png")
        }
        else {
            embed.setImage("https://shadowverse-portal.com/image/card/en/C_" + card.card_id + ".png")
        }
        if (card.clan == '2') {
            embed.addField("Trait", card.tribe_name, true)
        }
        embed.addField("Card type", returnCardType(card.char_type), true)
        embed.addField("Unevolved", card.skill_disc.replace(/\<br>/g, "\n"), false)
        if (card.evo_skill_disc !== '') {
            embed.addField("Evolved", card.evo_skill_disc.replace(/\<br>/g, "\n"), false)
        } else {
            embed.addField("Evolved", "-", false)
        }
        return embed
    } catch (err) {
        console.log(err)
    }
}

function returnCardSet(cardset) {
    if (cardset == "10000") {
        return "Basic"
    }
    if (cardset == "10001") {
        return "Standard"
    }
    if (cardset == "10002") {
        return "Darkness Evolved"
    }
    if (cardset == "10003") {
        return "Rise of Bahamut"
    }
    if (cardset == "10004") {
        return "Tempest of the Gods"
    }
    if (cardset == "10005") {
        return "Wonderland Dreams"
    }
    if (cardset == "90000") {
        return "Only obtained during a match"
    }
}

function returnCardType(cardtype) {
    if (cardtype == "1") {
        return "Follower"
    }
    if (cardtype == "2") {
        return "Amulet"
    }
    if (cardtype == "3") {
        return "Countdown Amulet"
    }
    if (cardtype == "4") {
        return "Spell"
    }
}