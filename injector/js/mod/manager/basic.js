import Path from '../../path/path.js';
import BasicLoader from '../loader/basic.js';
import BasicModel from '../models/basic.js';
import PriorityManager from './priority.js';

export default class BasicManager extends PriorityManager {
	constructor(path, env, fs, resLoader, models, Loader = BasicLoader, Model = BasicModel) {
		super();
		this.path = path;
		this.env = env;
		this.fs = fs;
		this.resLoader = resLoader;

		this.loader = new Loader(path, env, fs, resLoader);
		this.Model = Model;
		this.models = models;
		this.type = 'basic';
		this.cacheModels = null;
	}
	setType(type) {
		this.type = type;
	}
	
	setCacheModels(models) {
		this.cacheModels = models;
	}
	
	setModels(models) {
		
		const [lowestPriority, highestPriority] = this.getPriorityRange(models);
		if (models.length > 0) {
			if(!this._isPriorityAtOrAboveMinPriority(lowestPriority)) {
				throw new RangeError(`The lowest model priority ${lowestPriority} is below ${this.getMinPriority()}.`);
			}		
		} 

		this.setMinPriority(lowestPriority);
		this.setMaxPriority(highestPriority);
		this.setCacheModels(models);
		
		const diffIndex = this._getDifferenceInModelLengths();
		this.models.splice(diffIndex);
		this.models.splice.apply(this.models, [diffIndex, models.length].concat(models));
	
	}

	_isPriorityAtOrAboveMinPriority(priority) {
		return priority >= this.getMinPriority(); 
	}

	_isModelAddable(model) {
		return model.getPriority() >= this.getMinPriority();
	}
	
	getPriorityRange(models) {
		if (models.length === 0) {
			return [-Infinity, Infinity];
		}
		const lastElementIndex = models.length - 1;
		let lowestPriority = models[0].getPriority();
		let highestPriority = models[lastElementIndex].getPriority();
		
		for(let i = 0; i < models.length; i++) {
			const modelPriority = models[i].getPriority();
			if (modelPriority < lowestPriority) {
				lowestPriority = modelPriority;
			}
			if (modelPriority > highestPriority) {
				highestPriority = modelPriority;;
			}
		}
		return [lowestPriority, highestPriority];
	}
	
	async init() {
		return this.loader.init();
	}
	async load() {
		return this.loader.load();
	}
	async run() {}

	createModel(modelData) {
		return new this.Model(modelData);
	}
	
	getModelIndex(model) {
		return this.getModels().indexOf(model);
	}
	
	getIndexOfModelWithPriority(priority) {
		const models = this.getModels();
		for(let i = 0; i < models.length; i++) {
			if (models[i].getPriority() === priority) {
				return i;
			}
		}
		return -1;
	}
	
	addModel(model) {
		if (!this._isModelAddable(model)) {
			throw new RangeError(`Can't add "${model.getName()}" with lower priority than ${this.getMinPriority()}`);
		}
		if (this.cacheModels) {
			this.cacheModels.push(model);	
		}
		this.models.push(model);
	}

	insertModel(model, index) {
		if (!this._isModelAddable(model)) {
			throw new RangeError(`Can't insert "${model.getName()}" with lower priority than ${this.getMinPriority()}`);
		}
		
		const diffIndex = this._getDifferenceInModelLengths();
		if (this.cacheModels) {
			this.cacheModels.splice(index - diffIndex, 0, model);	
		}

		this.models.splice(index + 1, 0, model);
	}
	
	replaceModel(model, index) {
		if (!this._isModelAddable(model)) {
			throw new RangeError(`Can't override ${this.models[index].getName()} with "${model.getName()}" since it has a lower priority than ${this.getMinPriority()}`);
		}
		const diffIndex = this._getDifferenceInModelLengths();
		if (this.cacheModels) {
			this.cacheModels.splice(index - diffIndex, 1, model);	
		}
		this.models.splice(index + diffIndex, 1, model);
	}
	
	removeModel(model) {
		const modelIndex = this.models.indexOf(model);

		const diffIndex = this._getDifferenceInModelLengths();
		if (modelIndex > -1) { 
			if (this.cacheModels) {
				this.cacheModels.splice(modelIndex - diffIndex, 1);	
			}
			this.models.splice(modelIndex + diffIndex, 1);
		}
	}

	insertModels(models, index) {
		if (!Array.isArray(models)) {
			models = [models];
		}
		models.forEach((model, currentIndex) => this.insertModel(model, currentIndex + index));
	}
	
	replaceModels(models, index) {
		if (!Array.isArray(models)) {
			models = [models];
		}
		models.forEach((model, currentIndex) => this.replaceModel(model, currentIndex + index));
	}
	
	removeModels(models) {
		if (!Array.isArray(models)) {
			models = [models];
		}
		models.forEach((model) => this.removeModel(model));
	}


	getModels() {
		if (!this.cacheModels) {
			return this.models;
		}
		return this.cacheModels;
	}

	sortModelsByPriority() {
		if (this.models.length === 0) {
			return;
		}
		// sort by priority
		let sortedModels = this.getModels().sort((model1, model2) => {
			return model1.getPriority() - model2.getPriority();
		});
		// filter all models that are below the min priority
		sortedModels = sortedModels.filter((model) => model.getPriority() >= this.getMinPriority());

		this.setModels(sortedModels);
	}
	
	groupModelsByPriority() {
		if (this.models.length === 0) {
			return [];
		}
		
		let minPriority = this.models[0].getPriority(); 

		let maxPriority = this.models[this.models.length - 1].getPriority();
		
		const priorityList = [];
		for(let priority = minPriority; priority <= maxPriority; priority++) {
			const list = this.getModelsWithEqualPriority(priority);
			priorityList.push({
				group: list,
				startIndex: this.getModelIndex(list[0])
			});
		}
		return priorityList;
	}

	getModelsWithEqualPriority(priority) {
		return this.getModels().filter((plugin) => plugin.getPriority() === priority);
	}	
	
	_createPath(folderName) {
		const path = new Path(this.env);
		const browserBase = this.path.joinWithPath({
			pathKey: `${this.type}-browser`,
			relativePath: [folderName]
		});
		const absoluteBase = this.path.joinWithPath({
			pathKey: this.type,
			relativePath: [folderName]
		});
		path.setBase({
			browser: browserBase,
			absolute: absoluteBase
		});
		return path;
	}
	
	copy() {
		return new this.constructor(this.path, this.env, this.fs, this.resLoader, this.models);
	}

	generateManagerWithMinPriority(priority) {
		
		const manager = this.copy();
		const startIndex = this.getIndexOfModelWithPriority(priority);
		const models = this.models.slice(startIndex);

		manager.setModels(models);
		return manager;
	}

	_getDifferenceInModelLengths() {
		return this.models.length - this.getModels().length;
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
}