const util = {
	path: require('path')
};

export default class Path {
	constructor() {
		this.paths = {
			base : util.path.join(process.execPath, '..')
		};
		if (this.isBrowser()) {
			this.set('base', window.location.origin);
		}
	}
	isBrowser() {
		return typeof window !== 'undefined' && !!window.location;
	}
	set(key, path) {
		this.paths[key] = path;
	}
	add(key, path) {
		const basePath = this.getPath('base');
		const fullPath = util.path.join(basePath, path);
		this.paths[key] = fullPath;
	}
	join(relativePath, key = 'base') {
		if (this.isBrowser()) {
			return relativePath;
		}

		const path = this.getPath(key);
		const fullPath = util.path.join(path , relativePath);
		
		return fullPath;
	}

	getPath(key) {
		return this.paths[key];
	}

}