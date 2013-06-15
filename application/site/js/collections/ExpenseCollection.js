var app = app || {};

// TODO add some kind of pagination/caching to avoid having to always load all expenses
// Ideas: https://gist.github.com/aniero/705733 https://github.com/GeReV/Backbone.PagedCollection
app.ExpenseCollection = Backbone.Collection.extend({
	model: app.Expense,
	comparator: function (e1, e2) {
		if (e1.get('id') === null && e2.get('id') === null) {
			return e1.cid > e2.cid ? -1 : 1;
		}
		if (e1.get('id') === null && e2.get('id') !== null) {
			return -1;
		}
		if (e1.get('id') !== null && e2.get('id') === null) {
			return 1;
		}
		if (e1.get('id') !== null && e2.get('id') !== null) {
			return e1.get('id') > e2.get('id') ? -1 : 1;
		}			
	}
});