import BasicManager from './basic.js';
import PluginModel from '../models/plugin.js';
import PluginLoader from '../loader/plugin.js';

export default class PluginManager extends BasicManager {
	constructor(path, env, fs, resLoader) {
		super(path, env, fs, resLoader, PluginLoader);
		this.plugins = [];
		this.sysPlugins = [];
		this.require = null;
		this.setType('plugins');
	}
	async init() {
		await super.init();
		this.require = require;
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
			const sysRequire = this._injectRequire(sysPlugin);
			sysPlugin.run({
				plugins : this.plugins, 
				mods,
				require: sysRequire
			});
		});
		this.plugins.forEach((plugin) => {
			const require = this._injectRequire(plugin);
			plugin.run({
				mods,
				require
			});
		});
	}
	_injectRequire(plugin) {
		const require = this.require;
		const path = plugin.getPath();
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
		let sysPluginEndIndex = 0;
		for (const plugin of this.plugins) {
			if (plugin.getPriority() < 0) {
				++sysPluginEndIndex;
			}
		}
		this.sysPlugins = this.plugins.splice(0, sysPluginEndIndex);
	}
}