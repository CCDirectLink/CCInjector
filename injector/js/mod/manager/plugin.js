import BasicManager from './basic.js';
import PluginModel from '../models/plugin.js';
import PluginLoader from '../loader/plugin.js';

export default class PluginManager extends BasicManager {
	constructor(path, env, fs, resLoader) {
		super(path, env, fs, resLoader, PluginLoader, PluginModel);
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
		pluginsLoaded.forEach(({pluginModule, folderName}) => {
			let model = super.createModel(pluginModule);
			this.addModel(model);
			let pluginPath = this._createPath(folderName);
			model.setPath(pluginPath);
		});
		this._sortPlugins();
	}
	async run(modelManager) {
		this.sysPlugins.forEach((sysPlugin) => {
			const sysRequire = this._injectRequire(sysPlugin);
			sysPlugin.run({
				managers: {
					plugins: this,
					mods: modelManager
				},
				require: sysRequire
			});
		});
		this.getModels().forEach((plugin) => {
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
		this.getModels().sort((plugin1, plugin2) => {
			return plugin1.getPriority() - plugin2.getPriority();
		});

		// separate regular from system plugins

	}
}