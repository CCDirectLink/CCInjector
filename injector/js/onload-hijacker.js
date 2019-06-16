
(function () {
	const beforeDomReady = [];
	window.addBeforeDomReady = (cb) => {
		beforeDomReady.push(cb);
	};
	
	
	const onloadCallbacks = [];
	window.executeOnloadCallbacks = () => {
		onloadCallbacks.forEach((cb) => cb());
	};

	let ig = {};
	let oldDOMReady = undefined;
	
	Object.defineProperties(window, {
		onload: {
			set(value) {;
				onloadCallbacks.push(value);
			},
			get() {
				return () => {};
			}		
		},
		ig: {
			set(value) {
				// for some reason it reassigns the same value
				if (window.ig !== value) {
					oldDOMReady = value._DOMReady.bind(value);

					value._DOMReady = (async (ready = false) => {
						if (ready === true && !ig.modules["dom.ready"].loaded) {
							for (const cb of beforeDomReady) {
								await cb();
							}
							oldDOMReady();
						}
						
					});
					ig = value;
				}		
			},
			get() {
				return ig;
			}
		}

	});	
})()
