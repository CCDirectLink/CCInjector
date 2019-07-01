import BasicManager from './basic.js';
import PluginModel from '../models/plugin.js';
import PluginLoader from '../loader/plugin.js';

export default class PluginManager extends BasicManager {
	constructor() {
		super();
		this.require = null;
		this.setType('plugins');
		this.cacheCopy = null;
	}

	initLoader() {
		super.initLoader(PluginLoader);
	}

	createModel(modelData) {
		return super.createModel(modelData, PluginModel);
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
	}


	copy() {
		const instance = super.copy();
		
		let modelCopies = this.models.slice(0);
		instance.setModels(modelCopies);
		
		return instance;
	}

	async run(director) {
		
		let startIndex = 0;

		let modelCopies = null;
		if (this.cacheCopy === null) {
			this.cacheCopy = this.copy();
			modelCopies = this.cacheCopy.getModels();
		} else {
			// update cacheCopy
			modelCopies = this.models.slice(0);
			this.cacheCopy.setModels(modelCopies);
		}

		for (const plugin of this._getModelsIterator()) {

			
			// remove the currently executing model
			modelCopies.splice(0,1);
			

			const phaseName = this.phaseManager.getCurrentPhase();
			
			const instance = plugin.createInstance({
				managers: {
					plugin: this.cacheCopy,
					mod: director.getModManager()
				},
				resourceLoader: this.resLoader,
				require: this._injectRequire(plugin)
			});

			++startIndex;
			if (instance) {
				if (instance[phaseName]) {
					await instance[phaseName]();
					// replace remaining
					this.models.splice(startIndex);
					this.models.push.apply(this.models, modelCopies);
				}
			}
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