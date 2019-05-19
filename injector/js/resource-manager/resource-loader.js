const fs = require('fs');
const {join, resolve} = require('path');

export default class ResourceLoader {
	constructor(path) {
		this.path = path;
		this.domParser = new DOMParser();
	}
	exist(path) {
		return fs.existsSync(path);
	}
	async load(path, opts = {}) {
		let fullPath = this.path.join(path);
		let resource = fs.readFileSync(fullPath, 'utf8');
		if(opts.json) {
			return JSON.parse(resource);
		} else if (opts.html) {
			return this.domParser.parseFromString(resource, 'text/html');
		}
		return resource;
	}
}