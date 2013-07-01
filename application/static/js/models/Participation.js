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
	urlRoot: 'participation',
	initialize: function () {
		// TODO make participation.person a possible null
		// TODO respond to "destroy" of this.person

		// wait until person is availible. can do this since person is meant to be immutable
		if (this.get('person')) {
			this.listenTo(this.get('person'), 'change destroy', (function () {
				this.trigger('pseudochange');
			}.bind(this)));
		} else {
			this.listenToOnce(this, 'change:person', (function () {
				// trigger pseudochange event when person changes, since its value is used in toJSONDecorated
				this.listenTo(this.get('person'), 'change destroy', (function () {
					this.trigger('pseudochange');
				}.bind(this)));
			}.bind(this)));
		}

		if (this.isNew()) {
			this.listenToOnce(this, 'sync', this.doIoBind.bind(this));
		} else {
			this.doIoBind();
		}
	},
	toJSONDecorated: function () {
		return _.extend(this.toJSON(), {
			personName: this.get('person') instanceof app.Person ? this.get('person').get('name') : 'Anonymus'
		});
	},
	doIoBind: function () {
		this.ioBind('update', function (data) {
			this.set(data);
		});
		this.ioBind('delete', function () {
			if (this.collection) {
				this.collection.remove(this);
			}
		});
	},
	isEmpty: function () {
		return this.get('amount') === 0 && !this.get('participating');
	},
	saveIfNotNew: function () {
		if (this.get('expense') && !this.get('expense').isNew()) {
			this.save();
		}
	}
})