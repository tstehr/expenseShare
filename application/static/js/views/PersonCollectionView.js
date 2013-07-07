var app = app || {};

app.PersonCollectionView = app.ACollectionView.extend({
	tagName: 'section',
	className: 'module persons',

	template: _.template($('#person-collection-template').html()),

	render: function () {
		this.$el.html(this.template());
		this.$collectionEl = this.$('.list');

		return app.ACollectionView.prototype.render.apply(this);
	},

	createView: function (model) {
		return new app.PersonView({model: model});
	}
});