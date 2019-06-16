import BasicManager from './basic.js';
import PluginModel from '../models/plugin.js';
import PluginLoader from '../loader/plugin.js';

export default class PluginManager extends BasicManager {
	constructor() {
		super();
		this.require = null;
		this.setType('plugins');
		
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

	async run(modModelManager) {
		
		let startIndex = 0;
		let modelCopies = this.models.slice(0);
		const copy = this.copy();
		copy.setModels(modelCopies);
		
		for (const plugin of this._getModelsIterator()) {

			// create custom require
			const require = this._injectRequire(plugin);
			
			
			
			// remove the currently executing model
			modelCopies.splice(0,1);
			

			const phaseName = this.phaseManager.getCurrentPhase();
			
			const instance = plugin.getInstance();
			// might include a permissions field so that I can limit how often models are spliced
			++startIndex;
			if (instance) {
				if (instance[phaseName]) {
					await instance[phaseName]({
						managers: {
							plugin: copy,
							mod: modModelManager
						},
						require
					});
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