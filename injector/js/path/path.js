import BrowserPath from './browser-path.js';

export default class Path {

	constructor(env) {
		this.env = env;
		this.pathNode = null;
		this.pathBrowser = null;
		if (this.env.isNode()) {
			this.pathNode = require('path');
		} 
		if (this.env.isBrowser()) {
			this.pathBrowser = new BrowserPath();
		}
		this.paths = {};

		this.init();
	}
	
	init() {
		if (this.env.isBrowser()) {
			this.set('base-browser', window.location.origin);
		}

		if (this.env.isNode()) {
			this.set('base', this.pathNode.join(process.execPath, '..'));
		}
	}
	
	set(key, path) {
		this.paths[key] = path;
	}
	
	add(key, path) {
		if (this.env.isNode()) {
			const basePath = this.getPath('base');
			const fullPath = this.pathNode.join(basePath, path);
			this.set(key, fullPath);	
		}
		
		if (this.env.isBrowser()) {
			const basePathBrowser = this.getPath('base-browser');
			const fullPathBrowser = this.pathBrowser.join(basePathBrowser, path);
			this.set(key + '-browser', fullPathBrowser);
		}
	}
	
	join(relativePath, key = 'base') {
		
		const path = this.getPath(key);
		let fullPath;

		if (this.env.isNode() && !key.endsWith('-browser')) {
			fullPath = this.pathNode.join(path, relativePath);
		} else if (this.env.isBrowser()) {
			fullPath = this.pathBrowser.join(path , relativePath);
		} else {
			throw new Error('How did this even happen?');
		}

		return fullPath;
	}

	getPath(key) {
		return this.paths[key];
	}
}