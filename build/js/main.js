window.onload = function() {
	let loader = document.querySelector('.loader');
	loader.classList.add('hide');
};

document.addEventListener("DOMContentLoaded", function() {

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
	

	// three.js circle start
	let scene = new THREE.Scene();
	let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

	let renderer = new THREE.WebGLRenderer({alpha: true});
	renderer.setClearColor(0x000000, 0);
	renderer.setSize( window.innerWidth, window.innerHeight );

	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = 65;

	document.getElementById('webgl').appendChild( renderer.domElement );

	let controls = {
	    radius: 3,
	    tube: 30,
	    radialSegments: 300,
	    tubularSegments: 21,
	    p: 1,
	    q: 4
	};

	function generateSprite() {
	    let canvas = document.createElement('canvas');
	    canvas.width = 16;
	    canvas.height = 16;

	    let ctx = canvas.getContext('2d');
	    let gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
	    gradient.addColorStop(0, 'rgba(255,255,255,1)');
	    gradient.addColorStop(0.3, 'rgba(0,55,255,1)');
	    gradient.addColorStop(0.9, 'rgba(0,0,0,0)');
	    gradient.addColorStop(1, 'rgba(0,0,0,0)');

	    ctx.fillStyle = gradient;

	    ctx.fillRect(0, 0, canvas.width, canvas.height);

	    let texture = new THREE.Texture(canvas);
	    texture.needsUpdate = true;
	    return texture;
	};

	let geometry = new THREE.TorusKnotGeometry(controls.radius, controls.tube, controls.radialSegments, controls.tubularSegments, controls.p, controls.q);


	let material = new THREE.PointCloudMaterial({
	    color: 0xffffff,
	    size: 0.8,
	    transparent: true,
	    blending: THREE.AdditiveBlending,
	    map: generateSprite()
	});

	let system = new THREE.PointCloud(geometry, material);
	system.sortParticles = true;

	scene.add( system );

	let rotateSpeed = 0.001;

	function animate() {
	    requestAnimationFrame( animate );
	    renderer.render( scene, camera );

	    system.rotation.y += rotateSpeed;
	}

	animate();
	// three.js circle end

	window.onorientationchange = function() { 
		setTimeout(webglResize, 100);
    }

    window.addEventListener( 'resize', function(){
	  	if (window.innerWidth >= 767) {
			webglResize();
	  	}
    });


	function webglResize(){
	    camera.aspect = window.innerWidth / window.innerHeight;
	    renderer.setSize( window.innerWidth, window.innerHeight );
	    camera.updateProjectionMatrix();
	}

	let scrolledPoint = 300;
	let haeaderNav 	  = document.querySelector('.header__nav');
	let toogleMenu    = document.querySelector('.toogle-menu');
	let fullNav 	  = document.querySelector('.full-nav');
	let content 	  = document.querySelector('.content');
	let underlay 	  = document.querySelector('.underlay');

	if (window.pageYOffset >= scrolledPoint) {
		haeaderNav.classList.add('hide');
		toogleMenu.classList.add('active');
		underlay.classList.add('active');

		let tl = new TimelineMax();
		tl.to(system.scale, 1, {x:2.0, y:2.0, z:2.0})
	}

	window.onscroll = function() {
		let scrolled = window.pageYOffset || document.documentElement.scrollTop;
	  	if (scrolled >= scrolledPoint) {
			haeaderNav.classList.add('hide');
			toogleMenu.classList.add('active');
			underlay.classList.add('active');

			webglResize();

			let tl = new TimelineMax();
			tl.to(system.scale, 1, {x:2.0, y:2.0, z:2.0})

	  	} else {
			haeaderNav.classList.remove('hide');
			toogleMenu.classList.remove('active');
			underlay.classList.remove('active');

			let tl = new TimelineMax();
			tl.to(system.scale, 1, {x:1.0, y:1.0, z:1.0})
	  	}
	}

	function preventDefault(e){
	    e.preventDefault();
	}

	function disableScroll(){
	    document.body.addEventListener('touchmove', preventDefault, { passive: false });
	}
	function enableScroll(){
	    document.body.removeEventListener('touchmove', preventDefault);
	}

	toogleMenu.onclick = function(){
		if (!this.classList.contains('clicked')) {
			this.classList.add('clicked');
			content.classList.add('hide');
			fullNav.classList.add('active');
			document.body.classList.add('overflow');
			disableScroll();


			let tl = new TimelineMax();
			tl.to(system.scale, 1, {x:2.5, y:2.5, z:2.5})
			tl.to(material, 1, {size:1.2},0)

		} else {
			this.classList.remove('clicked');
			content.classList.remove('hide');
			fullNav.classList.remove('active');
			document.body.classList.remove('overflow');
			enableScroll();

			let tl = new TimelineMax();
			tl.to(system.scale, 1, {x:2.0, y:2.0, z:2.0})
			tl.to(material, 1, {size:0.8},0)
		}
	};

	// gsap anchors start
	const anchors = [].slice.call(document.querySelectorAll('a[href*="#"]'));

	anchors.forEach(function(item) {
	  item.addEventListener('click', function(e) {
	    e.preventDefault();

	    if (fullNav.classList.contains('active')) {
	    	fullNav.classList.remove('active');
	    	content.classList.remove('hide');
	    	toogleMenu.classList.remove('clicked');
	    	document.body.classList.remove('overflow');
	    	let tl = new TimelineMax();
	    	tl.to(material, 1, {size:0.8},0)
	    }

	    let sectionOffset = document.querySelector(item.getAttribute('href')).offsetTop;
	    TweenLite.to(window, 1,{scrollTo:{y:sectionOffset, autoKill:false}});
	    enableScroll();

	  });
	});
	// gsap anchors end

	// animation start
	if (window.pageYOffset <= scrolledPoint) {
		let tl_header = new TimelineMax();
		tl_header
			// .fromTo(system.scale, 1.5, {x:0.0, y:0.0, z:0.0}, {ease: Power1.easeInOut, x:1.0, y:1.0, z:1.0})
			// .fromTo(system.scale, 1.5, {x:0.0, y:0.0, z:0.0}, {ease: Circ.easeInOut, x:1.0, y:1.0, z:1.0})
			.fromTo(system.scale, 1.5, {x:0.0, y:0.0, z:0.0}, {ease: Power3.easeInOut, x:1.0, y:1.0, z:1.0})
			.staggerFromTo('.header__item', 0.5, {opacity:0, y:-50}, {opacity:1, y:0}, 0.05, '=+0.7')
			.fromTo('.header__anchor', 0.5, {opacity: 0}, {opacity: 1}, '=-0.5')
	}

	let controller = new ScrollMagic.Controller();

	// animation "about"
	let tl__about = new TimelineMax();
		tl__about
			.fromTo('#about .about__show', 1, {opacity:0, y: 200}, {opacity:1, y: 0})
			.staggerFromTo('#about .split .letter', 0.5, {opacity:0, y:-50}, {opacity:1, y:0}, 0.05, '=-0.25')
			.fromTo('#about .about__text', 1, {opacity:0, x: -50}, {opacity:1, x: 0}, '=-0.5')

		let sceneAbout = new ScrollMagic.Scene({
		  triggerElement: "#about",
		  reverse: false  
		})
		// .addIndicators()
		.setTween(tl__about)
		.addTo(controller);
	// animation "about" end

	// animation "skills"
	let tl__skills = new TimelineMax();
		tl__skills
			.fromTo('#skills .about__show', 1, {opacity:0, y: 200}, {opacity:1, y: 0})
			.staggerFromTo('#skills .split .letter', 0.5, {opacity:0, y:-50}, {opacity:1, y:0}, 0.05, '=-0.25')
			.fromTo('#skills .about__info', 1, {opacity:0, x: 50}, {opacity:1, x: 0}, '=-0.5')
			// .staggerFromTo('.about__item', 1, {opacity:0, x: 50}, {opacity:1, x:0}, 0.1, '=-0.5')

		let sceneSkills = new ScrollMagic.Scene({
		  triggerElement: "#skills",
		  reverse: false  
		})
		// .addIndicators()
		.setTween(tl__skills)
		.addTo(controller);
	// animation "skills" end

	// animation "browsers"
	let tl__browsers = new TimelineMax();
		tl__browsers
			.fromTo('.browsers', 1, {opacity:0}, {opacity:1},0)
			.staggerFromTo('.browsers__name', 1, {opacity:0, y: 20}, {opacity:1, y:0}, 0.1, '=-0.5')
			.fromTo('.about__title', 2, {opacity:0}, {opacity:1}, '=-1.5')

		let sceneBrowsers = new ScrollMagic.Scene({
		  triggerElement: ".about__title",
		  reverse: false  
		})
		// .addIndicators()
		.setTween(tl__browsers)
		.setClassToggle('.browsers__svg', 'active')
		.addTo(controller);
	// animation "browsers" end

	// animation "projects"
	let tl__projects = new TimelineMax();
		tl__projects
			.fromTo('#projects .about__show', 1, {opacity:0, y: 200}, {opacity:1, y: 0})
			.staggerFromTo('#projects .split .letter', 0.5, {opacity:0, y:-50}, {opacity:1, y:0}, 0.05, '=-0.25')
			.fromTo('#projects .about__info', 1, {opacity:0, x: -50}, {opacity:1, x:0}, '=-0.5')
			.fromTo('.contacts__main', 1, {opacity:0}, {opacity:1})


		let sceneProjects = new ScrollMagic.Scene({
		  triggerElement: "#projects",
		  reverse: false  
		})
		// .addIndicators()
		.setTween(tl__projects)
		.addTo(controller);
	// animation "projects" end


	// animation end

	function currentYear() {
		const place = document.querySelector('.footer__year');
	
		let date = new Date();
		let year = date.getFullYear();
	
		place.innerHTML = year;
	}
	function setMyAge() {
		const egePlace = document.querySelector('.myage');
	
		let current = new Date();
		let birthday = new Date("1995/2/19");
		let diff = current - birthday;
		let age = Math.floor(diff / 31557600000);
	
		egePlace.innerHTML = age;
	}
	
	setMyAge();
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
	
	
	


});

