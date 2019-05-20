import Path from '../path/path.js';
import ResourceLoader from '../resource/loader.js';
import Environment from '../environment/environment.js';
import FileSystem from '../filesystem-manager/fs.js';

class ModManager {
	constructor() {
		this.env = new Environment();
		this.path = new Path(this.env);
		this.resLoader = new ResourceLoader(this.path, this.env);
		this.fs = new FileSystem(this.env);
		this.init().then(() => {
			window.onloadCallbacks.forEach((cb) => cb());
		});
	}
	async init() {
		this.path.add('plugins', 'assets/plugins');
		this.path.add('mods', 'assets/mods');
		try {
			await this.loadPlugins();
		} catch (e) {}
		try {
			await this.loadMods();
		} catch (e) {}
	}

	async loadPlugins() {
		const pluginsPath = this.path.getPath('plugins');
		const response = await this.fs.readdir(pluginsPath);
		console.log(response);

		// this.resLoader.load( , {json: true});
	}
	
	async loadMods() {

	}
}

const modLoader = new ModManager();


