var chance = new require('chance')(),
    fs = require('fs'),
    path = require('path');

var config = {
	rootPath: path.join(__dirname, 'output'),
	personPath: 'person.csv',
	personHiddenPercentage: 30,
	personCount: 10,
	expensePath: 'expense.csv',
	expenseStartDate: 'Jan 1, 2014',
	expenseRate: .5 / (60 * 60 * 24),
	expenseDescriptionWordsMean: 6,
	expenseDescriptionWordsDev: 2,
	expenseCount: 150,
	participationPath: 'participation.csv',
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

// persons:
(function () {
	var line;

	var personId;

	var personStream = fs.createWriteStream(path.join(config.rootPath, config.personPath));

	for (personId = 1; personId <= config.personCount; personId++) {
		line = [personId, chance.name(), +chance.bool({likelihood: config.personHiddenPercentage})];
		personStream.write(line.join(',') + "\n");
	}

	personStream.end();
}());

// expenses
(function () {
	var line;

	var expenseId, name;

	var time = new Date(config.expenseStartDate).getTime() / 1000;

	var expenseStream = fs.createWriteStream(path.join(config.rootPath, config.expensePath));

	for (expenseId = 1; expenseId <= config.expenseCount; expenseId++) {
		time += nextTime(config.expenseRate);

		name = chance.sentence({
			words: Math.round(chance.normal({
				mean: config.expenseDescriptionWordsMean, 
				dev: config.expenseDescriptionWordsDev,
			})),
		});

		line = [expenseId, name, Math.round(time)];
		expenseStream.write(line.join(',') + "\n");
	}

	expenseStream.end();
}());

// participations
(function () {
	var line;

	var expenseId, personId;

	var payerCount, payers, payerId;

	var amount, participating;

	var partId = 1;
	var participationStream = fs.createWriteStream(path.join(config.rootPath, config.participationPath));


	for (expenseId = 1; expenseId <= config.expenseCount; expenseId++) {
		payerCount = chance.normal({
			mean: config.participationPayingMean, 
			dev: config.participationPayingDev,
		});

		payerCount = Math.min(config.personCount, Math.max(1, Math.round(payerCount)));

		payers = [];

		for (var i = 0; i < payerCount; i++) {
			do {
				payerId = chance.integer({min: 1, max: config.personCount});
			} while (payers.indexOf(payerId) != -1);
			payers.push(payerId);
		}

		for (personId = 1; personId <= config.personCount; personId++) {
			if (payers.indexOf(personId) == -1) {
				amount = 0;
			} else {
				amount = Math.round(chance.normal({mean: config.participationAmoutMean, dev: config.participationAmountDev}));
			}

			participating = +chance.bool({likelihood: config.participationParticipatingPercentage});

			line = [partId, expenseId, personId, amount, participating];
			
			participationStream.write(line.join(',') + "\n");

			partId++;
		}
	}

	participationStream.end();
}());


