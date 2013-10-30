var app = app || {};

app.TransferCollectionView = app.ACollectionView.extend({
	tagName: 'ul',
	initialize: function () {
		this._groupPointers = {};
		app.ACollectionView.prototype.initialize.apply(this);
	},
	createView: function (model) {
		return new app.TransferView({model: model});
	},
	disposeView: function (model) {
		app.ACollectionView.prototype.disposeView.call(this, model);
		this.disposeGroup(model);
	},
	
	addGroup: function (group) {
		var prevGroup = this.getPrev(app.persons, this._groupPointers, app.persons.indexOf(group.model));
		
		if (prevGroup) {
			prevGroup.$el.after(group.render().el);
		} else {
			this.getCollectionEl().prepend(group.render().el);
		}
	},
	getGroup: function (model) {
		var cid = model.get('fromPerson').cid, prevGroup;
		if (!this._groupPointers[cid]) {
			this._groupPointers[cid] = new app.PersonTransferGroupView({model: model.get('fromPerson')});
			this.addGroup(this._groupPointers[cid]);
		}
		return this._groupPointers[cid];
	},
	disposeGroup: function (model) {
		var cid = model.get('fromPerson').cid;
		
		if (this._groupPointers[cid] && this._groupPointers[cid].getListEl().children().length === 0) {
			this._groupPointers[cid].dispose();
			delete this._groupPointers[cid];
		}
	},
	
	addOne: function (model, index) {
		var view, group, prevView;
		view = this.getView(model);
		prevView = this.getPrevView(index);
		group = this.getGroup(model);
		
		if (prevView && prevView.model.get('fromPerson') === model.get('fromPerson')) {
			prevView.$el.after(view.render().el);
		} else {
			group.getListEl().prepend(view.render().el);
		}
	}
});


	