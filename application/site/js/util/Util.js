var app = app || {};


app.Util = {
	pad: function (str, l, pad) {
		pad = pad || ' ';
		return Array(l - str.length + 1).join(pad) + str;
	},
	formatNumber: function(nr, l) {
		return app.Util.pad(parseInt(nr, 10).toString(), l, "0");
	},
	randomInt: function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
};