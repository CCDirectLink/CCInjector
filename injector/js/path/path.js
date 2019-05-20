import BrowserPath from './browser-path.js';

export default class Path {

	constructor(env) {
		this.env = env;
		this._path = null;
		if (this.env.isNode()) {
			this._path = require('path');
		} else if (this.env.isBrowser()) {
			this._path = new BrowserPath();
		}
		this.paths = {};

		this.init();
	}
	
	init() {
		if (this.env.isBrowser()) {
			this.set('base', window.location.origin);
		} else if (this.env.isNode()) {
			this.set('base', this._path.join(process.execPath, '..'));
		}
	}
	
	set(key, path) {
		this.paths[key] = path;
	}
	
	add(key, path) {
		const basePath = this.getPath('base');
		const fullPath = this._path.join(basePath, path);
		this.set(key, fullPath);
	}
	
	join(relativePath, key = 'base') {
		
		const path = this.getPath(key);
		const fullPath = this._path.join(path , relativePath);
		
		return fullPath;
	}

	getPath(key) {
		return this.paths[key];
	}

}