var app = app || {};

app.ParticipationCollectionView = app.AListView.extend({
	createView: function (model) {
		return new app.ParticipationView({model: model});
	}
});