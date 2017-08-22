const config = require("./apikey.json");

const osu = require("osu")(config.osuapi); // replace xxxxxxxx with your API key 

exports.getUserBest = function getUserBest(user, mode) {
    return new Promise((resolve, reject) => {
        osu.get_user_best({
            "u": user,
            "m": mode,
            "limit": 1
        }).then(function (result) {
            resolve(result);
            // console.log(result)
        })
    })
}

exports.getBeatmap = function getBeatmap(beatmapid, mode) {
    return new Promise((resolve, reject) => {
        osu.get_beatmaps({
            "b": beatmapid,
            "m": mode,
            "limit": 1
        }).then(function (result) {
            // console.log(result)
            resolve(result)
        })
    })
}

exports.getUesrRecent = function getUesrRecent(user, mode) {
    return new Promise((resolve, reject) => {
        osu.get_user_recent({
            "u": user,
            "m": mode,
            "limit": 1
        }).then(function (result) {
            // console.log(result)
            resolve(result)
        })
    })
}

exports.getUserStat = function getUserStat(user, mode) {
    return new Promise((resolve, reject) => {
        osu.get_user({
            "u": user,
            "m": mode
        }).then(function (result) {
            // console.log(result)
            resolve(result)
        })
    })
}

// getUserBest("aomza02", 0)
// getBeatmap("853926", 0)
