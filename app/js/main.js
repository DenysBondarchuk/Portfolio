window.onload = function() {
	let loader = document.querySelector('.loader');
	loader.classList.add('hide');
};

document.addEventListener("DOMContentLoaded", function() {

	//=include ../components/contacts/contacts.js

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

	//=include ../components/footer/footer.js
	//=include ../components/about/about.js
	//=include ../components/projects/projects.js


});

console.log("%c+", 'font-size: 1px; padding: 64px 80px; line-height: 0; background: url("https://s8.hostingkartinok.com/uploads/images/2019/05/164c4042f9610feb6f9692df0220ae8b.jpg"); background-repeat: no-repeat; background-size: contain; color: transparent;');


