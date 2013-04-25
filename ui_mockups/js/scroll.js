document.addEventListener('touchmove', function (e) {
	e.preventDefault();
});

Array.prototype.forEach.call(document.querySelectorAll('.list'), function (el) {
	el.addEventListener('touchmove', function (e) {
		e.stopPropagation();
	});
});