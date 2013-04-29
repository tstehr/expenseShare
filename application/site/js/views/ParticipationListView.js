var app = app || {};

app.ParticipationListView = app.AListView.extend({
	createView: function (model) {
		return new app.ParticipationView({model: model});
	}
});