import BasicManager from './basic.js';
import PluginModel from '../models/plugin.js';
import PluginLoader from '../loader/plugin.js';

export default class PluginManager extends BasicManager {
	constructor(path, env, fs, resLoader) {
		super(path, env, fs, resLoader, PluginLoader, PluginModel);
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
			let model = super.createModel(pluginModule);
			let pluginPath = this._createPath(folderName);
			model.setPath(pluginPath);

			return model;
		});
		this._sortPlugins();
	}
	async run(modelManager) {
		this.sysPlugins.forEach((sysPlugin) => {
			const sysRequire = this._injectRequire(sysPlugin);
			sysPlugin.run({
				managers: {
					plugin: this,
					mod: modelManager
				},
				require: sysRequire
			});
		});
		this.plugins.forEach((plugin) => {
			const require = this._injectRequire(plugin);
			plugin.run({
				managers: {
					mods: modelManager
				},
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
		return (file) => {
			let modulePath = path.join(modulesPath, file + '/');
			if (this.fs.existsSync(modulePath)) {
				return require(modulePath);
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