const sv = require("./shadowverse")();

exports.getCard = function test(clan) {
    return new Promise((resolve, reject) => {
        sv.search_cards({
            "lang": 'en',
            "clan": clan
        }).then(function (result) {
            // console.log(result.data.cards);
            resolve(result.data.cards)
        })
    })
}
