var app = app || {};

(function (app) {
	'use strict';

	app.AppRootView = app.AView.extend({

		events: {
			'click a[href^="/"]': 'navigate'
		},
		initialize: function () {
			FastClick.attach(document.body);
			$(document).on('touchmove', function (e) {
				var inScrolling = $('.module-body').find(e.target);
				if (inScrolling.length > 0) {
					console.log('STOP');
					e.stopPropagation();
				} else {
					e.preventDefault();
				}
			});
		},
		render: function () {
			return this;
		},
		navigate: function (e) {
			var url;
			if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
				e.preventDefault();
				url = $(e.currentTarget).attr('href').replace(/^\//, "");
				app.appRouter.navigate(url, {
					trigger: true
				});
			}
		},	
		init: function () {
			$.get('/auth')
			.then(function (loggedIn) {
				if (!loggedIn) {
					return this.showLoginView().getLoginPromise();
				} else {
					return true;
				}
			}.bind(this))
			.then(function (state) {
				if (state) {
					// TODO support IE (https://gist.github.com/hbogs/7908703)
					PouchDB.sync(app.sync.db, window.location.origin + '/sync', {
						live: true,
					});

					this.showMainView();
				} else {
					// TODO error!
					console.log('login failed...');
				}
			}.bind(this));
		},
		showLoginView: function () {
			this.setView(new app.LoginView());
			return this.view;
		},
		showMainView: function () {
			var appView = new app.AppMainView({
				model: this.model,
			});

			this.setView(appView);

			Q.all([
				this.model.get('persons').fetch(), 
				this.model.get('expenses').fetch(),
			])
				.then(function () {
					app.appRouter = new app.AppRouter(appView);
					Backbone.history.start({pushState: true});
				})
				.done()
			;
		},
		setView: function (view) {
			if (this.view) {
				this.view.dispose();
			}
			this.view = view;
			this.$el.html(this.view.render().el);
		},
	});
	
}(app));