function splitLetter() {
	let name = document.querySelectorAll('.split');
	let letters = [];
	let spanLetter = [];
	for (let i = 0; i < name.length; i+=1) {
		letters.push(name[i].innerHTML.split(''));
		spanLetter.push(letters[i].map(function(item){
			return '<span class="letter">' + item + '</span>'
		}));
		name[i].innerHTML = spanLetter[i].join('');
	}
}

splitLetter();
