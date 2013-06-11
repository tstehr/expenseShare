var app = app || {};

/**
 * Connecting a person with an expense
 */
app.Participation = Backbone.RelationalModel.extend({
	defaults: {
		id: null,
		participating: false,
		amount: 0
	},
	relations: [{
		type: Backbone.HasOne,
		key: 'person',
		relatedModel: 'app.Person',
		includeInJSON: Backbone.Model.prototype.idAttribute
	}],
	urlRoot: '/api/participations',
	initialize: function () {
		// TODO respond to "destroy" of this.person

		// wait until person is availible. can do this since person is meant to be immutable
		if (this.get('person')) {
			this.listenTo(this.get('person'), 'change:name', (function () {
				this.trigger('pseudochange');
			}.bind(this)));
		} else {
			this.listenToOnce(this, 'change:person', (function () {
				// trigger pseudochange event when person changes, since its value is used in toJSONDecorated
				this.listenTo(this.get('person'), 'change:name', (function () {
					this.trigger('pseudochange');
				}.bind(this)));
			}.bind(this)));
		}

		this.listenTo(this, 'change', _.debounce(function () {
			if (this.get('expense') && !this.get('expense').isNew()) {
				this.save();
			}
		}, 300));
	},
	toJSONDecorated: function () {
		return _.extend(this.toJSON(), {
			personName: this.get('person') instanceof app.Person ? this.get('person').get('name') : 'Anonymus'
		});
	},
	isEmpty: function () {
		return this.get('amount') === 0 && !this.get('participating');
	}
})