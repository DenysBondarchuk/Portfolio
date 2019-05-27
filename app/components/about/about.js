function setMyAge() {
	const egePlace = document.querySelector('.myage');

	let current = new Date();
	let birthday = new Date("1995/2/19");
	let diff = current - birthday;
	let age = Math.floor(diff / 31557600000);

	egePlace.innerHTML = age;
}

setMyAge();