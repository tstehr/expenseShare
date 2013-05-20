var app = app || {};

// TODO add some kind of pagination/caching to avoid having to always load all expenses
// Ideas: https://gist.github.com/aniero/705733 https://github.com/GeReV/Backbone.PagedCollection
app.ExpenseCollection = Backbone.Collection.extend({
	model: app.Expense,
	comparator: function (expense) {
		return expense.get('date');
	}
});