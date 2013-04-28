/*
	Cancel "touchmove" event on body to prevent body scrolling.
	Possibly iOS specific, needs further testing	
*/

document.addEventListener('touchmove', function (e) {
	e.preventDefault();
});

/*
	Stop propageation for all touchmove events that bubble up to list elements. This
	is necessary to make the container scrollable in conjunction with the hack above.
	Bodyscrolling from within list elements is prevented by a css hack.
*/
Array.prototype.forEach.call(document.querySelectorAll('.list'), function (el) {
	el.addEventListener('touchmove', function (e) {
		e.stopPropagation();
	});
});