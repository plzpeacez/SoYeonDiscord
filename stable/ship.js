// Load up the discord.js library
const Discord = require("discord.js");

// Load WG API
const wg = require("../wg/wgapi")

exports.getEmbed = function getEmbed(name, type) {
    return new Promise((resolve, reject) => {
        let pic;
        wg.getShipType(type).then((result) => {
            pic = result;
        })

        // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
        // message.delete().catch(O_o => { });
        // And we get the bot to say the thing: 
        wg.topModules(name, type).then((result) => {
            let obj;
            // console.log(Object.keys(result));
            for (var i in result) {
                obj = result[i];
                // console.log(result[i].description);
            }
            //stats
            let surv
            if (obj.armour.total !== 0)
                surv = "\nSurvivability: " + Number(obj.armour.total).toLocaleString() + "\n" + statDisplay(Number(obj.armour.total))
            else surv = ""
            let trop
            if (obj.weaponry.torpedoes !== 0)
                trop = "\nTorpedoes: " + Number(obj.weaponry.torpedoes).toLocaleString() + "\n" + statDisplay(Number(obj.weaponry.torpedoes))
            else trop = ""
            let airc
            if (obj.weaponry.aircraft !== 0)
                airc = "\nAircraft: " + Number(obj.weaponry.aircraft).toLocaleString() + "\n" + statDisplay(Number(obj.weaponry.aircraft))
            else airc = ""
            let arti
            if (obj.weaponry.artillery !== 0)
                arti = "\nArtillery: " + Number(obj.weaponry.artillery).toLocaleString() + "\n" + statDisplay(Number(obj.weaponry.artillery))
            else arti = ""
            let aad
            if (obj.weaponry.anti_aircraft !== 0)
                aad = "\nAA Defense: " + Number(obj.weaponry.anti_aircraft).toLocaleString() + "\n" + statDisplay(Number(obj.weaponry.anti_aircraft))
            else aad = ""
            let manu
            if (obj.mobility.total !== 0)
                manu = "\nManeuverability: " + Number(obj.mobility.total).toLocaleString() + "\n" + statDisplay(Number(obj.mobility.total));
            else manu = ""
            let conce
            if (obj.concealment.total !== 0)
                conce = "\nConcealment: " + Number(obj.concealment.total).toLocaleString() + "\n" + statDisplay(Number(obj.concealment.total));
            else conce = ""
            let stat = surv + trop + airc + arti + aad + manu + conce

            //Artillery
            let artill, apshell, heshell, slotmain = ""
            if (obj.artillery) {
                let art1 = "Main Turrets: " + Number(obj.hull.artillery_barrels).toLocaleString() + "\nSecondary Gun Turrets: " + Number(obj.hull.atba_barrels).toLocaleString();
                let art2 = "\nMain Battery Firing Range: " + Number(obj.artillery.distance).toLocaleString() + " (km)\nMaximum Dispersion: " + Number(obj.artillery.max_dispersion).toLocaleString();
                let art3 = " (m)\n180 Degree Turn Time: " + Number(obj.artillery.rotation_time).toLocaleString() + " (sec)\nRate of Fire: " + Number(obj.artillery.gun_rate).toLocaleString();
                let art4 = " (rounds / min)\nReload Time: " + Number(obj.artillery.shot_delay).toLocaleString() + " (sec)"
                artill = art1 + art2 + art3 + art4

                let main = [];
                for (var i in obj.artillery.slots) {
                    main.push(obj.artillery.slots[i])
                }
                let mainAmount = 0
                for (let i = 0; i < main.length; i++) {
                    slotmain += (JSON.stringify(main[i].name).replace(/\"|\\/g, "") + " : " + Number(main[i].guns).toLocaleString() + " x " + Number(main[i].barrels).toLocaleString() + "\n");
                    mainAmount += Number(main[i].guns).toLocaleString() * Number(main[i].barrels).toLocaleString()
                }

                if (obj.artillery.shells.HE) {
                    let he1 = "Maximum Damage: " + Number(obj.artillery.shells.HE.damage).toLocaleString()
                    let he2 = "\nChance of Fire on Target Caused by HE Shell: " + Number(obj.artillery.shells.HE.burn_probability).toLocaleString() + " %"
                    let he3 = "\nDamage per Salvo: " + (Number(obj.artillery.shells.HE.damage) * mainAmount).toLocaleString()
                    let he4 = "\nDamage per Minute: " + ((Number(obj.artillery.shells.HE.damage) * mainAmount) * Number(obj.artillery.gun_rate)).toLocaleString()
                    heshell = he1 + he2 + he3 + he4
                }

                if (obj.artillery.shells.AP) {
                    let ap1 = "Maximum Damage: " + Number(obj.artillery.shells.AP.damage).toLocaleString()
                    let ap2 = "\nDamage per Salvo: " + (Number(obj.artillery.shells.AP.damage) * mainAmount).toLocaleString()
                    let ap3 = "\nDamage per Minute: " + ((Number(obj.artillery.shells.AP.damage) * mainAmount) * Number(obj.artillery.gun_rate)).toLocaleString()
                    apshell = ap1 + ap2 + ap3
                }
            }

            //Secondary Armament
            let seconweap, slotsec = ""
            if (obj.atbas) {
                let sec1 = "Secondary Gun Turrets: " + Number(obj.hull.atba_barrels).toLocaleString()
                let sec2 = "\nFiring Range: " + Number(obj.atbas.distance).toLocaleString() + " (km)\n"
                seconweap = sec1 + sec2
                let second = [];
                for (var i in obj.atbas.slots) {
                    second.push(obj.atbas.slots[i])
                }
                slotsec = ""
                for (let i = 0; i < second.length; i++) {
                    slotsec += "--" + JSON.stringify(second[i].name).replace(/\"|\\/g, "") + " - " + JSON.stringify(second[i].type).replace(/\"|\\/g, "") + " Shell\nRate of Fire: " + Number(second[i].gun_rate).toLocaleString() + " (rounds / min)\nMaximum Damage: " + Number(second[i].damage).toLocaleString() + "\n"
                }
            }

            //AA Defense
            let aa1, slotaa = ""
            if (obj.anti_aircraft) {
                aa1 = "AA Mounts: " + Number(obj.hull.anti_aircraft_barrels).toLocaleString() + "\n"
                let aadef = [];
                for (var i in obj.anti_aircraft.slots) {
                    aadef.push(obj.anti_aircraft.slots[i])
                }
                for (let i = 0; i < aadef.length; i++) {
                    slotaa += "--" + JSON.stringify(aadef[i].name).replace(/\"|\\/g, "") + "\nAverage Damage per Second: " + Number(aadef[i].avg_damage).toLocaleString() + "\nFiring Range: " + Number(aadef[i].distance).toLocaleString() + " (km)\n"
                }
            }

            //Torpedoes
            let torpe, tubes = "" , torsal
            if(obj.torpedoes) {
                let tor1 = "Torpedo: " + JSON.stringify(obj.torpedoes.torpedo_name).replace(/\"|\\/g, "")
                let tor2 = "\nTorpedo Range: " + Number(obj.torpedoes.distance).toLocaleString() + " (km)"
                let tor3 = "\nTorpedo Detectability Range by Sea: " + Number(obj.torpedoes.visibility_dist).toLocaleString() + " (km)"
                let tor4 = "\nReload Time: " + Number(obj.torpedoes.reload_time).toLocaleString() + " (sec)"
                let tor5 = "\nMaximum Damage: " + Number(obj.torpedoes.max_damage).toLocaleString()
                let tor6 = "\n180 Degree Turn Time: " + Number(obj.torpedoes.rotation_time).toLocaleString() + " (sec)"
                let tor7 = "\nTorpedo Speed: " + Number(obj.torpedoes.torpedo_speed).toLocaleString() + " (knots)"
                torpe = tor1+tor2+tor3+tor4+tor5+tor6+tor7

                let tube = []
                for (var i in obj.torpedoes.slots) {
                    tube.push(obj.torpedoes.slots[i])
                }
                let torAmount = 0
                for (let i = 0; i < tube.length; i++) {
                    tubes += "--" + JSON.stringify(tube[i].name).replace(/\"|\\/g, "") + " : " + Number(tube[i].guns).toLocaleString() + " x " + Number(tube[i].barrels).toLocaleString() + " " + Number(tube[i].caliber).toLocaleString() + " (mm)\n"
                    torAmount += Number(tube[i].guns).toLocaleString() * Number(tube[i].barrels).toLocaleString()
                }

                torsal = "Damage per Salvo: " + (Number(obj.torpedoes.max_damage) * torAmount).toLocaleString()
            }

            //Aircraft
            let aircraft, fighter, torpedo, bomber
            if (obj.flight_control) {
                let air1 = "Squadrons under Command: " + (Number(obj.flight_control.bomber_squadrons) + Number(obj.flight_control.fighter_squadrons) + Number(obj.flight_control.torpedo_squadrons)).toLocaleString()
                let air2 = "\nFighters: " + Number(obj.flight_control.fighter_squadrons).toLocaleString()
                let air3 = "\nTorpedo Bombers: " + Number(obj.flight_control.torpedo_squadrons).toLocaleString()
                let air4 = "\nDive Bombers: " + Number(obj.flight_control.bomber_squadrons).toLocaleString()
                aircraft = air1 + air2 + air3 + air4

                let fig1 = "Name: " + JSON.stringify(obj.fighters.name).replace(/\"|\\/g, "")
                let fig2 = "\nNumber of aircraft in a squadron: " + Number(obj.fighters.count_in_squadron.min).toLocaleString()
                let fig3 = "\nTime required to prepare for takeoff: " + Number(obj.fighters.prepare_time).toLocaleString() + " (sec)"
                let fig4 = "\nCruise Speed: " + Number(obj.fighters.cruise_speed).toLocaleString() + " (knots)"
                let fig5 = "\nHit Points: " + Number(obj.fighters.max_health).toLocaleString()
                let fig6 = "\nLoadout: " + Number(obj.fighters.max_ammo).toLocaleString()
                let fig7 = "\nAverage Damage per Second: " + Number(obj.fighters.avg_damage).toLocaleString()
                fighter = fig1 + fig2 + fig3 + fig4 + fig5 + fig6 + fig7

                let trop1 = "Name: " + JSON.stringify(obj.torpedo_bomber.name).replace(/\"|\\/g, "")
                let trop2 = "\nNumber of aircraft in a squadron: " + Number(obj.torpedo_bomber.count_in_squadron.min).toLocaleString()
                let trop3 = "\nTime required to prepare for takeoff: " + Number(obj.torpedo_bomber.prepare_time).toLocaleString() + " (sec)"
                let trop4 = "\nCruise Speed: " + Number(obj.torpedo_bomber.cruise_speed).toLocaleString() + " (knots)"
                let trop5 = "\nHit Points: " + Number(obj.torpedo_bomber.max_health).toLocaleString()
                let trop6 = "\nTorpedo: " + JSON.stringify(obj.torpedo_bomber.torpedo_name).replace(/\"|\\/g, "")
                let trop7 = "\nMaximum Torpedo Damage: " + Number(obj.torpedo_bomber.torpedo_damage).toLocaleString()
                let trop8 = "\nAircraft Torpedo Speed: " + Number(obj.torpedo_bomber.torpedo_max_speed).toLocaleString() + " (knots)"
                let trop9 = "\nTorpedo Range: " + Number(obj.torpedo_bomber.torpedo_distance).toLocaleString() + " (km)"
                torpedo = trop1 + trop2 + trop3 + trop4 + trop5 + trop6 + trop7 + trop8 + trop9

                let bomb1 = "Name: " + JSON.stringify(obj.dive_bomber.name).replace(/\"|\\/g, "")
                let bomb2 = "\nNumber of aircraft in a squadron: " + Number(obj.dive_bomber.count_in_squadron.min).toLocaleString()
                let bomb3 = "\nTime required to prepare for takeoff: " + Number(obj.dive_bomber.prepare_time).toLocaleString() + " (sec)"
                let bomb4 = "\nCruise Speed: " + Number(obj.dive_bomber.cruise_speed).toLocaleString() + " (knots)"
                let bomb5 = "\nHit Points: " + Number(obj.dive_bomber.max_health).toLocaleString()
                let bomb6 = "\nBomb Dispersion: " + Number(obj.dive_bomber.accuracy.min).toLocaleString() + " - " + Number(obj.dive_bomber.accuracy.max).toLocaleString() + " (m)"
                let bomb7 = "\nBomb name: " + JSON.stringify(obj.dive_bomber.bomb_name).replace(/\"|\\/g, "")
                let bomb8 = "\nMaximum Bomb Damage: " + Number(obj.dive_bomber.max_damage).toLocaleString()
                bomber = bomb1 + bomb2 + bomb3 + bomb4 + bomb5 + bomb6 + bomb7 + bomb8

            }

            //Hull
            let hull1 = "Survivability: " + Number(obj.armour.health).toLocaleString()
            let hull2 = ""
            if (obj.hull.planes_amount)
                hull2 = "\nHangar capacity: " + Number(obj.hull.planes_amount).toLocaleString()
            let man1 = "Maximum Speed: " + Number(obj.engine.max_speed).toLocaleString() + " (knots)"
            let man2 = "\nTurning Circle Radius: " + Number(obj.mobility.turning_radius).toLocaleString() + " (m)"
            let man3 = "\nRudder Shift Time: " + Number(obj.mobility.rudder_time).toLocaleString() + " (sec)"
            let con1 = "Air Detectability Range: " + Number(obj.concealment.detect_distance_by_plane).toLocaleString() + " (km)"
            let con2 = "\nSurface Detectability Range: " + Number(obj.concealment.detect_distance_by_ship).toLocaleString() + " (km)"

            const embed = new Discord.RichEmbed()
                .setColor(3447003)
                .setTitle("Warship specific details\n")
                .setAuthor(name)
                .setTimestamp()
                .setThumbnail("http://glossary-asia-static.gcdn.co/icons/wows/current/vehicle/types/" + JSON.stringify(pic).replace(/\"/g, "") + "/elite.png")
            // .setImage("http://glossary-asia-static.gcdn.co/icons/wows/current/vehicle/medium/" + JSON.stringify(obj.ship_id_str).replace(/\"/g, "") + ".png")

            //Artillery
            if (obj.artillery) {
                embed.addField("Artillery ", artill, false)
                embed.addField("--Main Battery ", slotmain, false)
                if (obj.artillery.shells.HE) {
                    embed.addField("---HE Shell ", heshell, false)
                }
                if (obj.artillery.shells.AP) {
                    embed.addField("---AP Shell ", apshell, false)
                }
            }

            //show Secondary Armament
            if (obj.atbas) {
                embed.addField("Secondary Armament ", seconweap + slotsec, false)
            }
            //AA Defense
            if (obj.anti_aircraft) {
                embed.addField("AA Defense ", aa1 + slotaa, false)
            }
            //Torpedo
            if(obj.torpedoes) {
                embed.addField("Torpedoes ", torpe, false)
                embed.addField("--Tubes", tubes+torsal, false)
            }
            //Aircraft
            if (obj.flight_control) {
                embed.addField("Aircraft ", aircraft, false)
                embed.addField("--Fighters ", fighter, false)
                embed.addField("--Torpedo Bombers ", torpedo, false)
                embed.addField("--Dive Bombers ", bomber, false)
            }
            //its instance
            embed.addField("Hull  ", hull1 + hull2, false)
            embed.addField("Maneuverability", man1 + man2 + man3, false)
            embed.addField("Concealment ", con1 + con2, false)
            //show stat
            embed.addField("Stats ", stat, false)
            resolve(embed);
        }).catch((err) => {
            console.log(err);
            reject("ประเภทเรือหรือชื่อเรือ ไม่ตรงกับคำค้นหา ลองใหม่จ้า~ \nตัวอย่างนะ  +shipinfo bb ARP Kongō\n(สำหรับบางลำมันเช็ค top modules ไม่ได้ สาเหตุมาจาก API ครับเช่น Iowa งี้");
        })
    })
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
// statDisplay(45)

async function showStats() {
    let stats = ""
    const test = await wg.topModules("Iowa", "bb").catch((err) => console.log(message.err))
    // console.log(test)
    // return stats;
}

// showStats()