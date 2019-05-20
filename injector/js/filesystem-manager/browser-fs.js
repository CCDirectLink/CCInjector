


export default class BrowserFs {
	constructor() {
		this.request = new XMLHttpRequest();
	}

	readFile(path, opts) {
		throw new Error('To be implemented');
	}
}