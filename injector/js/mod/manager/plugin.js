import BasicManager from './basic.js';
import PluginModel from '../models/plugin.js';
import PluginLoader from '../loader/plugin.js';

export default class PluginManager extends BasicManager {
	constructor(path, env, fs, resLoader, models = []) {
		super(path, env, fs, resLoader, models, PluginLoader, PluginModel);
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
			let model = this.createModel(pluginModule);
			this.addModel(model);
			let pluginPath = this._createPath(folderName);
			model.setPath(pluginPath);
		});
		this.sortModelsByPriority();
	}

	async run(modModelManager) {
		const cachePluginManagers = {};
		// this supports models being modified.

		for (const plugin of this._getModelsIterator()) {
			const require = this._injectRequire(plugin);
			const injectedDependences = {
				managers: {
					mods: modModelManager
				},
				require
			};
			const pluginPriority = plugin.getPriority();
			const cachedManager = cachePluginManagers[pluginPriority];
			
			if (cachedManager) {
				injectedDependences.managers.plugins = cachedManager;
			} else if(pluginPriority < 0) {
				const generatedPluginManager = this.generateManagerWithMinPriority(pluginPriority + 1);

				cachePluginManagers[pluginPriority] = generatedPluginManager;
				injectedDependences.managers.plugins = generatedPluginManager;
			}
			
			await plugin.run(injectedDependences);
		}
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
	}

}