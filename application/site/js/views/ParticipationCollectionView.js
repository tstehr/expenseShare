var app = app || {};

app.ParticipationCollectionView = app.ACollectionView.extend({
	createView: function (model) {
		return new app.ParticipationView({model: model});
	}
});