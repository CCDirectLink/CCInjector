import Path from '../path/path.js';
import ResourceLoader from '../resource/loader.js';
import Environment from '../environment/environment.js';
import FileSystem from '../filesystem-manager/fs.js';
import PluginLoader from './loader/plugin.js';
import ModLoader from './loader/mod.js';
class ModManager {
	constructor() {
		this.injectDependencies();
	}
	injectDependencies() {
		this.env = new Environment();
		this.path = new Path(this.env);
		this.resLoader = new ResourceLoader(this.path, this.env);
		this.fs = new FileSystem(this.env);
		this.pluginLoader = new PluginLoader(this.path, this.env, this.fs, this.resLoader);
		this.modLoader = new ModLoader(this.path, this.env, this.fs, this.resLoader);
	}

	async init() {
		await this.pluginLoader.init();
		await this.modLoader.init();
	}
	async load() {
		let plugins = await this.pluginLoader.load();
		let mods = await this.modLoader.load();
		plugins.forEach((plugin) => {
			plugin.run(mods);
		});
		for (const mod of mods) {
			await mod.execute();
		}
		this.onloadFinish();
	}
	onloadFinish() {		
		window.onloadCallbacks.forEach((cb) => cb());
	}
}

const modLoader = new ModManager();
modLoader.init()
		 .then(() => modLoader.load());