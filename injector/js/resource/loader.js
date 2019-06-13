export default class ResourceLoader {
	constructor(path, env) {
		this.path = path;
		this.env = env;
		this.fs = require('fs');
		this.domParser = new DOMParser();
	}

	async load(path, opts = {}) {
		let resource = this.fs.readFileSync(path, 'utf8');
		
		return this.convert(resource, opts);
	}
	
	convert(resource, opts) {
		if(opts.json) {
			return JSON.parse(resource);
		} else if (opts.html) {
			return this.domParser.parseFromString(resource, 'text/html');
		}
		return resource;
	}
}