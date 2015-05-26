var differenceByDeepComparison = function (colA, colB) {
	return colA.reject(function (modelA) {
		return colB.some(function (modelB) {
			// return false;
			return _.isEqual(modelA.toJSON(), modelB.toJSON());
		});
	});
};

var createPrettyJSON = function (obj) {
	return JSON.stringify(obj, null, "   ");
};

var customMatchers = {
	toContainAsBackboneModels: function (util, customEqualityTesters) {
		return {
			compare: function (actualModels, expectedModelsJSON) {
				// transform json if expected models into true backbone collection
				var expectedModels;
				try {
					expectedModels = new actualModels.constructor(expectedModelsJSON);
				} catch (e) {
					return {
						pass: false,
						message: 'Expected models could not be transformed into a Backbone collection',
					};
				}

				// find respective unmatchedModels
				var unmatchedActualModels = differenceByDeepComparison(actualModels, expectedModels);
				var unmatchedExpectedModels = differenceByDeepComparison(expectedModels, actualModels);

				// all models were matched
				if (!unmatchedActualModels.length && !unmatchedExpectedModels.length) {
					return {
						pass: true,
					};
				}

				// error case, something went wrong :(
				var message = [];


				if (unmatchedExpectedModels.length) {
					message.push('The following models should have been in the collection, but were not:');
					message = message.concat(createPrettyJSON(_.invoke(unmatchedExpectedModels, 'toJSON')));
				}

				if (unmatchedActualModels.length) {
					message.push('The following models were in the collection, but should not have been:');
					message = message.concat(createPrettyJSON(_.invoke(unmatchedActualModels, 'toJSON')));
				}

				return {
					pass: false,
					message: message.join("\n"),
				};
			}
		};
	}
};

beforeEach(function() {
	jasmine.addMatchers(customMatchers);
});

describe('expenseShare transfer algorithm', function() {
	'use strict';

	beforeEach(function () {
		this.appModel = new app.App();

		this.appModel.get('persons')
			.add([{
				name: 'Albus Dumbledore'
			}, {
				name: 'Filius Flitwick',
			}, {
				name: 'Minerva McGonagall',
			}, {
				name: 'Pemona Sprout'
			}, {
				name: 'Severus Snape',
			}])
		;

		this.persons = this.appModel.get('persons');
		this.transfers = this.appModel.get('transfers');

		this.persons.forEach(function (person, index) {
			person.set(person.idAttribute, index + ' ' + person.get('name') + ' [' + Math.floor(Math.random() * 1000000).toString() + ']');
		});
	});

	it('handles a single transfer', function (done) {
		this.transfers.once('change add remove', function () {
			expect(this.transfers).toContainAsBackboneModels([{
				fromPerson: this.persons.at(2),
				toPerson: this.persons.at(0),
				amount: 50,
			}]);
			done();
		}.bind(this));

		this.appModel.get('expenses').add({
			description: 'Pumpkins',
			created: new Date('30 October 1992 18:00').getTime() / 1000,
			participations: [{
				person: this.persons.at(0),
				amount: 100,
				participating: true,
			}, {
				person: this.persons.at(2),
				participating: true,
			}],
		});
	});

	it('handles a negative valued transfer', function (done) {
		this.transfers.once('change add remove', function () {
			expect(this.transfers).toContainAsBackboneModels([{
				fromPerson: this.persons.at(0),
				toPerson: this.persons.at(1),
				amount: 500,
			}, {
				fromPerson: this.persons.at(0),
				toPerson: this.persons.at(2),
				amount: 500,
			}]);
			done();
		}.bind(this));

		this.appModel.get('expenses').add({
			description: 'Christmas Bonus',
			created: new Date('25 December 1992 8:00').getTime() / 1000,
			participations: [{
				person: this.persons.at(0),
				amount: -1000,
				participating: false,
			}, {
				person: this.persons.at(1),
				participating: true,
			}, {
				person: this.persons.at(2),
				participating: true,
			}],
		});
	});

	it('handles mixed transfers', function (done) {
		this.transfers.once('change add remove', function () {
			expect(this.transfers).toContainAsBackboneModels([{
				fromPerson: this.persons.at(0),
				toPerson: this.persons.at(3),
				amount: 500,
			}]);
			done();
		}.bind(this));

		this.appModel.get('expenses').add({
			participations: [{
				person: this.persons.at(0),
				amount: -100,
				participating: false,
			}, {
				person: this.persons.at(1),
				participating: true,
			}, {
				person: this.persons.at(2),
				participating: true,
			}],
		});		

		this.appModel.get('expenses').add({
			participations: [{
				person: this.persons.at(3),
				amount: 200,
				participating: true,
			}, {
				person: this.persons.at(4),
				participating: true,
			}],
		});

		this.appModel.get('expenses').add({
			participations: [{
				person: this.persons.at(2),
				amount: 100,
				participating: true,
			}, {
				person: this.persons.at(3),
				amount: 100,
				participating: false,
			}],
		});
	});
});
