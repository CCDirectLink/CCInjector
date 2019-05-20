import BrowserPath from './browser.js';

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
	remove(key) {
		if (this.paths[key]) {
			if (this.env.isNode()) {
				delete this.paths[key];
			} 
			if (this.env.isBrowser()) {
				delete this.paths[key + '-browser'];
			}
		}
	}
	
	joinWithPath({pathKey, relativePath}) {
		if (!pathKey) {
			pathKey = 'base';
		}
		if (!relativePath) {
			relativePath = '/';
		}
		const path = this.getPath(pathKey);

		if(!Array.isArray(relativePath) && relativePath) {
			relativePath = [relativePath];
		}
		
		relativePath.unshift(path);
		
		let joinedResult;

		if (!pathKey.endsWith('-browser')) {
			joinedResult = this.join(relativePath);
		}  else {
			joinedResult = this._join(this.pathBrowser, relativePath);
		}
		
		return joinedResult;
	}
	join() {
		let joinedResult;

		if (this.env.isNode()) {
			joinedResult = this._join(this.pathNode, arguments);
		} else if (this.env.isBrowser()) {
			joinedResult = this._join(this.pathBrowser, arguments);
		} else {
			throw new Error('How did this even happen?');
		}
		
		return joinedResult;
	}

	_join(pathImplementation, args) {
		if(Array.isArray(args[0])) {
			args = args[0];
		}
 		return pathImplementation.join.apply(pathImplementation, args);
	}

	getPath(key) {
		return this.paths[key];
	}
}