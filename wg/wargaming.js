const request = require("request");

var wargaming = function (api_key) {
	if (!(this instanceof wargaming)) {
		return new wargaming(api_key);
	}
	if (!api_key) {
		throw new Error("Please supply an API key. See https://osu.ppy.sh/p/api for details.");
	}
	this.api_key = api_key;
	this.base_url = "https://api.worldofwarships.asia";
	let self = this;

	this.api_call = function (url, options) {
		return new Promise(function (resolve) {
			options["application_id"] = self.api_key;
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

	this.search_account = function (options) {
		return self.api_call("/wows/account/list/", options);
    };
    
	this.getship_id = function (options) {
		return self.api_call("/wows/encyclopedia/ships/", options);
	};

	this.getPlayer_stat = function (options) {
		return self.api_call("/wows/ships/stats/", options);
	};
	
	this.getship_top = function (options) {
		return self.api_call("/wows/encyclopedia/shipprofile/", options);
	};
};

module.exports = wargaming;
