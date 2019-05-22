import Path from '../../path/path.js';
import BasicLoader from '../loader/basic.js';
export default class BasicManager {
	constructor(path, env, fs, resLoader, Loader = BasicLoader) {
		this.path = path;
		this.env = env;
		this.fs = fs;
		this.resLoader = resLoader;
		this.loader = new Loader(path, env, fs, resLoader);
		this.type = 'basic';
	}
	setType(type) {
		this.type = type;
	}
	async init() {
		return this.loader.init();
	}
	async load() {
		return this.loader.load();
	}
	async run() {}


	_createPath(folderName) {
		const path = new Path(this.env);
		const browserBase = this.path.joinWithPath({
			pathKey: `${this.type}-browser`,
			relativePath: [folderName]
		});
		const absoluteBase = this.path.joinWithPath({
			pathKey: this.type,
			relativePath: [folderName]
		});
		path.setBase({
			browser: browserBase,
			absolute: absoluteBase
		});
		return path;
	}
}