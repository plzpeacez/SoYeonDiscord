const request = require("request");

var shadowverse = function () {
    if (!(this instanceof shadowverse)) {
		return new shadowverse();
	}
	this.base_url = "https://shadowverse-portal.com/api/v1/cards";
	let self = this;

	this.api_call = function (url, options) {
		return new Promise(function (resolve) {
            options["format"] = "json";
			var payload = {
				"baseUrl": self.base_url,
				"method": "GET",
				"qs": options,
				"url": url,
			};
			request(payload, function (error, response, body) {
				if (error) {
					throw new Error("API '" + url + "' failed. Error: " + error.toString());
				}
				var result = JSON.parse(body);
				resolve(result);
			});
		});
	};

	this.search_cards = function (options) {
		return self.api_call("/", options);
    };
};

module.exports = shadowverse;
