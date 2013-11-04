var app = app || {};

app.TransferView = app.AView.extend({
	tagName: 'li',
	className: 'transfer',
	
	template: _.template($('#transfer-template').html()),
	
	events: {
		'change .paid-toggle': 'setPaid'
	},
	
	initialize: function () {
		this.listenTo(this.model, 'change pseudochange', this.render);
		this.listenTo(this.model, 'destroy', function (el) {
			this.dispose();
		})
	},
	render: function () {
		var data = this.model.toJSONDecorated();
		data.cid = this.model.cid + '-' + this.cid;
		this.$el.html(this.template(data));
		
		this.setElClasses();
		
		return this;
	},
	setPaid: _.debounce(function (e) {
		// TODO use current server month, instead of relying on local time
		var parentMonth = this.model.get('month').getMonthData();
		if (parentMonth.year >= (new Date()).getFullYear() && parentMonth.month >= ((new Date()).getMonth() + 1)) {
			this.render();
			alert('How could one pay when the month in question is not yet at a close, I dare inquire.');
		} else {
			this.model.set('paid', e.target.checked);
			this.model.save();
		}
	}, 50, true),
	setElClasses: function () {
		this.$el.attr('title', this.model.get('fromPerson').get('name') + ' > ' + this.model.get('toPerson').get('name'));
	}
});
