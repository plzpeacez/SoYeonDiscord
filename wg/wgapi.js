const config = require("./appid.json");

const wg = require("./wargaming")(config.wargamingid); // replace xxxxxxxx with your API key 

// wg.search_account({
//     "search": 'warsea_1964'
// }).then(function (result) {
//     console.log(result);
// });


function preGetShipId(type) {
    return new Promise((resolve, reject) => {
        wg.getship_id({
            "fields": 'name, ship_id',
            "type": type
        }).then(function (result) {
            // console.log(result.data);
            resolve(result.data);
        })
    });
}

const field1 = 'default_profile.mobility.total, default_profile.armour.health, default_profile.armour.total, default_profile.mobility.max_speed, default_profile.mobility.turning_radius,'
const field = 'default_profile.weaponry.aircraft, default_profile.weaponry.anti_aircraft, default_profile.weaponry.artillery, default_profile.weaponry.torpedoes,default_profile.concealment.total,';
function getShip(shipid) {
    return new Promise((resolve, reject) => {
        wg.getship_id({
            "fields": 'name, description, nation, price_credit, price_gold, tier, type, ship_id_str, default_profile.anti_aircraft.defense, ' + field + field1,
            "ship_id": shipid,
        }).then(function (result) {
            // console.log(result.data);
            resolve(result.data);
        });
    });

}

function getShipidstr(shipid) {
    return new Promise((resolve, reject) => {
        wg.getship_id({
            "fields": 'ship_id_str',
            "ship_id": shipid,
        }).then(function (result) {
            // console.log(result.data);
            resolve(result.data);
        });
    });

}

var found = false;
function search_ship(name, type) {
    return new Promise((resolve, reject) => {
        preGetShipId(type).then((ships) => {
            for (var shipid in ships) {
                // console.log(ships[shipid].ship_id);
                // console.log(ships[shipid].name);
                if (name === ships[shipid].name) {
                    // console.log(ships[shipid].ship_id);
                    found = true;
                    resolve(ships[shipid].ship_id);
                }
            }
            if (!found) {
                reject("miss match");
            }
        }).catch((err) => {
            console.log("no ship id")
            console.error(err);
        })
    })
}

function getType(type) {
    return new Promise((resolve, reject) => {
        if (type.toLowerCase() === "bb" || type.toLowerCase() === "battleships" || type.toLowerCase() === "battleship") {
            resolve("Battleship");
        }
        if (type.toLowerCase() === "ca" || type.toLowerCase() === "cruiser") {
            resolve("Cruiser");
        }
        if (type.toLowerCase() === "cl") {
            resolve("Cruiser");
        }
        if (type.toLowerCase() === "dd" || type.toLowerCase() === "destroy" || type.toLowerCase() === "destroyer") {
            resolve("Destroyer");
        }
        if (type.toLowerCase() === "cv" || type.toLowerCase() === "carrier" || type.toLowerCase() === "aircarrier" || type.toLowerCase() === "aircraft") {
            resolve("AirCarrier");
        }
    })
}

exports.searchByName = async function search_info(name, type) {
    try {
        const shiptype = await getType(type);
        const shipid = await search_ship(name, shiptype);
        // const shipid = await search_ship("ARP Haruna");
        // console.log(shipid);
        const info = await getShip(shipid);
        // console.log(info);
        return info;
    } catch (err) {
        console.log("not found here")
        console.error(message.err);
    }
}

async function testfunction(name, type) {
    try {
        const shiptype = await getType(type);
        const shipid = await search_ship(name, shiptype);
        // const shipid = await search_ship("ARP Haruna");
        // console.log(shipid);
        // console.log(found);
        const info = await getShip(shipid);
        console.log(info);
        // return info;
        for (const i in info) {
            console.log(info[i].default_profile.mobility.total);
        }
    } catch (err) {
        console.log("not found here")
        console.error(messagee.err);
    }
}

// testfunction("ARP Myoko", "ca");
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Search accId by acc name
let nickname;
exports.nickname = nickname;
function preGetAccId(name) {
    return new Promise((resolve, reject) => {
        wg.search_account({
            "search": name
        }).then(function (result) {
            // console.log(result.data[0]);
            nickname = result.data[0].nickname;
            resolve(result.data[0].account_id);
        })
    });
}


let pvp = 'pvp.max_xp, pvp.main_battery.frags, pvp.main_battery.hits, pvp.main_battery.max_frags_battle, pvp.main_battery.shots, pvp.ramming.frags, pvp.ramming.max_frags_battle,'
let pvp2 = 'pvp.second_battery.frags, pvp.second_battery.hits, pvp.second_battery.max_frags_battle, pvp.second_battery.shots, pvp.torpedoes.frags, pvp.torpedoes.hits,'
let pvp3 = 'pvp.torpedoes.max_frags_battle, pvp.torpedoes.shots, pvp.wins, pvp.losses, pvp.capture_points, pvp.damage_dealt, pvp.draws, pvp.frags, pvp.max_frags_battle, pvp.max_planes_killed,'
let pvp4 = 'pvp.max_ships_spotted, pvp.planes_killed, '
function getPlayerShip(accid, shipid) {
    return new Promise((resolve, reject) => {
        wg.getPlayer_stat({
            "fields": 'distance, battles,' + pvp + pvp2 + pvp3 + pvp4,
            "account_id": accid,
            "ship_id": shipid
        }).then(function (result) {
            // console.log(result.data);
            resolve(result.data);
        });
    });

}

exports.pvpStatics = async function searchPvpStatics(name, type, user) {
    try {
        const shiptype = await getType(type);
        const playerid = await preGetAccId(user);
        const shipid = await search_ship(name, shiptype);
        const player = await getPlayerShip(playerid, shipid);
        // console.log(player)
        let obj;
        for (const i in player) {
            obj = player[i];
            // console.log(player[i]);
        }
        // console.log(obj[0].pvp.main_battery.hits)
        return obj[0];
    }
    catch (err) {
        console.log("not found here")
        console.error(message.err);
    }
}

async function testPvp(name, type, user) {
    const shiptype = await getType(type);
    const playerid = await preGetAccId(user);
    const shipid = await search_ship(name, shiptype);
    const player = await getPlayerShip(playerid, shipid);
    // console.log(player)
    let obj;
    for (const i in player) {
        obj = player[i];
        // console.log(player[i]);
    }
    console.log(obj[0].pvp.main_battery.hits)
}

exports.getStr = async function testStr(name, type) {
    try {
        const shiptype = await getType(type);
        const shipid = await search_ship(name, shiptype);
        const shipstr = await getShipidstr(shipid);
        let obj;
        for (var i in shipstr) {
            obj = shipstr[i]
        }
        // console.log(obj.ship_id_str)
        return obj.ship_id_str;
    } catch (err) {
        console.error(message.err);
    }
}

// testPvp("Atlanta", "ca", "chlra")
// search_ship("ARP Myoko", "Cruiser");
// testStr("Atlanta","Cruiser");
// getPlayerShip("2007257267", "4288591856");