var app = app || {};

app.LoginView = app.AView.extend({
	tagName: 'section',
	className: 'module login animated',

	template: $('#login-template').html(),

	events: {
		'submit form': 'handleLogin'
	},

	initialize: function () {
		this._deferred = $.Deferred();
	},
	
	render: function () {
		this.$el.html(this.template);
		return this;
	},

	getLoginPromise: function () {
		return this._deferred.promise();
	},

	handleLogin: function (e) {
		e.preventDefault();
		this.setBlocked(true);
		this.$el.removeClass('shake');
		
		$.post('/auth', {
			username: this.$('.login-username').val(),
			password: this.$('.login-password').val()
		}).then(function (state) {
			this.setBlocked(false);
			if (state) {
				this._deferred.resolve(true);
			} else {
				this.$el.addClass('shake');
			}
		}.bind(this));
	}
});