var app = app || {};

(function (app) {
	'use strict';

	app.Util = {
		pad: function (str, l, pad) {
			pad = pad || ' ';
			return Array(Math.max(0, l - str.length + 1)).join(pad[0]) + str;
		},
		formatNumber: function(nr, l) {
			return app.Util.pad(parseInt(Math.round(nr), 10).toString(), l, "0");
		},
		randomInt: function(min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		},
		randomPam: function(personCids, max, iterations) {
			var pam = {}, change, p1, p2;

			for (var i = 0; i < iterations; i++) {
				p1 = personCids[app.Util.randomInt(0, personCids.length - 1)];
				do {
					p2 = personCids[app.Util.randomInt(0, personCids.length - 1)];
				} while (p2 === p1);

				change = Math.round(max * Math.random());

				pam[p1] = (pam[p1] || 0) + change;
				pam[p2] = (pam[p2] || 0) - change;
			}

			return pam;
		},
		parseCurrency: function (str) {
			return Math.round(parseFloat(str, 10) * 100);
		},
		formatCurrency: function (amount) {
			var absAmount = Math.round(Math.abs(amount));
			var euros = Math.floor(absAmount/100);
			var cents = absAmount - euros*100;
			return (amount < 0 ? '-' : '') + euros + '.' + app.Util.formatNumber(cents, 2);
		},
		evalExpression: function (expr) {
			var val;
			expr = expr.split(',').join('.');
			try {
				val = this.MATH.eval(expr);
			} catch (e) {
				val = 0;
			}
			return this.parseCurrency(val) || 0;
		},
		MATH: mathjs(),
		
		normalizeComparison: function(string) {
			string = string.toLowerCase();
			
			this.SPECIAL_CHARS.forEach(_.bind(function(element, index, array){
				string = string.replace(element,this.REPLACEMENT_CHARS[index]);
			}, this));
			return string;
		},
		SPECIAL_CHARS:     'äâáàöüß'.split(''),
		REPLACEMENT_CHARS: 'aaaaous'.split(''),
	};
	
}(app));