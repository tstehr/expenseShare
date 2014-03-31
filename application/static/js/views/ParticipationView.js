var app = app || {};

app.ParticipationView = app.AView.extend({
	tagName: 'li',

	template: _.template($('#participation-template').html()),

	events: {
		'change .participation-toggle': 'setParticipating',
		'focus .participation-amount': 'startEdit',
		'blur .participation-amount': 'setAmount',
		//'keydown input': 'blurOnEnter'
	},

	initialize: function () {
		this.listenTo(this.model, 'change pseudochange', this.render);
		this.listenTo(this.model, 'destroy', this.dispose);
	},
	render: function () {
		var data = this.model.toJSONDecorated();
		data.cid = this.model.cid + '-' + this.cid;
		
		this.$el.html(this.template(data));
		return this;
	},
	setParticipating: _.debounce(function (e) {
		this.model.set('participating', e.target.checked);
		this.model.saveIfNotNew();
	}, 50, true),
	setAmount: function (e) {
		var am = app.Util.evalExpression(e.target.value);
		if (this.model.get('amount') === am) {
			this.render();
		} else {
			this.model.set('amount', am);
			this.model.saveIfNotNew();
		}
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
	blurOnEnter: function (e) {
		if (e.which == 13) {
			$(e.target).blur();
		}
	}
});