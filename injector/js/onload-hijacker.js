window.onloadCallbacks = [];
Object.defineProperty(window, 'onload', {
	set(value) {
		window.onloadCallbacks.push(value);
		this.value = () => {};
	},
	get() {
		return this.value;
	}
});