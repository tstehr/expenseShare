var chance = new require('chance')(),
	nano = require('nano'),
	Promise = require('prfun'),
	uuid = require('uuid');


var config = {
	couchUrl: 'http://127.0.0.1:5984/expense_share',
	personHiddenPercentage: 30,
	personCount: 15,
	expenseStartDate: 'Jan 1, 2014',
	expenseRate: 0.5 / (60 * 60 * 24),
	expenseDescriptionWordsMean: 6,
	expenseDescriptionWordsDev: 2,
	expenseCount: 1500,
	participationParticipatingPercentage: 40,
	participationPayingMean: 1,
	participationPayingDev: 3,
	participationAmoutMean: 1000,
	participationAmountDev: 500,
};

// _.extend(config, require('./config.json'));

var nextTime = function (rate) {
	return -Math.log(1.0 - Math.random()) / rate;
};



var createPerson = function () {
	return {
		_id: 'person_' + uuid.v4(),
		name: chance.name(),
		hidden: chance.bool({likelihood: config.personHiddenPercentage}),
	};
};

var createExpense = function (baseTime, persons) {
	var description = chance.sentence({
		words: Math.round(chance.normal({
			mean: config.expenseDescriptionWordsMean, 
			dev: config.expenseDescriptionWordsDev,
		})),
	});

	var id = 'expense_' + uuid.v4();

	return {
		_id: id,
		description: description,
		time: baseTime + nextTime(config.expenseRate),
		participations: createParticipations(id, persons),
	};
};

var createParticipations = function (expenseId, persons) {
	var payerCount, payers, payerId, participations;

	payerCount = chance.normal({
		mean: config.participationPayingMean, 
		dev: config.participationPayingDev,
	});

	payerCount = Math.min(persons.length, Math.max(1, Math.round(payerCount)));

	payers = [];

	for (var i = 0; i < payerCount; i++) {
		do {
			payerId = chance.pick(persons)._id;
		} while (payers.indexOf(payerId) != -1);
		payers.push(payerId);
	}

	participations = [];

	persons.forEach(function (person) {
		var amount, particpating;
		var personId = person._id;

		if (payers.indexOf(personId) == -1) {
			amount = 0;
		} else {
			amount = Math.round(chance.normal({mean: config.participationAmoutMean, dev: config.participationAmountDev}));
		}

		participating = chance.bool({likelihood: config.participationParticipatingPercentage});

		if (amount || participating) {	
			participations.push({
				participating: participating,
				amount: amount,
				person: personId,
				expense: expenseId,
			});
		}
	});

	return participations;
};

var db = nano(config.couchUrl);

db.bulkPr = Promise.promisify(db.bulk, false, db);


var person, persons = [], expense, baseTime, expenses = [];;

for (var i = 1; i <= config.personCount; i++) {
	person = createPerson();
	persons.push(person);
}

baseTime = new Date(config.expenseStartDate).getTime() / 1000;

for (var i = 1; i <= config.expenseCount; i++) {
	expense = createExpense(baseTime, persons);
	baseTime = expense.time;
	expenses.push(expense);
}

db.bulkPr({
	docs: persons.concat(expenses),
})
	.then(
		console.log.bind(console), 
		console.error.bind(console)
	)
;


