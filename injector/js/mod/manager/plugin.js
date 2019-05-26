import BasicManager from './basic.js';
import PluginModel from '../models/plugin.js';
import PluginLoader from '../loader/plugin.js';

export default class PluginManager extends BasicManager {
	constructor(path, env, fs, resLoader) {
		super(path, env, fs, resLoader, PluginLoader, PluginModel);
		this.sysPlugins = [];
		this.require = null;
		this.setType('plugins');
		this.minPriority = -Infinity;
		this.maxPriority = Infinity;
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
		const cachePluginManagers = {};
		this.getModels().forEach((plugin) => {
			const require = this._injectRequire(plugin);
			const injectedDependences = {
				managers: {
					mods: modelManager
				},
				require
			};
			const pluginPriority = plugin.getPriority();
			const cachedManager = cachePluginManagers[pluginPriority];
			
			if (cachedManager) {
				injectedDependences.managers.plugins = cachedManager;
			} else if(pluginPriority < 0) {
				const generatedPluginManager = this._generateManagerByPriority(pluginPriority);
				cachePluginManagers[pluginPriority] = generatedPluginManager;
				injectedDependences.managers.plugins = generatedPluginManager;
			}
			
			plugin.run(injectedDependences);
		});
	}

	_generateManagerByPriority(pluginPriority) {
		
		const pluginManager = this.copy();
		pluginManager.setMinPriority(pluginPriority + 1);
		const models = this.models; 
		const maxPriority = models[models.length - 1] || 0;
		
		pluginManager.setMaxPriority(maxPriority);

		pluginManager.setModels(models);
		
		return pluginManager;
	}
	
	removeModel(model) {
		if (model.getPriority() >= this.minPriority) {
			super.removeModel(model);
		}		
	}

	getModels() {
		const models = super.getModels();
		return models.filter((value) => value.getPriority() >= this.minPriority);
	}

	setMinPriority(priority) {
		this.minPriority = priority;
	}
	setMaxPriority(priority){
		this.maxPriority = priority;
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
		let sortedModels = this.getModels().sort((plugin1, plugin2) => {
			return plugin1.getPriority() - plugin2.getPriority();
		});

		this.setModels(sortedModels);
	}
}