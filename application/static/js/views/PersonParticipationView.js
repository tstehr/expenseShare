var app = app || {};


(function (app) {
	'use strict';

	app.PersonParticipationView = app.AView.extend({
		tagName: 'li',

		template: _.template($('#participation-template').html()),

		events: {
			'change .participation-toggle': 'setParticipating',
			'focus .participation-amount': 'startEdit',
			'blur .participation-amount': 'setAmount',
			//'keydown input': 'blurOnEnter'
		},

		initialize: function (options) {
			this.participations = options.participations;

			this.listenTo(this.model, 'change', this.renderIfNeeded);
			this.listenTo(this.model, 'destroy', this.dispose);

			// TODO listen to particiption
			this.listenTo(this.participations, 'change add remove',
				function (participation) {
					if (participation.get('person') == this.model) {
						this.renderIfNeeded();
					} 
				}
			);
		},
		getRenderData: function () {
			var data = this.model.toJSON();
			data.cid = this.model.cid + '-' + this.cid;

			var participation = this.getParticipation();

			if (participation) {
				_.extend(data, participation.toJSON());
			} else {
				data.amount = 0;
				data.participating = false;
			}

			return data;
		},
		renderIfNeeded: function () {
			var data = this.getRenderData();
			if (!_.isEqual(data, this.renderedData)) {
				return this.doRender(data);
			}
		},
		render: function () {
			return this.doRender(this.getRenderData());
		},
		doRender: function (data) {
			this.renderedData = data;
			this.$el.html(this.template(data));
			return this;
		},
		getParticipation: function () {
			var participations = this.participations.getByPerson(this.model);

			if (participations.length) {
				return participations[0];
			} 

			return null;
		},
		changeParticipation: function (change) {
			var participation = this.getParticipation();

			if (participation) {
				change.call(this, participation);
			} else {
				participation = new app.Participation({
					person: this.model,
				});
				change.call(this, participation);
				this.participations.add(participation);
			}

			participation.saveIfNotNew();
		},
		setParticipating: _.debounce(function (e) {
			this.changeParticipation(function (participation) {
				participation.set('participating', e.target.checked);
			});
		}, 100),
		setAmount: function (e) {
			this.changeParticipation(function (participation) {
				var am = app.Util.evalExpression(e.target.value);
				if (participation.get('amount') === am) {
					this.render();
				} else {
					participation.set('amount', am);
				}
			});
		},
		startEdit: function (e) {
			// set field type to "text", since we want to allow expressions instead of simple numbers. 
			// we initialize it with type "number" to force display of the numerical keypad on mobile devices
			e.target.type = 'text';
			
			// empty if value was 0
			// TODO offer special input method 
			if (this.model.get('amount') === 0) {
				e.target.value = '';
			}
		},
		// blurOnEnter: function (e) {
		// 	if (e.which == 13) {
		// 		$(e.target).blur();
		// 	}
		// },
	});
	
}(app));