console.log("%c+", 'font-size: 1px; padding: 64px 80px; line-height: 0; background: url("https://s8.hostingkartinok.com/uploads/images/2019/05/164c4042f9610feb6f9692df0220ae8b.jpg"); background-repeat: no-repeat; background-size: contain; color: transparent;');



//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiLCIuLi9jb21wb25lbnRzL2NvbnRhY3RzL2NvbnRhY3RzLmpzIiwiLi4vY29tcG9uZW50cy9mb290ZXIvZm9vdGVyLmpzIiwiLi4vY29tcG9uZW50cy9hYm91dC9hYm91dC5qcyIsIi4uL2NvbXBvbmVudHMvcHJvamVjdHMvcHJvamVjdHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Q0NOQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7QUROQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Q0V4UkE7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQ1BBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQ1hBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7QUowTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsid2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuXHRsZXQgbG9hZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmxvYWRlcicpO1xuXHRsb2FkZXIuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xufTtcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZnVuY3Rpb24oKSB7XG5cblx0Ly89aW5jbHVkZSAuLi9jb21wb25lbnRzL2NvbnRhY3RzL2NvbnRhY3RzLmpzXG5cblx0Ly8gdGhyZWUuanMgY2lyY2xlIHN0YXJ0XG5cdGxldCBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuXHRsZXQgY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKCA3NSwgd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQsIDAuMSwgMTAwMCApO1xuXG5cdGxldCByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHthbHBoYTogdHJ1ZX0pO1xuXHRyZW5kZXJlci5zZXRDbGVhckNvbG9yKDB4MDAwMDAwLCAwKTtcblx0cmVuZGVyZXIuc2V0U2l6ZSggd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCApO1xuXG5cdGNhbWVyYS5wb3NpdGlvbi54ID0gMDtcblx0Y2FtZXJhLnBvc2l0aW9uLnkgPSAwO1xuXHRjYW1lcmEucG9zaXRpb24ueiA9IDY1O1xuXG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3ZWJnbCcpLmFwcGVuZENoaWxkKCByZW5kZXJlci5kb21FbGVtZW50ICk7XG5cblx0bGV0IGNvbnRyb2xzID0ge1xuXHQgICAgcmFkaXVzOiAzLFxuXHQgICAgdHViZTogMzAsXG5cdCAgICByYWRpYWxTZWdtZW50czogMzAwLFxuXHQgICAgdHVidWxhclNlZ21lbnRzOiAyMSxcblx0ICAgIHA6IDEsXG5cdCAgICBxOiA0XG5cdH07XG5cblx0ZnVuY3Rpb24gZ2VuZXJhdGVTcHJpdGUoKSB7XG5cdCAgICBsZXQgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cdCAgICBjYW52YXMud2lkdGggPSAxNjtcblx0ICAgIGNhbnZhcy5oZWlnaHQgPSAxNjtcblxuXHQgICAgbGV0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXHQgICAgbGV0IGdyYWRpZW50ID0gY3R4LmNyZWF0ZVJhZGlhbEdyYWRpZW50KGNhbnZhcy53aWR0aCAvIDIsIGNhbnZhcy5oZWlnaHQgLyAyLCAwLCBjYW52YXMud2lkdGggLyAyLCBjYW52YXMuaGVpZ2h0IC8gMiwgY2FudmFzLndpZHRoIC8gMik7XG5cdCAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMCwgJ3JnYmEoMjU1LDI1NSwyNTUsMSknKTtcblx0ICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLjMsICdyZ2JhKDAsNTUsMjU1LDEpJyk7XG5cdCAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMC45LCAncmdiYSgwLDAsMCwwKScpO1xuXHQgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDEsICdyZ2JhKDAsMCwwLDApJyk7XG5cblx0ICAgIGN0eC5maWxsU3R5bGUgPSBncmFkaWVudDtcblxuXHQgICAgY3R4LmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cblx0ICAgIGxldCB0ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUoY2FudmFzKTtcblx0ICAgIHRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xuXHQgICAgcmV0dXJuIHRleHR1cmU7XG5cdH07XG5cblx0bGV0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLlRvcnVzS25vdEdlb21ldHJ5KGNvbnRyb2xzLnJhZGl1cywgY29udHJvbHMudHViZSwgY29udHJvbHMucmFkaWFsU2VnbWVudHMsIGNvbnRyb2xzLnR1YnVsYXJTZWdtZW50cywgY29udHJvbHMucCwgY29udHJvbHMucSk7XG5cblxuXHRsZXQgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuUG9pbnRDbG91ZE1hdGVyaWFsKHtcblx0ICAgIGNvbG9yOiAweGZmZmZmZixcblx0ICAgIHNpemU6IDAuOCxcblx0ICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuXHQgICAgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXG5cdCAgICBtYXA6IGdlbmVyYXRlU3ByaXRlKClcblx0fSk7XG5cblx0bGV0IHN5c3RlbSA9IG5ldyBUSFJFRS5Qb2ludENsb3VkKGdlb21ldHJ5LCBtYXRlcmlhbCk7XG5cdHN5c3RlbS5zb3J0UGFydGljbGVzID0gdHJ1ZTtcblxuXHRzY2VuZS5hZGQoIHN5c3RlbSApO1xuXG5cdGxldCByb3RhdGVTcGVlZCA9IDAuMDAxO1xuXG5cdGZ1bmN0aW9uIGFuaW1hdGUoKSB7XG5cdCAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIGFuaW1hdGUgKTtcblx0ICAgIHJlbmRlcmVyLnJlbmRlciggc2NlbmUsIGNhbWVyYSApO1xuXG5cdCAgICBzeXN0ZW0ucm90YXRpb24ueSArPSByb3RhdGVTcGVlZDtcblx0fVxuXG5cdGFuaW1hdGUoKTtcblx0Ly8gdGhyZWUuanMgY2lyY2xlIGVuZFxuXG5cdHdpbmRvdy5vbm9yaWVudGF0aW9uY2hhbmdlID0gZnVuY3Rpb24oKSB7IFxuXHRcdHNldFRpbWVvdXQod2ViZ2xSZXNpemUsIDEwMCk7XG4gICAgfVxuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdyZXNpemUnLCBmdW5jdGlvbigpe1xuXHQgIFx0aWYgKHdpbmRvdy5pbm5lcldpZHRoID49IDc2Nykge1xuXHRcdFx0d2ViZ2xSZXNpemUoKTtcblx0ICBcdH1cbiAgICB9KTtcblxuXG5cdGZ1bmN0aW9uIHdlYmdsUmVzaXplKCl7XG5cdCAgICBjYW1lcmEuYXNwZWN0ID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cdCAgICByZW5kZXJlci5zZXRTaXplKCB3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0ICk7XG5cdCAgICBjYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuXHR9XG5cblx0bGV0IHNjcm9sbGVkUG9pbnQgPSAzMDA7XG5cdGxldCBoYWVhZGVyTmF2IFx0ICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5oZWFkZXJfX25hdicpO1xuXHRsZXQgdG9vZ2xlTWVudSAgICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50b29nbGUtbWVudScpO1xuXHRsZXQgZnVsbE5hdiBcdCAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZnVsbC1uYXYnKTtcblx0bGV0IGNvbnRlbnQgXHQgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRlbnQnKTtcblx0bGV0IHVuZGVybGF5IFx0ICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy51bmRlcmxheScpO1xuXG5cdGlmICh3aW5kb3cucGFnZVlPZmZzZXQgPj0gc2Nyb2xsZWRQb2ludCkge1xuXHRcdGhhZWFkZXJOYXYuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuXHRcdHRvb2dsZU1lbnUuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG5cdFx0dW5kZXJsYXkuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG5cblx0XHRsZXQgdGwgPSBuZXcgVGltZWxpbmVNYXgoKTtcblx0XHR0bC50byhzeXN0ZW0uc2NhbGUsIDEsIHt4OjIuMCwgeToyLjAsIHo6Mi4wfSlcblx0fVxuXG5cdHdpbmRvdy5vbnNjcm9sbCA9IGZ1bmN0aW9uKCkge1xuXHRcdGxldCBzY3JvbGxlZCA9IHdpbmRvdy5wYWdlWU9mZnNldCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wO1xuXHQgIFx0aWYgKHNjcm9sbGVkID49IHNjcm9sbGVkUG9pbnQpIHtcblx0XHRcdGhhZWFkZXJOYXYuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuXHRcdFx0dG9vZ2xlTWVudS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcblx0XHRcdHVuZGVybGF5LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuXG5cdFx0XHR3ZWJnbFJlc2l6ZSgpO1xuXG5cdFx0XHRsZXQgdGwgPSBuZXcgVGltZWxpbmVNYXgoKTtcblx0XHRcdHRsLnRvKHN5c3RlbS5zY2FsZSwgMSwge3g6Mi4wLCB5OjIuMCwgejoyLjB9KVxuXG5cdCAgXHR9IGVsc2Uge1xuXHRcdFx0aGFlYWRlck5hdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG5cdFx0XHR0b29nbGVNZW51LmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuXHRcdFx0dW5kZXJsYXkuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG5cblx0XHRcdGxldCB0bCA9IG5ldyBUaW1lbGluZU1heCgpO1xuXHRcdFx0dGwudG8oc3lzdGVtLnNjYWxlLCAxLCB7eDoxLjAsIHk6MS4wLCB6OjEuMH0pXG5cdCAgXHR9XG5cdH1cblxuXHRmdW5jdGlvbiBwcmV2ZW50RGVmYXVsdChlKXtcblx0ICAgIGUucHJldmVudERlZmF1bHQoKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGRpc2FibGVTY3JvbGwoKXtcblx0ICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgcHJldmVudERlZmF1bHQsIHsgcGFzc2l2ZTogZmFsc2UgfSk7XG5cdH1cblx0ZnVuY3Rpb24gZW5hYmxlU2Nyb2xsKCl7XG5cdCAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHByZXZlbnREZWZhdWx0KTtcblx0fVxuXG5cdHRvb2dsZU1lbnUub25jbGljayA9IGZ1bmN0aW9uKCl7XG5cdFx0aWYgKCF0aGlzLmNsYXNzTGlzdC5jb250YWlucygnY2xpY2tlZCcpKSB7XG5cdFx0XHR0aGlzLmNsYXNzTGlzdC5hZGQoJ2NsaWNrZWQnKTtcblx0XHRcdGNvbnRlbnQuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuXHRcdFx0ZnVsbE5hdi5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcblx0XHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnb3ZlcmZsb3cnKTtcblx0XHRcdGRpc2FibGVTY3JvbGwoKTtcblxuXG5cdFx0XHRsZXQgdGwgPSBuZXcgVGltZWxpbmVNYXgoKTtcblx0XHRcdHRsLnRvKHN5c3RlbS5zY2FsZSwgMSwge3g6Mi41LCB5OjIuNSwgejoyLjV9KVxuXHRcdFx0dGwudG8obWF0ZXJpYWwsIDEsIHtzaXplOjEuMn0sMClcblxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmNsYXNzTGlzdC5yZW1vdmUoJ2NsaWNrZWQnKTtcblx0XHRcdGNvbnRlbnQuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuXHRcdFx0ZnVsbE5hdi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcblx0XHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcmZsb3cnKTtcblx0XHRcdGVuYWJsZVNjcm9sbCgpO1xuXG5cdFx0XHRsZXQgdGwgPSBuZXcgVGltZWxpbmVNYXgoKTtcblx0XHRcdHRsLnRvKHN5c3RlbS5zY2FsZSwgMSwge3g6Mi4wLCB5OjIuMCwgejoyLjB9KVxuXHRcdFx0dGwudG8obWF0ZXJpYWwsIDEsIHtzaXplOjAuOH0sMClcblx0XHR9XG5cdH07XG5cblx0Ly8gZ3NhcCBhbmNob3JzIHN0YXJ0XG5cdGNvbnN0IGFuY2hvcnMgPSBbXS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2FbaHJlZio9XCIjXCJdJykpO1xuXG5cdGFuY2hvcnMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG5cdCAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcblx0ICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuXHQgICAgaWYgKGZ1bGxOYXYuY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSkge1xuXHQgICAgXHRmdWxsTmF2LmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuXHQgICAgXHRjb250ZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcblx0ICAgIFx0dG9vZ2xlTWVudS5jbGFzc0xpc3QucmVtb3ZlKCdjbGlja2VkJyk7XG5cdCAgICBcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnb3ZlcmZsb3cnKTtcblx0ICAgIFx0bGV0IHRsID0gbmV3IFRpbWVsaW5lTWF4KCk7XG5cdCAgICBcdHRsLnRvKG1hdGVyaWFsLCAxLCB7c2l6ZTowLjh9LDApXG5cdCAgICB9XG5cblx0ICAgIGxldCBzZWN0aW9uT2Zmc2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpdGVtLmdldEF0dHJpYnV0ZSgnaHJlZicpKS5vZmZzZXRUb3A7XG5cdCAgICBUd2VlbkxpdGUudG8od2luZG93LCAxLHtzY3JvbGxUbzp7eTpzZWN0aW9uT2Zmc2V0LCBhdXRvS2lsbDpmYWxzZX19KTtcblx0ICAgIGVuYWJsZVNjcm9sbCgpO1xuXG5cdCAgfSk7XG5cdH0pO1xuXHQvLyBnc2FwIGFuY2hvcnMgZW5kXG5cblx0Ly8gYW5pbWF0aW9uIHN0YXJ0XG5cdGlmICh3aW5kb3cucGFnZVlPZmZzZXQgPD0gc2Nyb2xsZWRQb2ludCkge1xuXHRcdGxldCB0bF9oZWFkZXIgPSBuZXcgVGltZWxpbmVNYXgoKTtcblx0XHR0bF9oZWFkZXJcblx0XHRcdC8vIC5mcm9tVG8oc3lzdGVtLnNjYWxlLCAxLjUsIHt4OjAuMCwgeTowLjAsIHo6MC4wfSwge2Vhc2U6IFBvd2VyMS5lYXNlSW5PdXQsIHg6MS4wLCB5OjEuMCwgejoxLjB9KVxuXHRcdFx0Ly8gLmZyb21UbyhzeXN0ZW0uc2NhbGUsIDEuNSwge3g6MC4wLCB5OjAuMCwgejowLjB9LCB7ZWFzZTogQ2lyYy5lYXNlSW5PdXQsIHg6MS4wLCB5OjEuMCwgejoxLjB9KVxuXHRcdFx0LmZyb21UbyhzeXN0ZW0uc2NhbGUsIDEuNSwge3g6MC4wLCB5OjAuMCwgejowLjB9LCB7ZWFzZTogUG93ZXIzLmVhc2VJbk91dCwgeDoxLjAsIHk6MS4wLCB6OjEuMH0pXG5cdFx0XHQuc3RhZ2dlckZyb21UbygnLmhlYWRlcl9faXRlbScsIDAuNSwge29wYWNpdHk6MCwgeTotNTB9LCB7b3BhY2l0eToxLCB5OjB9LCAwLjA1LCAnPSswLjcnKVxuXHRcdFx0LmZyb21UbygnLmhlYWRlcl9fYW5jaG9yJywgMC41LCB7b3BhY2l0eTogMH0sIHtvcGFjaXR5OiAxfSwgJz0tMC41Jylcblx0fVxuXG5cdGxldCBjb250cm9sbGVyID0gbmV3IFNjcm9sbE1hZ2ljLkNvbnRyb2xsZXIoKTtcblxuXHQvLyBhbmltYXRpb24gXCJhYm91dFwiXG5cdGxldCB0bF9fYWJvdXQgPSBuZXcgVGltZWxpbmVNYXgoKTtcblx0XHR0bF9fYWJvdXRcblx0XHRcdC5mcm9tVG8oJyNhYm91dCAuYWJvdXRfX3Nob3cnLCAxLCB7b3BhY2l0eTowLCB5OiAyMDB9LCB7b3BhY2l0eToxLCB5OiAwfSlcblx0XHRcdC5zdGFnZ2VyRnJvbVRvKCcjYWJvdXQgLnNwbGl0IC5sZXR0ZXInLCAwLjUsIHtvcGFjaXR5OjAsIHk6LTUwfSwge29wYWNpdHk6MSwgeTowfSwgMC4wNSwgJz0tMC4yNScpXG5cdFx0XHQuZnJvbVRvKCcjYWJvdXQgLmFib3V0X190ZXh0JywgMSwge29wYWNpdHk6MCwgeDogLTUwfSwge29wYWNpdHk6MSwgeDogMH0sICc9LTAuNScpXG5cblx0XHRsZXQgc2NlbmVBYm91dCA9IG5ldyBTY3JvbGxNYWdpYy5TY2VuZSh7XG5cdFx0ICB0cmlnZ2VyRWxlbWVudDogXCIjYWJvdXRcIixcblx0XHQgIHJldmVyc2U6IGZhbHNlICBcblx0XHR9KVxuXHRcdC8vIC5hZGRJbmRpY2F0b3JzKClcblx0XHQuc2V0VHdlZW4odGxfX2Fib3V0KVxuXHRcdC5hZGRUbyhjb250cm9sbGVyKTtcblx0Ly8gYW5pbWF0aW9uIFwiYWJvdXRcIiBlbmRcblxuXHQvLyBhbmltYXRpb24gXCJza2lsbHNcIlxuXHRsZXQgdGxfX3NraWxscyA9IG5ldyBUaW1lbGluZU1heCgpO1xuXHRcdHRsX19za2lsbHNcblx0XHRcdC5mcm9tVG8oJyNza2lsbHMgLmFib3V0X19zaG93JywgMSwge29wYWNpdHk6MCwgeTogMjAwfSwge29wYWNpdHk6MSwgeTogMH0pXG5cdFx0XHQuc3RhZ2dlckZyb21UbygnI3NraWxscyAuc3BsaXQgLmxldHRlcicsIDAuNSwge29wYWNpdHk6MCwgeTotNTB9LCB7b3BhY2l0eToxLCB5OjB9LCAwLjA1LCAnPS0wLjI1Jylcblx0XHRcdC5mcm9tVG8oJyNza2lsbHMgLmFib3V0X19pbmZvJywgMSwge29wYWNpdHk6MCwgeDogNTB9LCB7b3BhY2l0eToxLCB4OiAwfSwgJz0tMC41Jylcblx0XHRcdC8vIC5zdGFnZ2VyRnJvbVRvKCcuYWJvdXRfX2l0ZW0nLCAxLCB7b3BhY2l0eTowLCB4OiA1MH0sIHtvcGFjaXR5OjEsIHg6MH0sIDAuMSwgJz0tMC41JylcblxuXHRcdGxldCBzY2VuZVNraWxscyA9IG5ldyBTY3JvbGxNYWdpYy5TY2VuZSh7XG5cdFx0ICB0cmlnZ2VyRWxlbWVudDogXCIjc2tpbGxzXCIsXG5cdFx0ICByZXZlcnNlOiBmYWxzZSAgXG5cdFx0fSlcblx0XHQvLyAuYWRkSW5kaWNhdG9ycygpXG5cdFx0LnNldFR3ZWVuKHRsX19za2lsbHMpXG5cdFx0LmFkZFRvKGNvbnRyb2xsZXIpO1xuXHQvLyBhbmltYXRpb24gXCJza2lsbHNcIiBlbmRcblxuXHQvLyBhbmltYXRpb24gXCJicm93c2Vyc1wiXG5cdGxldCB0bF9fYnJvd3NlcnMgPSBuZXcgVGltZWxpbmVNYXgoKTtcblx0XHR0bF9fYnJvd3NlcnNcblx0XHRcdC5mcm9tVG8oJy5icm93c2VycycsIDEsIHtvcGFjaXR5OjB9LCB7b3BhY2l0eToxfSwwKVxuXHRcdFx0LnN0YWdnZXJGcm9tVG8oJy5icm93c2Vyc19fbmFtZScsIDEsIHtvcGFjaXR5OjAsIHk6IDIwfSwge29wYWNpdHk6MSwgeTowfSwgMC4xLCAnPS0wLjUnKVxuXHRcdFx0LmZyb21UbygnLmFib3V0X190aXRsZScsIDIsIHtvcGFjaXR5OjB9LCB7b3BhY2l0eToxfSwgJz0tMS41JylcblxuXHRcdGxldCBzY2VuZUJyb3dzZXJzID0gbmV3IFNjcm9sbE1hZ2ljLlNjZW5lKHtcblx0XHQgIHRyaWdnZXJFbGVtZW50OiBcIi5hYm91dF9fdGl0bGVcIixcblx0XHQgIHJldmVyc2U6IGZhbHNlICBcblx0XHR9KVxuXHRcdC8vIC5hZGRJbmRpY2F0b3JzKClcblx0XHQuc2V0VHdlZW4odGxfX2Jyb3dzZXJzKVxuXHRcdC5zZXRDbGFzc1RvZ2dsZSgnLmJyb3dzZXJzX19zdmcnLCAnYWN0aXZlJylcblx0XHQuYWRkVG8oY29udHJvbGxlcik7XG5cdC8vIGFuaW1hdGlvbiBcImJyb3dzZXJzXCIgZW5kXG5cblx0Ly8gYW5pbWF0aW9uIFwicHJvamVjdHNcIlxuXHRsZXQgdGxfX3Byb2plY3RzID0gbmV3IFRpbWVsaW5lTWF4KCk7XG5cdFx0dGxfX3Byb2plY3RzXG5cdFx0XHQuZnJvbVRvKCcjcHJvamVjdHMgLmFib3V0X19zaG93JywgMSwge29wYWNpdHk6MCwgeTogMjAwfSwge29wYWNpdHk6MSwgeTogMH0pXG5cdFx0XHQuc3RhZ2dlckZyb21UbygnI3Byb2plY3RzIC5zcGxpdCAubGV0dGVyJywgMC41LCB7b3BhY2l0eTowLCB5Oi01MH0sIHtvcGFjaXR5OjEsIHk6MH0sIDAuMDUsICc9LTAuMjUnKVxuXHRcdFx0LmZyb21UbygnI3Byb2plY3RzIC5hYm91dF9faW5mbycsIDEsIHtvcGFjaXR5OjAsIHg6IC01MH0sIHtvcGFjaXR5OjEsIHg6MH0sICc9LTAuNScpXG5cdFx0XHQuZnJvbVRvKCcuY29udGFjdHNfX21haW4nLCAxLCB7b3BhY2l0eTowfSwge29wYWNpdHk6MX0pXG5cblxuXHRcdGxldCBzY2VuZVByb2plY3RzID0gbmV3IFNjcm9sbE1hZ2ljLlNjZW5lKHtcblx0XHQgIHRyaWdnZXJFbGVtZW50OiBcIiNwcm9qZWN0c1wiLFxuXHRcdCAgcmV2ZXJzZTogZmFsc2UgIFxuXHRcdH0pXG5cdFx0Ly8gLmFkZEluZGljYXRvcnMoKVxuXHRcdC5zZXRUd2Vlbih0bF9fcHJvamVjdHMpXG5cdFx0LmFkZFRvKGNvbnRyb2xsZXIpO1xuXHQvLyBhbmltYXRpb24gXCJwcm9qZWN0c1wiIGVuZFxuXG5cblx0Ly8gYW5pbWF0aW9uIGVuZFxuXG5cdC8vPWluY2x1ZGUgLi4vY29tcG9uZW50cy9mb290ZXIvZm9vdGVyLmpzXG5cdC8vPWluY2x1ZGUgLi4vY29tcG9uZW50cy9hYm91dC9hYm91dC5qc1xuXHQvLz1pbmNsdWRlIC4uL2NvbXBvbmVudHMvcHJvamVjdHMvcHJvamVjdHMuanNcblxuXG59KTtcblxuY29uc29sZS5sb2coXCIlYytcIiwgJ2ZvbnQtc2l6ZTogMXB4OyBwYWRkaW5nOiA2NHB4IDgwcHg7IGxpbmUtaGVpZ2h0OiAwOyBiYWNrZ3JvdW5kOiB1cmwoXCJodHRwczovL3M4Lmhvc3RpbmdrYXJ0aW5vay5jb20vdXBsb2Fkcy9pbWFnZXMvMjAxOS8wNS8xNjRjNDA0MmY5NjEwZmViNmY5NjkyZGYwMjIwYWU4Yi5qcGdcIik7IGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7IGJhY2tncm91bmQtc2l6ZTogY29udGFpbjsgY29sb3I6IHRyYW5zcGFyZW50OycpO1xuXG5cbiIsImZ1bmN0aW9uIHNwbGl0TGV0dGVyKCkge1xuXHRsZXQgbmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5zcGxpdCcpO1xuXHRsZXQgbGV0dGVycyA9IFtdO1xuXHRsZXQgc3BhbkxldHRlciA9IFtdO1xuXHRmb3IgKGxldCBpID0gMDsgaSA8IG5hbWUubGVuZ3RoOyBpKz0xKSB7XG5cdFx0bGV0dGVycy5wdXNoKG5hbWVbaV0uaW5uZXJIVE1MLnNwbGl0KCcnKSk7XG5cdFx0c3BhbkxldHRlci5wdXNoKGxldHRlcnNbaV0ubWFwKGZ1bmN0aW9uKGl0ZW0pe1xuXHRcdFx0cmV0dXJuICc8c3BhbiBjbGFzcz1cImxldHRlclwiPicgKyBpdGVtICsgJzwvc3Bhbj4nXG5cdFx0fSkpO1xuXHRcdG5hbWVbaV0uaW5uZXJIVE1MID0gc3BhbkxldHRlcltpXS5qb2luKCcnKTtcblx0fVxufVxuXG5zcGxpdExldHRlcigpO1xuIiwiZnVuY3Rpb24gY3VycmVudFllYXIoKSB7XG5cdGNvbnN0IHBsYWNlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmZvb3Rlcl9feWVhcicpO1xuXG5cdGxldCBkYXRlID0gbmV3IERhdGUoKTtcblx0bGV0IHllYXIgPSBkYXRlLmdldEZ1bGxZZWFyKCk7XG5cblx0cGxhY2UuaW5uZXJIVE1MID0geWVhcjtcbn0iLCJmdW5jdGlvbiBzZXRNeUFnZSgpIHtcblx0Y29uc3QgZWdlUGxhY2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubXlhZ2UnKTtcblxuXHRsZXQgY3VycmVudCA9IG5ldyBEYXRlKCk7XG5cdGxldCBiaXJ0aGRheSA9IG5ldyBEYXRlKFwiMTk5NS8yLzE5XCIpO1xuXHRsZXQgZGlmZiA9IGN1cnJlbnQgLSBiaXJ0aGRheTtcblx0bGV0IGFnZSA9IE1hdGguZmxvb3IoZGlmZiAvIDMxNTU3NjAwMDAwKTtcblxuXHRlZ2VQbGFjZS5pbm5lckhUTUwgPSBhZ2U7XG59XG5cbnNldE15QWdlKCk7IiwiUElYSS51dGlscy5za2lwSGVsbG8oKTtcblxubGV0IGFwcCA9IG5ldyBQSVhJLkFwcGxpY2F0aW9uKDQwMCw1MDAse3RyYW5zcGFyZW50OiB0cnVlfSk7XG5cbmxldCB3cmFwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmRpc3RvcnRpb25fX3dyYXAnKTtcbndyYXAuYXBwZW5kQ2hpbGQoYXBwLnZpZXcpO1xuXG5sZXQgY29udGFpbmVyID0gbmV3IFBJWEkuQ29udGFpbmVyKCk7XG5hcHAuc3RhZ2UuYWRkQ2hpbGQoY29udGFpbmVyKTtcblxubGV0IGJnID0gUElYSS5TcHJpdGUuZnJvbUltYWdlKCdpbWcvcHJvamVjdDEuanBnJyk7XG5sZXQgYmcxID0gUElYSS5TcHJpdGUuZnJvbUltYWdlKCdpbWcvcHJvamVjdDIuanBnJyk7XG5sZXQgYmcyID0gUElYSS5TcHJpdGUuZnJvbUltYWdlKCdpbWcvc2tpbGxzLmpwZycpO1xuXG5iZy53aWR0aCA9IDM4MDtcbmJnLmhlaWdodCA9IDUwMDtcblxuYmcxLndpZHRoID0gMzgwO1xuYmcxLmhlaWdodCA9IDUwMDtcblxuXG5iZzIud2lkdGggPSAzODA7XG5iZzIuaGVpZ2h0ID0gNTAwO1xuXG5cbmxldCBiZ0FyciA9IFtiZywgYmcxLCBiZzJdO1xuXG5iZ0Fyci5tYXAoZnVuY3Rpb24oaXRlbSkge1xuXHRyZXR1cm4gaXRlbS5hbHBoYSA9IDBcbn0pO1xuXG5iZy5hbHBoYSA9IDE7XG5cbmNvbnRhaW5lci5hZGRDaGlsZChiZyk7XG5jb250YWluZXIuYWRkQ2hpbGQoYmcxKTtcbmNvbnRhaW5lci5hZGRDaGlsZChiZzIpO1xuXG5cbmxldCBkaXNwbGFjZW1lbnRTcHJpdGUgPSBQSVhJLlNwcml0ZS5mcm9tSW1hZ2UoJ2ltZy9jbG91ZHMuanBnJyk7XG5cbmxldCBkaXNwbGFjZW1lbnRGaWx0ZXIgPSBuZXcgUElYSS5maWx0ZXJzLkRpc3BsYWNlbWVudEZpbHRlcihcblx0ZGlzcGxhY2VtZW50U3ByaXRlXG4pO1xuXG5kaXNwbGFjZW1lbnRTcHJpdGUueCA9IC01MDtcblxuZGlzcGxhY2VtZW50RmlsdGVyLnNjYWxlLnNldCgwKTtcblxuYXBwLnN0YWdlLmFkZENoaWxkKGRpc3BsYWNlbWVudFNwcml0ZSk7XG5cbmNvbnRhaW5lci5maWx0ZXJzID0gW2Rpc3BsYWNlbWVudEZpbHRlcl07XG5cblxubGV0IHByb2plY3RzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmFib3V0X19wcm9qZWN0Jyk7XG5sZXQgcHJldiA9IDA7XG5cbmZ1bmN0aW9uIGRpc3RvcnRpb24oZSkge1xuXHRsZXQgbmFtZSA9IGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnY2xhc3MnKTtcblx0bGV0IGN1cnJlbnQgPSBuYW1lLnNwbGl0KCctJylbMV07XG5cblx0aWYgKHByZXYgPT0gY3VycmVudCkge1xuXHRcdHJldHVyblxuXHR9XG5cblx0bGV0IHRsID0gbmV3IFRpbWVsaW5lTWF4KCk7XG5cblx0dGwudG8oZGlzcGxhY2VtZW50RmlsdGVyLnNjYWxlLCAwLjUsIHsgeDogLTMwLCB5OiAtMzB9KVxuXHR0bC5mcm9tVG8oZGlzcGxhY2VtZW50U3ByaXRlLCAxLjAsIHsgeDogLTUwfSwge3g6IDUwfSwgMClcblxuXHR0bC50byhiZ0FycltjdXJyZW50XSwgMSwge2FscGhhOiAxfSwgMClcblx0dGwudG8oYmdBcnJbcHJldl0sIDEsIHthbHBoYTogMH0sIDApXG5cblx0dGwudG8oZGlzcGxhY2VtZW50RmlsdGVyLnNjYWxlLCAxLCB7IHg6IDAsIHk6IDB9LCAnPS0wLjUnKVxuXG5cdHByZXYgPSBjdXJyZW50O1xufTtcblxuZm9yIChsZXQgaSA9IDA7IGkgPCBwcm9qZWN0cy5sZW5ndGg7IGkrPTEpIHtcblx0cHJvamVjdHNbaV0uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJyAsIGRpc3RvcnRpb24pXG59XG5cblxuIl19
