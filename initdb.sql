drop database if exists expense_share;
create database expense_share;
use expense_share
set names utf8;
create table persons(id int not null auto_increment primary key, name varchar(50) not null, hidden boolean not null);
create table expenses(id int not null auto_increment primary key, description varchar(50) not null, expenses.month char(7) not null);
create table participations(id int not null auto_increment primary key, person int not null, expense int not null, amount int not null,participating boolean not null);