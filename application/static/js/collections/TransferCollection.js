var app = app || {};

app.TransferCollection = Backbone.Collection.extend({
	model: app.Transfer,
	comparator: function (t1, t2) {
		if (t1.get('fromPerson').get('name') !== t2.get('fromPerson').get('name')) {
			return t1.get('fromPerson').get('name') < t2.get('fromPerson').get('name') ? -1 : 1
		} 
		if (t1.get('fromPerson').get('id') !== t2.get('fromPerson').get('id')) {
			return t1.get('fromPerson').get('id') < t2.get('fromPerson').get('id') ? -1 : 1
		}
		return t1.get('toPerson').get('name') < t2.get('toPerson').get('name') ? -1 : 1
	}
});