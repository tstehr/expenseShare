var chance = new require('chance')(),
    fs = require('fs'),
    path = require('path');

var config = {
	rootPath: path.join(__dirname, 'output'),
	personPath: 'person.csv',
	personHiddenPercentage: 30,
	personCount: 10,
	expensePath: 'expense.csv',
	expenseStartDate: undefined,
	expenseRate: 3 / (60 * 60 * 24),
	expenseCount: 100,
};

// _.extend(config, require('./config.json'));

var nextTime = function (rate) {
	return -Math.log(1.0 - Math.random()) / rate;
};

// persons:
(function () {
	var line;

	var personStream = fs.createWriteStream(path.join(config.rootPath, config.personPath));

	for (var i = 0; i < config.personCount; i++) {
		line = [i, chance.name(), chance.bool({likelihood: config.personHiddenPercentage})];
		personStream.write(line.join(',') + "\n");
	}

	personStream.end();
}());

(function () {
	var time = new Date(config.expenseStartDate).getTime() / 1000;

	var timeStep;
	var line;
	var name;

	var expenseStream = fs.createWriteStream(path.join(config.rootPath, config.expensePath));

	for (var i = 0; i < config.expenseCount; i++) {
		time += nextTime(config.expenseRate);

		name = chance.sentence({
			words: Math.round(chance.normal({
				mean: 6, 
				dev: 2,
			})),
		});

		line = [i, name, time];
		expenseStream.write(line.join(',') + "\n");
	}

	expenseStream.end();
}());

