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

Object.defineProperty(window, 'onload', {
	set(value) {
		modLoader.init().then(() => {
			value();
		});
		this.value = value;
	},
	get() {
		return this.value;
	}
});

