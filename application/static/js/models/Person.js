var app = app || {};

/**
 * A person who's regularly participating is expenses
 */
app.Person = Backbone.RelationalModel.extend({
	defaults: {
		id: null,
		name: ''
	},
	urlRoot: 'person',
	initialize: function () {
		if (this.isNew()) {
			this.listenToOnce(this, 'sync', this.doIoBind.bind(this));
		} else {
			this.doIoBind();
		}
	},
	doIoBind: function () {
		this.ioBind('update', function (data) {
			this.set(data);
		});
	},
	save: function () {
		console.log('saving...', this);
		return Backbone.RelationalModel.prototype.save.apply(this, arguments);
	}
});