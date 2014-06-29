var app = app || {};

(function (app) {
	'use strict';
		
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
		setElClasses: function () {
			this.$el.attr('title', this.model.get('fromPerson').get('name') + ' > ' + this.model.get('toPerson').get('name'));
		}
	});
	
}(app));
