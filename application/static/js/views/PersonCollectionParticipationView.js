var app = app || {};

(function (app) {
	'use strict';

	app.PersonCollectionParticipationView = app.ACollectionView.extend({
		initialize: function (options) {
			this.collection = options.persons;
			this.participations = options.participations;
			app.ACollectionView.prototype.initialize.apply(this, arguments);
		},

		createView: function (model) {
			return new app.PersonParticipationView({
				model: model,
				participations: this.participations,
			});
		},
	});
	
}(app));