

export default class BasicLoader {
	constructor(path, env, fs, resLoader) {
		this.path = path;
		this.env = env;
		this.fs = fs;
		this.resLoader = resLoader;
		this.addGlobalPath();
	}

	addGlobalPath() {}

	async init() {

	}
	
	async load() {

	}

	async getAll(type) {
		const fullPath = this.path.joinWithPath({
			pathKey: type,
			relativePath: '/'
		});

		let response = []; 
		try {
			response = await this.fs.readdir(fullPath);
		} catch (e) {}

		return response;
	}
}