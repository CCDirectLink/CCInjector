import FileSystem from '../filesystem-manager/fs.js';

export default class ResourceCreator {
	constructor(path, env) {
		this.fs = new FileSystem(env);
		this.path = path;
	}
	async create(path, content, opts) {
		const fullPath = this.path.join(path);
		// should be check recursively
		return this.fs.writeFile(fullPath, content, opts); 
	}
}