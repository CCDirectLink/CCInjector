const fs = require('fs');


export default class ResourceCreator {
	constructor(path) {
		this.path = path;
	}
	create(path, content) {
		const fullPath = this.path.join(path);
		fs.writeFileSync(fullPath, content); 
	}
}