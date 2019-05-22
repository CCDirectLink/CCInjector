import BasicLoader from '../loader/basic.js';
export default class BasicManager {
	constructor(path, env, fs, resLoader, Loader = BasicLoader) {
		this.path = path;
		this.env = env;
		this.fs = fs;
		this.resLoader = resLoader;
		this.loader = new Loader(path, env, fs, resLoader);
	}
	async init() {
		return this.loader.init();
	}
	async load() {
		return this.loader.load();
	}
	async run() {}
}