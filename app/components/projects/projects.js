PIXI.utils.skipHello();

let app = new PIXI.Application(400,500,{transparent: true});

let wrap = document.querySelector('.distortion__wrap');
wrap.appendChild(app.view);

let container = new PIXI.Container();
app.stage.addChild(container);

let bg = PIXI.Sprite.fromImage('img/project1.jpg');
let bg1 = PIXI.Sprite.fromImage('img/project2.jpg');
let bg2 = PIXI.Sprite.fromImage('img/skills.jpg');

bg.width = 380;
bg.height = 500;

bg1.width = 380;
bg1.height = 500;


bg2.width = 380;
bg2.height = 500;


let bgArr = [bg, bg1, bg2];

bgArr.map(function(item) {
	return item.alpha = 0
});

bg.alpha = 1;

container.addChild(bg);
container.addChild(bg1);
container.addChild(bg2);


let displacementSprite = PIXI.Sprite.fromImage('img/clouds.jpg');

let displacementFilter = new PIXI.filters.DisplacementFilter(
	displacementSprite
);

displacementSprite.x = -50;

displacementFilter.scale.set(0);

app.stage.addChild(displacementSprite);

container.filters = [displacementFilter];


let projects = document.querySelectorAll('.about__project');
let prev = 0;

function distortion(e) {
	let name = e.target.getAttribute('class');
	let current = name.split('-')[1];

	if (prev == current) {
		return
	}

	let tl = new TimelineMax();

	tl.to(displacementFilter.scale, 0.5, { x: -30, y: -30})
	tl.fromTo(displacementSprite, 1.0, { x: -50}, {x: 50}, 0)

	tl.to(bgArr[current], 1, {alpha: 1}, 0)
	tl.to(bgArr[prev], 1, {alpha: 0}, 0)

	tl.to(displacementFilter.scale, 1, { x: 0, y: 0}, '=-0.5')

	prev = current;
};

for (let i = 0; i < projects.length; i+=1) {
	projects[i].addEventListener('mouseover' , distortion)
}


