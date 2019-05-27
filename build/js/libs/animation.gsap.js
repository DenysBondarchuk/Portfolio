/*!
 * ScrollMagic v2.0.5 (2015-04-29)
 * The javascript library for magical scroll interactions.
 * (c) 2015 Jan Paepke (@janpaepke)
 * Project Website: http://scrollmagic.io
 * 
 * @version 2.0.5
 * @license Dual licensed under MIT license and GPL.
 * @author Jan Paepke - e-mail@janpaepke.de
 *
 * @file ScrollMagic GSAP Animation Plugin.
 *
 * requires: GSAP ~1.14
 * Powered by the Greensock Animation Platform (GSAP): http://www.greensock.com/js
 * Greensock License info at http://www.greensock.com/licensing/
 */
/**
 * This plugin is meant to be used in conjunction with the Greensock Animation Plattform.  
 * It offers an easy API to trigger Tweens or synchronize them to the scrollbar movement.
 *
 * Both the `lite` and the `max` versions of the GSAP library are supported.  
 * The most basic requirement is `TweenLite`.
 * 
 * To have access to this extension, please include `plugins/animation.gsap.js`.
 * @requires {@link http://greensock.com/gsap|GSAP ~1.14.x}
 * @mixin animation.GSAP
 */
(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['ScrollMagic', 'TweenMax', 'TimelineMax'], factory);
	} else if (typeof exports === 'object') {
		// CommonJS
		// Loads whole gsap package onto global scope.
		require('gsap');
		factory(require('scrollmagic'), TweenMax, TimelineMax);
	} else {
		// Browser globals
		factory(root.ScrollMagic || (root.jQuery && root.jQuery.ScrollMagic), root.TweenMax || root.TweenLite, root.TimelineMax || root.TimelineLite);
	}
}(this, function (ScrollMagic, Tween, Timeline) {
	"use strict";
	var NAMESPACE = "animation.gsap";

	var
	console = window.console || {},
		err = Function.prototype.bind.call(console.error || console.log ||
		function () {}, console);
	if (!ScrollMagic) {
		err("(" + NAMESPACE + ") -> ERROR: The ScrollMagic main module could not be found. Please make sure it's loaded before this plugin or use an asynchronous loader like requirejs.");
	}
	if (!Tween) {
		err("(" + NAMESPACE + ") -> ERROR: TweenLite or TweenMax could not be found. Please make sure GSAP is loaded before ScrollMagic or use an asynchronous loader like requirejs.");
	}

/*
	 * ----------------------------------------------------------------
	 * Extensions for Scene
	 * ----------------------------------------------------------------
	 */
	/**
	 * Every instance of ScrollMagic.Scene now accepts an additional option.  
	 * See {@link ScrollMagic.Scene} for a complete list of the standard options.
	 * @memberof! animation.GSAP#
	 * @method new ScrollMagic.Scene(options)
	 * @example
	 * var scene = new ScrollMagic.Scene({tweenChanges: true});
	 *
	 * @param {object} [options] - Options for the Scene. The options can be updated at any time.
	 * @param {boolean} [options.tweenChanges=false] - Tweens Animation to the progress target instead of setting it.  
	 Does not affect animations where duration is `0`.
	 */
	/**
	 * **Get** or **Set** the tweenChanges option value.  
	 * This only affects scenes with a duration. If `tweenChanges` is `true`, the progress update when scrolling will not be immediate, but instead the animation will smoothly animate to the target state.  
	 * For a better understanding, try enabling and disabling this option in the [Scene Manipulation Example](../examples/basic/scene_manipulation.html).
	 * @memberof! animation.GSAP#
	 * @method Scene.tweenChanges
	 * 
	 * @example
	 * // get the current tweenChanges option
	 * var tweenChanges = scene.tweenChanges();
	 *
	 * // set new tweenChanges option
	 * scene.tweenChanges(true);
	 *
	 * @fires {@link Scene.change}, when used as setter
	 * @param {boolean} [newTweenChanges] - The new tweenChanges setting of the scene.
	 * @returns {boolean} `get` -  Current tweenChanges option value.
	 * @returns {Scene} `set` -  Parent object for chaining.
	 */
	// add option (TODO: DOC (private for dev))
	ScrollMagic.Scene.addOption("tweenChanges", // name
	false, // default


	function (val) { // validation callback
		return !!val;
	});
	// extend scene
	ScrollMagic.Scene.extend(function () {
		var Scene = this,
			_tween;

		var log = function () {
			if (Scene._log) { // not available, when main source minified
				Array.prototype.splice.call(arguments, 1, 0, "(" + NAMESPACE + ")", "->");
				Scene._log.apply(this, arguments);
			}
		};

		// set listeners
		Scene.on("progress.plugin_gsap", function () {
			updateTweenProgress();
		});
		Scene.on("destroy.plugin_gsap", function (e) {
			Scene.removeTween(e.reset);
		});

		/**
		 * Update the tween progress to current position.
		 * @private
		 */
		var updateTweenProgress = function () {
			if (_tween) {
				var
				progress = Scene.progress(),
					state = Scene.state();
				if (_tween.repeat && _tween.repeat() === -1) {
					// infinite loop, so not in relation to progress
					if (state === 'DURING' && _tween.paused()) {
						_tween.play();
					} else if (state !== 'DURING' && !_tween.paused()) {
						_tween.pause();
					}
				} else if (progress != _tween.progress()) { // do we even need to update the progress?
					// no infinite loop - so should we just play or go to a specific point in time?
					if (Scene.duration() === 0) {
						// play the animation
						if (progress > 0) { // play from 0 to 1
							_tween.play();
						} else { // play from 1 to 0
							_tween.reverse();
						}
					} else {
						// go to a specific point in time
						if (Scene.tweenChanges() && _tween.tweenTo) {
							// go smooth
							_tween.tweenTo(progress * _tween.duration());
						} else {
							// just hard set it
							_tween.progress(progress).pause();
						}
					}
				}
			}
		};

		/**
		 * Add a tween to the scene.  
		 * If you want to add multiple tweens, add them into a GSAP Timeline object and supply it instead (see example below).  
		 * 
		 * If the scene has a duration, the tween's duration will be projected to the scroll distance of the scene, meaning its progress will be synced to scrollbar movement.  
		 * For a scene with a duration of `0`, the tween will be triggered when scrolling forward past the scene's trigger position and reversed, when scrolling back.  
		 * To gain better understanding, check out the [Simple Tweening example](../examples/basic/simple_tweening.html).
		 *
		 * Instead of supplying a tween this method can also be used as a shorthand for `TweenMax.to()` (see example below).
		 * @memberof! animation.GSAP#
		 *
		 * @example
		 * // add a single tween directly
		 * scene.setTween(TweenMax.to("obj"), 1, {x: 100});
		 *
		 * // add a single tween via variable
		 * var tween = TweenMax.to("obj"), 1, {x: 100};
		 * scene.setTween(tween);
		 *
		 * // add multiple tweens, wrapped in a timeline.
		 * var timeline = new TimelineMax();
		 * var tween1 = TweenMax.from("obj1", 1, {x: 100});
		 * var tween2 = TweenMax.to("obj2", 1, {y: 100});
		 * timeline
		 *		.add(tween1)
		 *		.add(tween2);
		 * scene.addTween(timeline);
		 *
		 * // short hand to add a TweenMax.to() tween
		 * scene.setTween("obj3", 0.5, {y: 100});
		 *
		 * // short hand to add a TweenMax.to() tween for 1 second
		 * // this is useful, when the scene has a duration and the tween duration isn't important anyway
		 * scene.setTween("obj3", {y: 100});
		 *
		 * @param {(object|string)} TweenObject - A TweenMax, TweenLite, TimelineMax or TimelineLite object that should be animated in the scene. Can also be a Dom Element or Selector, when using direct tween definition (see examples).
		 * @param {(number|object)} duration - A duration for the tween, or tween parameters. If an object containing parameters are supplied, a default duration of 1 will be used.
		 * @param {object} params - The parameters for the tween
		 * @returns {Scene} Parent object for chaining.
		 */
		Scene.setTween = function (TweenObject, duration, params) {
			var newTween;
			if (arguments.length > 1) {
				if (arguments.length < 3) {
					params = duration;
					duration = 1;
				}
				TweenObject = Tween.to(TweenObject, duration, params);
			}
			try {
				// wrap Tween into a Timeline Object if available to include delay and repeats in the duration and standardize methods.
				if (Timeline) {
					newTween = new Timeline({
						smoothChildTiming: true
					}).add(TweenObject);
				} else {
					newTween = TweenObject;
				}
				newTween.pause();
			} catch (e) {
				log(1, "ERROR calling method 'setTween()': Supplied argument is not a valid TweenObject");
				return Scene;
			}
			if (_tween) { // kill old tween?
				Scene.removeTween();
			}
			_tween = newTween;

			// some properties need to be transferred it to the wrapper, otherwise they would get lost.
			if (TweenObject.repeat && TweenObject.repeat() === -1) { // TweenMax or TimelineMax Object?
				_tween.repeat(-1);
				_tween.yoyo(TweenObject.yoyo());
			}
			// Some tween validations and debugging helpers
			if (Scene.tweenChanges() && !_tween.tweenTo) {
				log(2, "WARNING: tweenChanges will only work if the TimelineMax object is available for ScrollMagic.");
			}

			// check if there are position tweens defined for the trigger and warn about it :)
			if (_tween && Scene.controller() && Scene.triggerElement() && Scene.loglevel() >= 2) { // controller is needed to know scroll direction.
				var
				triggerTweens = Tween.getTweensOf(Scene.triggerElement()),
					vertical = Scene.controller().info("vertical");
				triggerTweens.forEach(function (value, index) {
					var
					tweenvars = value.vars.css || value.vars,
						condition = vertical ? (tweenvars.top !== undefined || tweenvars.bottom !== undefined) : (tweenvars.left !== undefined || tweenvars.right !== undefined);
					if (condition) {
						log(2, "WARNING: Tweening the position of the trigger element affects the scene timing and should be avoided!");
						return false;
					}
				});
			}

			// warn about tween overwrites, when an element is tweened multiple times
			if (parseFloat(TweenLite.version) >= 1.14) { // onOverwrite only present since GSAP v1.14.0
				var
				list = _tween.getChildren ? _tween.getChildren(true, true, false) : [_tween],
					// get all nested tween objects
					newCallback = function () {
						log(2, "WARNING: tween was overwritten by another. To learn how to avoid this issue see here: https://github.com/janpaepke/ScrollMagic/wiki/WARNING:-tween-was-overwritten-by-another");
					};
				for (var i = 0, thisTween, oldCallback; i < list.length; i++) { /*jshint loopfunc: true */
					thisTween = list[i];
					if (oldCallback !== newCallback) { // if tweens is added more than once
						oldCallback = thisTween.vars.onOverwrite;
						thisTween.vars.onOverwrite = function () {
							if (oldCallback) {
								oldCallback.apply(this, arguments);
							}
							newCallback.apply(this, arguments);
						};
					}
				}
			}
			log(3, "added tween");

			updateTweenProgress();
			return Scene;
		};

		/**
		 * Remove the tween from the scene.  
		 * This will terminate the control of the Scene over the tween.
		 *
		 * Using the reset option you can decide if the tween should remain in the current state or be rewound to set the target elements back to the state they were in before the tween was added to the scene.
		 * @memberof! animation.GSAP#
		 *
		 * @example
		 * // remove the tween from the scene without resetting it
		 * scene.removeTween();
		 *
		 * // remove the tween from the scene and reset it to initial position
		 * scene.removeTween(true);
		 *
		 * @param {boolean} [reset=false] - If `true` the tween will be reset to its initial values.
		 * @returns {Scene} Parent object for chaining.
		 */
		Scene.removeTween = function (reset) {
			if (_tween) {
				if (reset) {
					_tween.progress(0).pause();
				}
				_tween.kill();
				_tween = undefined;
				log(3, "removed tween (reset: " + (reset ? "true" : "false") + ")");
			}
			return Scene;
		};

	});
}));
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJsaWJzL2FuaW1hdGlvbi5nc2FwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIVxyXG4gKiBTY3JvbGxNYWdpYyB2Mi4wLjUgKDIwMTUtMDQtMjkpXHJcbiAqIFRoZSBqYXZhc2NyaXB0IGxpYnJhcnkgZm9yIG1hZ2ljYWwgc2Nyb2xsIGludGVyYWN0aW9ucy5cclxuICogKGMpIDIwMTUgSmFuIFBhZXBrZSAoQGphbnBhZXBrZSlcclxuICogUHJvamVjdCBXZWJzaXRlOiBodHRwOi8vc2Nyb2xsbWFnaWMuaW9cclxuICogXHJcbiAqIEB2ZXJzaW9uIDIuMC41XHJcbiAqIEBsaWNlbnNlIER1YWwgbGljZW5zZWQgdW5kZXIgTUlUIGxpY2Vuc2UgYW5kIEdQTC5cclxuICogQGF1dGhvciBKYW4gUGFlcGtlIC0gZS1tYWlsQGphbnBhZXBrZS5kZVxyXG4gKlxyXG4gKiBAZmlsZSBTY3JvbGxNYWdpYyBHU0FQIEFuaW1hdGlvbiBQbHVnaW4uXHJcbiAqXHJcbiAqIHJlcXVpcmVzOiBHU0FQIH4xLjE0XHJcbiAqIFBvd2VyZWQgYnkgdGhlIEdyZWVuc29jayBBbmltYXRpb24gUGxhdGZvcm0gKEdTQVApOiBodHRwOi8vd3d3LmdyZWVuc29jay5jb20vanNcclxuICogR3JlZW5zb2NrIExpY2Vuc2UgaW5mbyBhdCBodHRwOi8vd3d3LmdyZWVuc29jay5jb20vbGljZW5zaW5nL1xyXG4gKi9cclxuLyoqXHJcbiAqIFRoaXMgcGx1Z2luIGlzIG1lYW50IHRvIGJlIHVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCB0aGUgR3JlZW5zb2NrIEFuaW1hdGlvbiBQbGF0dGZvcm0uICBcclxuICogSXQgb2ZmZXJzIGFuIGVhc3kgQVBJIHRvIHRyaWdnZXIgVHdlZW5zIG9yIHN5bmNocm9uaXplIHRoZW0gdG8gdGhlIHNjcm9sbGJhciBtb3ZlbWVudC5cclxuICpcclxuICogQm90aCB0aGUgYGxpdGVgIGFuZCB0aGUgYG1heGAgdmVyc2lvbnMgb2YgdGhlIEdTQVAgbGlicmFyeSBhcmUgc3VwcG9ydGVkLiAgXHJcbiAqIFRoZSBtb3N0IGJhc2ljIHJlcXVpcmVtZW50IGlzIGBUd2VlbkxpdGVgLlxyXG4gKiBcclxuICogVG8gaGF2ZSBhY2Nlc3MgdG8gdGhpcyBleHRlbnNpb24sIHBsZWFzZSBpbmNsdWRlIGBwbHVnaW5zL2FuaW1hdGlvbi5nc2FwLmpzYC5cclxuICogQHJlcXVpcmVzIHtAbGluayBodHRwOi8vZ3JlZW5zb2NrLmNvbS9nc2FwfEdTQVAgfjEuMTQueH1cclxuICogQG1peGluIGFuaW1hdGlvbi5HU0FQXHJcbiAqL1xyXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcclxuXHRpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcblx0XHQvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXHJcblx0XHRkZWZpbmUoWydTY3JvbGxNYWdpYycsICdUd2Vlbk1heCcsICdUaW1lbGluZU1heCddLCBmYWN0b3J5KTtcclxuXHR9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xyXG5cdFx0Ly8gQ29tbW9uSlNcclxuXHRcdC8vIExvYWRzIHdob2xlIGdzYXAgcGFja2FnZSBvbnRvIGdsb2JhbCBzY29wZS5cclxuXHRcdHJlcXVpcmUoJ2dzYXAnKTtcclxuXHRcdGZhY3RvcnkocmVxdWlyZSgnc2Nyb2xsbWFnaWMnKSwgVHdlZW5NYXgsIFRpbWVsaW5lTWF4KTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0Ly8gQnJvd3NlciBnbG9iYWxzXHJcblx0XHRmYWN0b3J5KHJvb3QuU2Nyb2xsTWFnaWMgfHwgKHJvb3QualF1ZXJ5ICYmIHJvb3QualF1ZXJ5LlNjcm9sbE1hZ2ljKSwgcm9vdC5Ud2Vlbk1heCB8fCByb290LlR3ZWVuTGl0ZSwgcm9vdC5UaW1lbGluZU1heCB8fCByb290LlRpbWVsaW5lTGl0ZSk7XHJcblx0fVxyXG59KHRoaXMsIGZ1bmN0aW9uIChTY3JvbGxNYWdpYywgVHdlZW4sIFRpbWVsaW5lKSB7XHJcblx0XCJ1c2Ugc3RyaWN0XCI7XHJcblx0dmFyIE5BTUVTUEFDRSA9IFwiYW5pbWF0aW9uLmdzYXBcIjtcclxuXHJcblx0dmFyXHJcblx0Y29uc29sZSA9IHdpbmRvdy5jb25zb2xlIHx8IHt9LFxyXG5cdFx0ZXJyID0gRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQuY2FsbChjb25zb2xlLmVycm9yIHx8IGNvbnNvbGUubG9nIHx8XHJcblx0XHRmdW5jdGlvbiAoKSB7fSwgY29uc29sZSk7XHJcblx0aWYgKCFTY3JvbGxNYWdpYykge1xyXG5cdFx0ZXJyKFwiKFwiICsgTkFNRVNQQUNFICsgXCIpIC0+IEVSUk9SOiBUaGUgU2Nyb2xsTWFnaWMgbWFpbiBtb2R1bGUgY291bGQgbm90IGJlIGZvdW5kLiBQbGVhc2UgbWFrZSBzdXJlIGl0J3MgbG9hZGVkIGJlZm9yZSB0aGlzIHBsdWdpbiBvciB1c2UgYW4gYXN5bmNocm9ub3VzIGxvYWRlciBsaWtlIHJlcXVpcmVqcy5cIik7XHJcblx0fVxyXG5cdGlmICghVHdlZW4pIHtcclxuXHRcdGVycihcIihcIiArIE5BTUVTUEFDRSArIFwiKSAtPiBFUlJPUjogVHdlZW5MaXRlIG9yIFR3ZWVuTWF4IGNvdWxkIG5vdCBiZSBmb3VuZC4gUGxlYXNlIG1ha2Ugc3VyZSBHU0FQIGlzIGxvYWRlZCBiZWZvcmUgU2Nyb2xsTWFnaWMgb3IgdXNlIGFuIGFzeW5jaHJvbm91cyBsb2FkZXIgbGlrZSByZXF1aXJlanMuXCIpO1xyXG5cdH1cclxuXHJcbi8qXHJcblx0ICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdCAqIEV4dGVuc2lvbnMgZm9yIFNjZW5lXHJcblx0ICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdCAqL1xyXG5cdC8qKlxyXG5cdCAqIEV2ZXJ5IGluc3RhbmNlIG9mIFNjcm9sbE1hZ2ljLlNjZW5lIG5vdyBhY2NlcHRzIGFuIGFkZGl0aW9uYWwgb3B0aW9uLiAgXHJcblx0ICogU2VlIHtAbGluayBTY3JvbGxNYWdpYy5TY2VuZX0gZm9yIGEgY29tcGxldGUgbGlzdCBvZiB0aGUgc3RhbmRhcmQgb3B0aW9ucy5cclxuXHQgKiBAbWVtYmVyb2YhIGFuaW1hdGlvbi5HU0FQI1xyXG5cdCAqIEBtZXRob2QgbmV3IFNjcm9sbE1hZ2ljLlNjZW5lKG9wdGlvbnMpXHJcblx0ICogQGV4YW1wbGVcclxuXHQgKiB2YXIgc2NlbmUgPSBuZXcgU2Nyb2xsTWFnaWMuU2NlbmUoe3R3ZWVuQ2hhbmdlczogdHJ1ZX0pO1xyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXSAtIE9wdGlvbnMgZm9yIHRoZSBTY2VuZS4gVGhlIG9wdGlvbnMgY2FuIGJlIHVwZGF0ZWQgYXQgYW55IHRpbWUuXHJcblx0ICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50d2VlbkNoYW5nZXM9ZmFsc2VdIC0gVHdlZW5zIEFuaW1hdGlvbiB0byB0aGUgcHJvZ3Jlc3MgdGFyZ2V0IGluc3RlYWQgb2Ygc2V0dGluZyBpdC4gIFxyXG5cdCBEb2VzIG5vdCBhZmZlY3QgYW5pbWF0aW9ucyB3aGVyZSBkdXJhdGlvbiBpcyBgMGAuXHJcblx0ICovXHJcblx0LyoqXHJcblx0ICogKipHZXQqKiBvciAqKlNldCoqIHRoZSB0d2VlbkNoYW5nZXMgb3B0aW9uIHZhbHVlLiAgXHJcblx0ICogVGhpcyBvbmx5IGFmZmVjdHMgc2NlbmVzIHdpdGggYSBkdXJhdGlvbi4gSWYgYHR3ZWVuQ2hhbmdlc2AgaXMgYHRydWVgLCB0aGUgcHJvZ3Jlc3MgdXBkYXRlIHdoZW4gc2Nyb2xsaW5nIHdpbGwgbm90IGJlIGltbWVkaWF0ZSwgYnV0IGluc3RlYWQgdGhlIGFuaW1hdGlvbiB3aWxsIHNtb290aGx5IGFuaW1hdGUgdG8gdGhlIHRhcmdldCBzdGF0ZS4gIFxyXG5cdCAqIEZvciBhIGJldHRlciB1bmRlcnN0YW5kaW5nLCB0cnkgZW5hYmxpbmcgYW5kIGRpc2FibGluZyB0aGlzIG9wdGlvbiBpbiB0aGUgW1NjZW5lIE1hbmlwdWxhdGlvbiBFeGFtcGxlXSguLi9leGFtcGxlcy9iYXNpYy9zY2VuZV9tYW5pcHVsYXRpb24uaHRtbCkuXHJcblx0ICogQG1lbWJlcm9mISBhbmltYXRpb24uR1NBUCNcclxuXHQgKiBAbWV0aG9kIFNjZW5lLnR3ZWVuQ2hhbmdlc1xyXG5cdCAqIFxyXG5cdCAqIEBleGFtcGxlXHJcblx0ICogLy8gZ2V0IHRoZSBjdXJyZW50IHR3ZWVuQ2hhbmdlcyBvcHRpb25cclxuXHQgKiB2YXIgdHdlZW5DaGFuZ2VzID0gc2NlbmUudHdlZW5DaGFuZ2VzKCk7XHJcblx0ICpcclxuXHQgKiAvLyBzZXQgbmV3IHR3ZWVuQ2hhbmdlcyBvcHRpb25cclxuXHQgKiBzY2VuZS50d2VlbkNoYW5nZXModHJ1ZSk7XHJcblx0ICpcclxuXHQgKiBAZmlyZXMge0BsaW5rIFNjZW5lLmNoYW5nZX0sIHdoZW4gdXNlZCBhcyBzZXR0ZXJcclxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IFtuZXdUd2VlbkNoYW5nZXNdIC0gVGhlIG5ldyB0d2VlbkNoYW5nZXMgc2V0dGluZyBvZiB0aGUgc2NlbmUuXHJcblx0ICogQHJldHVybnMge2Jvb2xlYW59IGBnZXRgIC0gIEN1cnJlbnQgdHdlZW5DaGFuZ2VzIG9wdGlvbiB2YWx1ZS5cclxuXHQgKiBAcmV0dXJucyB7U2NlbmV9IGBzZXRgIC0gIFBhcmVudCBvYmplY3QgZm9yIGNoYWluaW5nLlxyXG5cdCAqL1xyXG5cdC8vIGFkZCBvcHRpb24gKFRPRE86IERPQyAocHJpdmF0ZSBmb3IgZGV2KSlcclxuXHRTY3JvbGxNYWdpYy5TY2VuZS5hZGRPcHRpb24oXCJ0d2VlbkNoYW5nZXNcIiwgLy8gbmFtZVxyXG5cdGZhbHNlLCAvLyBkZWZhdWx0XHJcblxyXG5cclxuXHRmdW5jdGlvbiAodmFsKSB7IC8vIHZhbGlkYXRpb24gY2FsbGJhY2tcclxuXHRcdHJldHVybiAhIXZhbDtcclxuXHR9KTtcclxuXHQvLyBleHRlbmQgc2NlbmVcclxuXHRTY3JvbGxNYWdpYy5TY2VuZS5leHRlbmQoZnVuY3Rpb24gKCkge1xyXG5cdFx0dmFyIFNjZW5lID0gdGhpcyxcclxuXHRcdFx0X3R3ZWVuO1xyXG5cclxuXHRcdHZhciBsb2cgPSBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdGlmIChTY2VuZS5fbG9nKSB7IC8vIG5vdCBhdmFpbGFibGUsIHdoZW4gbWFpbiBzb3VyY2UgbWluaWZpZWRcclxuXHRcdFx0XHRBcnJheS5wcm90b3R5cGUuc3BsaWNlLmNhbGwoYXJndW1lbnRzLCAxLCAwLCBcIihcIiArIE5BTUVTUEFDRSArIFwiKVwiLCBcIi0+XCIpO1xyXG5cdFx0XHRcdFNjZW5lLl9sb2cuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHJcblx0XHQvLyBzZXQgbGlzdGVuZXJzXHJcblx0XHRTY2VuZS5vbihcInByb2dyZXNzLnBsdWdpbl9nc2FwXCIsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0dXBkYXRlVHdlZW5Qcm9ncmVzcygpO1xyXG5cdFx0fSk7XHJcblx0XHRTY2VuZS5vbihcImRlc3Ryb3kucGx1Z2luX2dzYXBcIiwgZnVuY3Rpb24gKGUpIHtcclxuXHRcdFx0U2NlbmUucmVtb3ZlVHdlZW4oZS5yZXNldCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFVwZGF0ZSB0aGUgdHdlZW4gcHJvZ3Jlc3MgdG8gY3VycmVudCBwb3NpdGlvbi5cclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdHZhciB1cGRhdGVUd2VlblByb2dyZXNzID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRpZiAoX3R3ZWVuKSB7XHJcblx0XHRcdFx0dmFyXHJcblx0XHRcdFx0cHJvZ3Jlc3MgPSBTY2VuZS5wcm9ncmVzcygpLFxyXG5cdFx0XHRcdFx0c3RhdGUgPSBTY2VuZS5zdGF0ZSgpO1xyXG5cdFx0XHRcdGlmIChfdHdlZW4ucmVwZWF0ICYmIF90d2Vlbi5yZXBlYXQoKSA9PT0gLTEpIHtcclxuXHRcdFx0XHRcdC8vIGluZmluaXRlIGxvb3AsIHNvIG5vdCBpbiByZWxhdGlvbiB0byBwcm9ncmVzc1xyXG5cdFx0XHRcdFx0aWYgKHN0YXRlID09PSAnRFVSSU5HJyAmJiBfdHdlZW4ucGF1c2VkKCkpIHtcclxuXHRcdFx0XHRcdFx0X3R3ZWVuLnBsYXkoKTtcclxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoc3RhdGUgIT09ICdEVVJJTkcnICYmICFfdHdlZW4ucGF1c2VkKCkpIHtcclxuXHRcdFx0XHRcdFx0X3R3ZWVuLnBhdXNlKCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSBlbHNlIGlmIChwcm9ncmVzcyAhPSBfdHdlZW4ucHJvZ3Jlc3MoKSkgeyAvLyBkbyB3ZSBldmVuIG5lZWQgdG8gdXBkYXRlIHRoZSBwcm9ncmVzcz9cclxuXHRcdFx0XHRcdC8vIG5vIGluZmluaXRlIGxvb3AgLSBzbyBzaG91bGQgd2UganVzdCBwbGF5IG9yIGdvIHRvIGEgc3BlY2lmaWMgcG9pbnQgaW4gdGltZT9cclxuXHRcdFx0XHRcdGlmIChTY2VuZS5kdXJhdGlvbigpID09PSAwKSB7XHJcblx0XHRcdFx0XHRcdC8vIHBsYXkgdGhlIGFuaW1hdGlvblxyXG5cdFx0XHRcdFx0XHRpZiAocHJvZ3Jlc3MgPiAwKSB7IC8vIHBsYXkgZnJvbSAwIHRvIDFcclxuXHRcdFx0XHRcdFx0XHRfdHdlZW4ucGxheSgpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2UgeyAvLyBwbGF5IGZyb20gMSB0byAwXHJcblx0XHRcdFx0XHRcdFx0X3R3ZWVuLnJldmVyc2UoKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0Ly8gZ28gdG8gYSBzcGVjaWZpYyBwb2ludCBpbiB0aW1lXHJcblx0XHRcdFx0XHRcdGlmIChTY2VuZS50d2VlbkNoYW5nZXMoKSAmJiBfdHdlZW4udHdlZW5Ubykge1xyXG5cdFx0XHRcdFx0XHRcdC8vIGdvIHNtb290aFxyXG5cdFx0XHRcdFx0XHRcdF90d2Vlbi50d2VlblRvKHByb2dyZXNzICogX3R3ZWVuLmR1cmF0aW9uKCkpO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdC8vIGp1c3QgaGFyZCBzZXQgaXRcclxuXHRcdFx0XHRcdFx0XHRfdHdlZW4ucHJvZ3Jlc3MocHJvZ3Jlc3MpLnBhdXNlKCk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBBZGQgYSB0d2VlbiB0byB0aGUgc2NlbmUuICBcclxuXHRcdCAqIElmIHlvdSB3YW50IHRvIGFkZCBtdWx0aXBsZSB0d2VlbnMsIGFkZCB0aGVtIGludG8gYSBHU0FQIFRpbWVsaW5lIG9iamVjdCBhbmQgc3VwcGx5IGl0IGluc3RlYWQgKHNlZSBleGFtcGxlIGJlbG93KS4gIFxyXG5cdFx0ICogXHJcblx0XHQgKiBJZiB0aGUgc2NlbmUgaGFzIGEgZHVyYXRpb24sIHRoZSB0d2VlbidzIGR1cmF0aW9uIHdpbGwgYmUgcHJvamVjdGVkIHRvIHRoZSBzY3JvbGwgZGlzdGFuY2Ugb2YgdGhlIHNjZW5lLCBtZWFuaW5nIGl0cyBwcm9ncmVzcyB3aWxsIGJlIHN5bmNlZCB0byBzY3JvbGxiYXIgbW92ZW1lbnQuICBcclxuXHRcdCAqIEZvciBhIHNjZW5lIHdpdGggYSBkdXJhdGlvbiBvZiBgMGAsIHRoZSB0d2VlbiB3aWxsIGJlIHRyaWdnZXJlZCB3aGVuIHNjcm9sbGluZyBmb3J3YXJkIHBhc3QgdGhlIHNjZW5lJ3MgdHJpZ2dlciBwb3NpdGlvbiBhbmQgcmV2ZXJzZWQsIHdoZW4gc2Nyb2xsaW5nIGJhY2suICBcclxuXHRcdCAqIFRvIGdhaW4gYmV0dGVyIHVuZGVyc3RhbmRpbmcsIGNoZWNrIG91dCB0aGUgW1NpbXBsZSBUd2VlbmluZyBleGFtcGxlXSguLi9leGFtcGxlcy9iYXNpYy9zaW1wbGVfdHdlZW5pbmcuaHRtbCkuXHJcblx0XHQgKlxyXG5cdFx0ICogSW5zdGVhZCBvZiBzdXBwbHlpbmcgYSB0d2VlbiB0aGlzIG1ldGhvZCBjYW4gYWxzbyBiZSB1c2VkIGFzIGEgc2hvcnRoYW5kIGZvciBgVHdlZW5NYXgudG8oKWAgKHNlZSBleGFtcGxlIGJlbG93KS5cclxuXHRcdCAqIEBtZW1iZXJvZiEgYW5pbWF0aW9uLkdTQVAjXHJcblx0XHQgKlxyXG5cdFx0ICogQGV4YW1wbGVcclxuXHRcdCAqIC8vIGFkZCBhIHNpbmdsZSB0d2VlbiBkaXJlY3RseVxyXG5cdFx0ICogc2NlbmUuc2V0VHdlZW4oVHdlZW5NYXgudG8oXCJvYmpcIiksIDEsIHt4OiAxMDB9KTtcclxuXHRcdCAqXHJcblx0XHQgKiAvLyBhZGQgYSBzaW5nbGUgdHdlZW4gdmlhIHZhcmlhYmxlXHJcblx0XHQgKiB2YXIgdHdlZW4gPSBUd2Vlbk1heC50byhcIm9ialwiKSwgMSwge3g6IDEwMH07XHJcblx0XHQgKiBzY2VuZS5zZXRUd2Vlbih0d2Vlbik7XHJcblx0XHQgKlxyXG5cdFx0ICogLy8gYWRkIG11bHRpcGxlIHR3ZWVucywgd3JhcHBlZCBpbiBhIHRpbWVsaW5lLlxyXG5cdFx0ICogdmFyIHRpbWVsaW5lID0gbmV3IFRpbWVsaW5lTWF4KCk7XHJcblx0XHQgKiB2YXIgdHdlZW4xID0gVHdlZW5NYXguZnJvbShcIm9iajFcIiwgMSwge3g6IDEwMH0pO1xyXG5cdFx0ICogdmFyIHR3ZWVuMiA9IFR3ZWVuTWF4LnRvKFwib2JqMlwiLCAxLCB7eTogMTAwfSk7XHJcblx0XHQgKiB0aW1lbGluZVxyXG5cdFx0ICpcdFx0LmFkZCh0d2VlbjEpXHJcblx0XHQgKlx0XHQuYWRkKHR3ZWVuMik7XHJcblx0XHQgKiBzY2VuZS5hZGRUd2Vlbih0aW1lbGluZSk7XHJcblx0XHQgKlxyXG5cdFx0ICogLy8gc2hvcnQgaGFuZCB0byBhZGQgYSBUd2Vlbk1heC50bygpIHR3ZWVuXHJcblx0XHQgKiBzY2VuZS5zZXRUd2VlbihcIm9iajNcIiwgMC41LCB7eTogMTAwfSk7XHJcblx0XHQgKlxyXG5cdFx0ICogLy8gc2hvcnQgaGFuZCB0byBhZGQgYSBUd2Vlbk1heC50bygpIHR3ZWVuIGZvciAxIHNlY29uZFxyXG5cdFx0ICogLy8gdGhpcyBpcyB1c2VmdWwsIHdoZW4gdGhlIHNjZW5lIGhhcyBhIGR1cmF0aW9uIGFuZCB0aGUgdHdlZW4gZHVyYXRpb24gaXNuJ3QgaW1wb3J0YW50IGFueXdheVxyXG5cdFx0ICogc2NlbmUuc2V0VHdlZW4oXCJvYmozXCIsIHt5OiAxMDB9KTtcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0geyhvYmplY3R8c3RyaW5nKX0gVHdlZW5PYmplY3QgLSBBIFR3ZWVuTWF4LCBUd2VlbkxpdGUsIFRpbWVsaW5lTWF4IG9yIFRpbWVsaW5lTGl0ZSBvYmplY3QgdGhhdCBzaG91bGQgYmUgYW5pbWF0ZWQgaW4gdGhlIHNjZW5lLiBDYW4gYWxzbyBiZSBhIERvbSBFbGVtZW50IG9yIFNlbGVjdG9yLCB3aGVuIHVzaW5nIGRpcmVjdCB0d2VlbiBkZWZpbml0aW9uIChzZWUgZXhhbXBsZXMpLlxyXG5cdFx0ICogQHBhcmFtIHsobnVtYmVyfG9iamVjdCl9IGR1cmF0aW9uIC0gQSBkdXJhdGlvbiBmb3IgdGhlIHR3ZWVuLCBvciB0d2VlbiBwYXJhbWV0ZXJzLiBJZiBhbiBvYmplY3QgY29udGFpbmluZyBwYXJhbWV0ZXJzIGFyZSBzdXBwbGllZCwgYSBkZWZhdWx0IGR1cmF0aW9uIG9mIDEgd2lsbCBiZSB1c2VkLlxyXG5cdFx0ICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyAtIFRoZSBwYXJhbWV0ZXJzIGZvciB0aGUgdHdlZW5cclxuXHRcdCAqIEByZXR1cm5zIHtTY2VuZX0gUGFyZW50IG9iamVjdCBmb3IgY2hhaW5pbmcuXHJcblx0XHQgKi9cclxuXHRcdFNjZW5lLnNldFR3ZWVuID0gZnVuY3Rpb24gKFR3ZWVuT2JqZWN0LCBkdXJhdGlvbiwgcGFyYW1zKSB7XHJcblx0XHRcdHZhciBuZXdUd2VlbjtcclxuXHRcdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XHJcblx0XHRcdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSB7XHJcblx0XHRcdFx0XHRwYXJhbXMgPSBkdXJhdGlvbjtcclxuXHRcdFx0XHRcdGR1cmF0aW9uID0gMTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0VHdlZW5PYmplY3QgPSBUd2Vlbi50byhUd2Vlbk9iamVjdCwgZHVyYXRpb24sIHBhcmFtcyk7XHJcblx0XHRcdH1cclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHQvLyB3cmFwIFR3ZWVuIGludG8gYSBUaW1lbGluZSBPYmplY3QgaWYgYXZhaWxhYmxlIHRvIGluY2x1ZGUgZGVsYXkgYW5kIHJlcGVhdHMgaW4gdGhlIGR1cmF0aW9uIGFuZCBzdGFuZGFyZGl6ZSBtZXRob2RzLlxyXG5cdFx0XHRcdGlmIChUaW1lbGluZSkge1xyXG5cdFx0XHRcdFx0bmV3VHdlZW4gPSBuZXcgVGltZWxpbmUoe1xyXG5cdFx0XHRcdFx0XHRzbW9vdGhDaGlsZFRpbWluZzogdHJ1ZVxyXG5cdFx0XHRcdFx0fSkuYWRkKFR3ZWVuT2JqZWN0KTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0bmV3VHdlZW4gPSBUd2Vlbk9iamVjdDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0bmV3VHdlZW4ucGF1c2UoKTtcclxuXHRcdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRcdGxvZygxLCBcIkVSUk9SIGNhbGxpbmcgbWV0aG9kICdzZXRUd2VlbigpJzogU3VwcGxpZWQgYXJndW1lbnQgaXMgbm90IGEgdmFsaWQgVHdlZW5PYmplY3RcIik7XHJcblx0XHRcdFx0cmV0dXJuIFNjZW5lO1xyXG5cdFx0XHR9XHJcblx0XHRcdGlmIChfdHdlZW4pIHsgLy8ga2lsbCBvbGQgdHdlZW4/XHJcblx0XHRcdFx0U2NlbmUucmVtb3ZlVHdlZW4oKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRfdHdlZW4gPSBuZXdUd2VlbjtcclxuXHJcblx0XHRcdC8vIHNvbWUgcHJvcGVydGllcyBuZWVkIHRvIGJlIHRyYW5zZmVycmVkIGl0IHRvIHRoZSB3cmFwcGVyLCBvdGhlcndpc2UgdGhleSB3b3VsZCBnZXQgbG9zdC5cclxuXHRcdFx0aWYgKFR3ZWVuT2JqZWN0LnJlcGVhdCAmJiBUd2Vlbk9iamVjdC5yZXBlYXQoKSA9PT0gLTEpIHsgLy8gVHdlZW5NYXggb3IgVGltZWxpbmVNYXggT2JqZWN0P1xyXG5cdFx0XHRcdF90d2Vlbi5yZXBlYXQoLTEpO1xyXG5cdFx0XHRcdF90d2Vlbi55b3lvKFR3ZWVuT2JqZWN0LnlveW8oKSk7XHJcblx0XHRcdH1cclxuXHRcdFx0Ly8gU29tZSB0d2VlbiB2YWxpZGF0aW9ucyBhbmQgZGVidWdnaW5nIGhlbHBlcnNcclxuXHRcdFx0aWYgKFNjZW5lLnR3ZWVuQ2hhbmdlcygpICYmICFfdHdlZW4udHdlZW5Ubykge1xyXG5cdFx0XHRcdGxvZygyLCBcIldBUk5JTkc6IHR3ZWVuQ2hhbmdlcyB3aWxsIG9ubHkgd29yayBpZiB0aGUgVGltZWxpbmVNYXggb2JqZWN0IGlzIGF2YWlsYWJsZSBmb3IgU2Nyb2xsTWFnaWMuXCIpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBjaGVjayBpZiB0aGVyZSBhcmUgcG9zaXRpb24gdHdlZW5zIGRlZmluZWQgZm9yIHRoZSB0cmlnZ2VyIGFuZCB3YXJuIGFib3V0IGl0IDopXHJcblx0XHRcdGlmIChfdHdlZW4gJiYgU2NlbmUuY29udHJvbGxlcigpICYmIFNjZW5lLnRyaWdnZXJFbGVtZW50KCkgJiYgU2NlbmUubG9nbGV2ZWwoKSA+PSAyKSB7IC8vIGNvbnRyb2xsZXIgaXMgbmVlZGVkIHRvIGtub3cgc2Nyb2xsIGRpcmVjdGlvbi5cclxuXHRcdFx0XHR2YXJcclxuXHRcdFx0XHR0cmlnZ2VyVHdlZW5zID0gVHdlZW4uZ2V0VHdlZW5zT2YoU2NlbmUudHJpZ2dlckVsZW1lbnQoKSksXHJcblx0XHRcdFx0XHR2ZXJ0aWNhbCA9IFNjZW5lLmNvbnRyb2xsZXIoKS5pbmZvKFwidmVydGljYWxcIik7XHJcblx0XHRcdFx0dHJpZ2dlclR3ZWVucy5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgpIHtcclxuXHRcdFx0XHRcdHZhclxyXG5cdFx0XHRcdFx0dHdlZW52YXJzID0gdmFsdWUudmFycy5jc3MgfHwgdmFsdWUudmFycyxcclxuXHRcdFx0XHRcdFx0Y29uZGl0aW9uID0gdmVydGljYWwgPyAodHdlZW52YXJzLnRvcCAhPT0gdW5kZWZpbmVkIHx8IHR3ZWVudmFycy5ib3R0b20gIT09IHVuZGVmaW5lZCkgOiAodHdlZW52YXJzLmxlZnQgIT09IHVuZGVmaW5lZCB8fCB0d2VlbnZhcnMucmlnaHQgIT09IHVuZGVmaW5lZCk7XHJcblx0XHRcdFx0XHRpZiAoY29uZGl0aW9uKSB7XHJcblx0XHRcdFx0XHRcdGxvZygyLCBcIldBUk5JTkc6IFR3ZWVuaW5nIHRoZSBwb3NpdGlvbiBvZiB0aGUgdHJpZ2dlciBlbGVtZW50IGFmZmVjdHMgdGhlIHNjZW5lIHRpbWluZyBhbmQgc2hvdWxkIGJlIGF2b2lkZWQhXCIpO1xyXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIHdhcm4gYWJvdXQgdHdlZW4gb3ZlcndyaXRlcywgd2hlbiBhbiBlbGVtZW50IGlzIHR3ZWVuZWQgbXVsdGlwbGUgdGltZXNcclxuXHRcdFx0aWYgKHBhcnNlRmxvYXQoVHdlZW5MaXRlLnZlcnNpb24pID49IDEuMTQpIHsgLy8gb25PdmVyd3JpdGUgb25seSBwcmVzZW50IHNpbmNlIEdTQVAgdjEuMTQuMFxyXG5cdFx0XHRcdHZhclxyXG5cdFx0XHRcdGxpc3QgPSBfdHdlZW4uZ2V0Q2hpbGRyZW4gPyBfdHdlZW4uZ2V0Q2hpbGRyZW4odHJ1ZSwgdHJ1ZSwgZmFsc2UpIDogW190d2Vlbl0sXHJcblx0XHRcdFx0XHQvLyBnZXQgYWxsIG5lc3RlZCB0d2VlbiBvYmplY3RzXHJcblx0XHRcdFx0XHRuZXdDYWxsYmFjayA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRcdFx0bG9nKDIsIFwiV0FSTklORzogdHdlZW4gd2FzIG92ZXJ3cml0dGVuIGJ5IGFub3RoZXIuIFRvIGxlYXJuIGhvdyB0byBhdm9pZCB0aGlzIGlzc3VlIHNlZSBoZXJlOiBodHRwczovL2dpdGh1Yi5jb20vamFucGFlcGtlL1Njcm9sbE1hZ2ljL3dpa2kvV0FSTklORzotdHdlZW4td2FzLW92ZXJ3cml0dGVuLWJ5LWFub3RoZXJcIik7XHJcblx0XHRcdFx0XHR9O1xyXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwLCB0aGlzVHdlZW4sIG9sZENhbGxiYWNrOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykgeyAvKmpzaGludCBsb29wZnVuYzogdHJ1ZSAqL1xyXG5cdFx0XHRcdFx0dGhpc1R3ZWVuID0gbGlzdFtpXTtcclxuXHRcdFx0XHRcdGlmIChvbGRDYWxsYmFjayAhPT0gbmV3Q2FsbGJhY2spIHsgLy8gaWYgdHdlZW5zIGlzIGFkZGVkIG1vcmUgdGhhbiBvbmNlXHJcblx0XHRcdFx0XHRcdG9sZENhbGxiYWNrID0gdGhpc1R3ZWVuLnZhcnMub25PdmVyd3JpdGU7XHJcblx0XHRcdFx0XHRcdHRoaXNUd2Vlbi52YXJzLm9uT3ZlcndyaXRlID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdFx0XHRcdGlmIChvbGRDYWxsYmFjaykge1xyXG5cdFx0XHRcdFx0XHRcdFx0b2xkQ2FsbGJhY2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0bmV3Q2FsbGJhY2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHRcdFx0XHRcdFx0fTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0bG9nKDMsIFwiYWRkZWQgdHdlZW5cIik7XHJcblxyXG5cdFx0XHR1cGRhdGVUd2VlblByb2dyZXNzKCk7XHJcblx0XHRcdHJldHVybiBTY2VuZTtcclxuXHRcdH07XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBSZW1vdmUgdGhlIHR3ZWVuIGZyb20gdGhlIHNjZW5lLiAgXHJcblx0XHQgKiBUaGlzIHdpbGwgdGVybWluYXRlIHRoZSBjb250cm9sIG9mIHRoZSBTY2VuZSBvdmVyIHRoZSB0d2Vlbi5cclxuXHRcdCAqXHJcblx0XHQgKiBVc2luZyB0aGUgcmVzZXQgb3B0aW9uIHlvdSBjYW4gZGVjaWRlIGlmIHRoZSB0d2VlbiBzaG91bGQgcmVtYWluIGluIHRoZSBjdXJyZW50IHN0YXRlIG9yIGJlIHJld291bmQgdG8gc2V0IHRoZSB0YXJnZXQgZWxlbWVudHMgYmFjayB0byB0aGUgc3RhdGUgdGhleSB3ZXJlIGluIGJlZm9yZSB0aGUgdHdlZW4gd2FzIGFkZGVkIHRvIHRoZSBzY2VuZS5cclxuXHRcdCAqIEBtZW1iZXJvZiEgYW5pbWF0aW9uLkdTQVAjXHJcblx0XHQgKlxyXG5cdFx0ICogQGV4YW1wbGVcclxuXHRcdCAqIC8vIHJlbW92ZSB0aGUgdHdlZW4gZnJvbSB0aGUgc2NlbmUgd2l0aG91dCByZXNldHRpbmcgaXRcclxuXHRcdCAqIHNjZW5lLnJlbW92ZVR3ZWVuKCk7XHJcblx0XHQgKlxyXG5cdFx0ICogLy8gcmVtb3ZlIHRoZSB0d2VlbiBmcm9tIHRoZSBzY2VuZSBhbmQgcmVzZXQgaXQgdG8gaW5pdGlhbCBwb3NpdGlvblxyXG5cdFx0ICogc2NlbmUucmVtb3ZlVHdlZW4odHJ1ZSk7XHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIHtib29sZWFufSBbcmVzZXQ9ZmFsc2VdIC0gSWYgYHRydWVgIHRoZSB0d2VlbiB3aWxsIGJlIHJlc2V0IHRvIGl0cyBpbml0aWFsIHZhbHVlcy5cclxuXHRcdCAqIEByZXR1cm5zIHtTY2VuZX0gUGFyZW50IG9iamVjdCBmb3IgY2hhaW5pbmcuXHJcblx0XHQgKi9cclxuXHRcdFNjZW5lLnJlbW92ZVR3ZWVuID0gZnVuY3Rpb24gKHJlc2V0KSB7XHJcblx0XHRcdGlmIChfdHdlZW4pIHtcclxuXHRcdFx0XHRpZiAocmVzZXQpIHtcclxuXHRcdFx0XHRcdF90d2Vlbi5wcm9ncmVzcygwKS5wYXVzZSgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRfdHdlZW4ua2lsbCgpO1xyXG5cdFx0XHRcdF90d2VlbiA9IHVuZGVmaW5lZDtcclxuXHRcdFx0XHRsb2coMywgXCJyZW1vdmVkIHR3ZWVuIChyZXNldDogXCIgKyAocmVzZXQgPyBcInRydWVcIiA6IFwiZmFsc2VcIikgKyBcIilcIik7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIFNjZW5lO1xyXG5cdFx0fTtcclxuXHJcblx0fSk7XHJcbn0pKTsiXSwiZmlsZSI6ImxpYnMvYW5pbWF0aW9uLmdzYXAuanMifQ==
