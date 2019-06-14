
(function () {
	const beforeDomReady = [];
	window.addBeforeDomReady = (cb) => {
		beforeDomReady.push(cb);
	};

	const onloadCallbacks = [];
	let onload = () => {},ig = {};
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
				if (window.ig !== value) {
					oldDOMReady = value._DOMReady.bind(value);
					let started = false;
					value._DOMReady = ((ready = false) => {
						if (ready === true && !started && !ig.modules["dom.ready"].loaded) {
							started = true;
							debugger;
							// assume they are all promises
							Promise.all(beforeDomReady).then(() => {
								oldDOMReady();
							});
						}
						
					});					
				}

				ig = value;
			},
			get() {
				return ig;
			}
		}

	});	
})()
