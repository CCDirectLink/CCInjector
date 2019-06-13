
export default class ResourceCreator {
	constructor(path, env) {
		this.fs = require('fs');
		this.path = path;
	}
	async create(path, content, opts) {
		// should be check recursively
		return this.fs.writeFileSync(path, content, opts); 
	}
}