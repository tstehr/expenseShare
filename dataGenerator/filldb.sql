use expense_share;



-- persons

delete from persons;

load data local infile "output/person.csv"
	into table persons
	fields terminated by ',' enclosed by '' escaped by '\\'
	lines terminated by '\n' starting by '';

-- persons

delete from expenses;

load data local infile "output/expense.csv"
	into table expenses
	fields terminated by ',' enclosed by '' escaped by '\\'
	lines terminated by '\n' starting by ''
	(id, description, @var1) 
	set created = from_unixtime(@var1);