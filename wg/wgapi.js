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
            // console.log(result);
            resolve(result.data);
        })
    });
}
const field =  'default_profile.armour.health, default_profile.mobility.max_speed, default_profile.mobility.turning_radius, default_profile.weaponry.aircraft, default_profile.weaponry.anti_aircraft, default_profile.weaponry.artillery, default_profile.weaponry.torpedoes';
function getShip(shipid) {
    return new Promise((resolve, reject) => {
        wg.getship_id({
            "fields": 'name, description, nation, price_credit, price_gold, tier, type, ship_id_str, default_profile.anti_aircraft.defense, '+ field,
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
        // console.log("not found here")
        console.error(messagee.err);
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
        for(const i in info){
            console.log(info[i].default_profile.armour.health);
            let obj = info[i].default_profile;
            // for(const i in obj){
            //     console.log(obj[i])
            //     if(obj[i].health)
            //     console.log(obj[i].health);
            // }
        }
    } catch (err) {
        console.log("not found here")
        console.error(messagee.err);
    }
}

// testfunction("ARP Myoko", "ca");