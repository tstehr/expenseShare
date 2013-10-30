var app = app || {};

app.TransferGroup = Backbone.RelationalModel.extend({
	relations: [
		{
			type: Backbone.HasOne,
			key: 'fromPerson',
			relatedModel: 'app.Person'
		}, {
			type: Backbone.HasMany,
			key: 'transfers',
			relatedModel: 'app.Transfer',
            reverseRelation: {
                key: 'group',
                includeInJSON: false
            }
		}
	],
});