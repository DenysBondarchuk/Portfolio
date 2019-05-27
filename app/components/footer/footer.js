function currentYear() {
	const place = document.querySelector('.footer__year');

	let date = new Date();
	let year = date.getFullYear();

	place.innerHTML = year;
}