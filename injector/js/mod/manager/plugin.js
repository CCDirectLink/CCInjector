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
		this.cacheModels = null;
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
				const generatedPluginManager = this._generateManagerByPriority(pluginPriority);

				cachePluginManagers[pluginPriority] = generatedPluginManager;
				injectedDependences.managers.plugins = generatedPluginManager;
			}
			
			plugin.run(injectedDependences);
		}
	}

	_getModelsIterator() {
		let index = 0;
		const next = () => {
			
			if (index < this.models.length) {
				const currentModel = this.models[index];
				++index;
				return {value: currentModel, done : false};
			}
			return {done: true};
		};
		return {
			[Symbol.iterator]: () => {
				return {next};
			}
		};
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
	setModels(models) {
		super.setModels(models);
		this._sortPlugins();
	}
	
	addModel(model) {
		super.addModel(model);
		this._sortPlugins();
	}

	insertModel(model, index) {
		
		const diffIndex = this._getDifferenceInModelLengths();
		super.insertModel(model, diffIndex + index);
		this.cacheModels = null;
	}
	
	replaceModel(model, index) {
		const diffIndex = this._getDifferenceInModelLengths();
		super.replaceModel(model, diffIndex + index);
		this.cacheModels = null;
	}

	removeModel(model) {
		super.removeModel(model);
		this.cacheModels = null;
	}

	getModels() {

		if (this.minPriority === -Infinity) {
			return this.models;
		}
		const models = super.getModels();

		if (!this.cacheModels) {
			this.cacheModels = models.filter((value) => value.getPriority() >= this.minPriority);
		}

		return this.cacheModels;
	}

	setMinPriority(priority) {
		this.minPriority = priority;
	}
	
	setMaxPriority(priority){
		this.maxPriority = priority;
	}

	groupModelsByPriority() {
		if (this.models.length === 0) {
			return [];
		}
		let minPriority = this.models[0].getPriority(); 

		let maxPriority = this.models[this.models.length - 1].getPriority();
		
		const priorityList = [];
		for(let priority = minPriority; priority <= maxPriority; priority++) {
			const list = this._getModelsWithEqualPriority(priority);
			priorityList.push({
				group: list,
				startIndex: this.getModelIndex(list[0])
			});
		}
		return priorityList;
	}

	_getModelsWithEqualPriority(priority) {
		return this.getModels().filter((plugin) => plugin.getPriority() === priority);
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

	_sortPlugins() {
		
		if (this.getModels().length === 0) {
			return;
		}

		// sort by priority
		let sortedModels = this.getModels().sort((plugin1, plugin2) => {
			return plugin1.getPriority() - plugin2.getPriority();
		});

		this.maxPriority = sortedModels[sortedModels.length - 1].getPriority();
		// this is not a generated PluginManager
		if (this.minPriority === -Infinity) {
			super.setModels(sortedModels);
		} else {
			this.minPriority = sortedModels[0].getPriority();
			// This is and it has a cacheModels property
			this.cacheModels = sortedModels;
			
			const diffIndex = this._getDifferenceInModelLengths();
			// update parent models to prevent conflicts
			this.models.splice.apply(this.models, [diffIndex, sortedModels.length].concat(sortedModels));
		}
	}

	_getDifferenceInModelLengths() {
		return this.models.length - this.getModels().length;
	}
}