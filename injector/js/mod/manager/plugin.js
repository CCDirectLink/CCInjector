import BasicManager from './basic.js';
import PluginModel from '../models/plugin.js';
import PluginLoader from '../loader/plugin.js';

export default class PluginManager extends BasicManager {
	constructor(path, env, fs, resLoader) {
		super(path, env, fs, resLoader, PluginLoader);
		this.plugins = [];
		this.sysPlugins = [];
		this.setType('plugins');
	}
	async load() {
		let pluginsLoaded = await super.load();
		this.plugins = pluginsLoaded.map(({pluginModule, folderName}) => {
			let model = new PluginModel(pluginModule);
			let pluginPath = this._createPath(folderName);
			model.setPath(pluginPath);

			return model;
		});
		this._sortPlugins();
	}
	async run(mods) {
		this.sysPlugins.forEach((sysPlugin) => {
			const sysRequire = this._injectRequire(sysPlugin.getPath());
			sysPlugin.run({
				plugins : this.plugins, 
				mods,
				require: sysRequire
			});
		});
		this.plugins.forEach((plugin) => {
			const require = this._injectRequire(plugin.getPath());
			plugin.run({
				mods,
				require
			});
		});
	}
	_injectRequire(path) {
		const modulesPath = path.joinWithPath({
			pathKey: 'base',
			relativePath: ['node_modules/']
		});
		return function(file, localRequire = true) {
			if (localRequire) {
				return require(path.join(modulesPath, file));
			}
			return require(file);
		}
	};
	_sortPlugins() {
		// sort by priority
		this.plugins.sort((plugin1, plugin2) => {
			return plugin1.getPriority() - plugin2.getPriority();
		});

		// separate regular from system plugins
		let isSystemPlugin = true;
		do {
			let currentPlugin = this.plugins.shift();
			if (currentPlugin) {
				if(currentPlugin.getPriority() < 0) {
					this.sysPlugins.push(currentPlugin);
				} else {
					isSystemPlugin = false;
					this.plugins.unshift(currentPlugin);
				}
			}
		} while (isSystemPlugin);
	}
}