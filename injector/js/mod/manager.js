import Path from '../path/path.js';
import ResourceLoader from '../resource/loader.js';
import Environment from '../environment/environment.js';
import FileSystem from '../filesystem-manager/fs.js';
import PluginLoader from './loader/plugin.js';
import ModLoader from './loader/mod.js';
import Logger from '../logger/log.js';
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
		this.logger = new Logger(this.fs);
	}

	async init() {
		await this.pluginLoader.init();
		await this.modLoader.init();
	}
	async load() {
		let plugins = await this.pluginLoader.load();
		plugins.sort((plugin1, plugin2) => {
			return plugin1.getPriority() - plugin2.getPriority();
		});
		let mods = await this.modLoader.load();
		const injectRequire = function(path) {
			const modulesPath = path.joinWithPath({
				pathKey: 'base',
				relativePath: ['node_modules/']
			});
			return function(file) {
				return require(path.join(modulesPath, file));
			}
		}
		plugins.forEach((plugin) => {
			let pluginPathInstance = plugin.getPath();
			plugin.run({
				path: pluginPathInstance,
				require: injectRequire(pluginPathInstance),
				logger: this.logger,
				mods
			});
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