drop database expense_share;
create database expense_share;
use expense_share
create table persons(id int not null auto_increment primary key, name varchar(50) not null);
create table expenses(id int not null auto_increment primary key, description varchar(50) not null, expenses.month char(7) not null);
create table participations(id int not null auto_increment primary key, person int not null, expense int not null, amount int not null,participating boolean not null);

-- Test Beginnt hier
insert into persons values(1,"Mueller");
insert into persons values(2,"Bayer");
insert into persons values(3,"Schulze");
insert into persons values(4,"Meier");

insert into expenses values(1,"Wraps","2013-06");
insert into expenses values(2,"Suppe","2013-05");
insert into expenses values(3,"Torte","2013-05");
insert into expenses values(4,"Eis","2013-05");

insert into participations (person,expense,amount,participating) values(1,1,202,true);
insert into participations (person,expense,amount,participating) values(1,2,00,false);
insert into participations (person,expense,amount,participating) values(1,3,520,true);
insert into participations (person,expense,amount,participating) values(2,1,202,false);
insert into participations (person,expense,amount,participating) values(3,2,100,true);
insert into participations (person,expense,amount,participating) values(2,2,330,false);
