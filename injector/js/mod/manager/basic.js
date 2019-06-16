import Path from '../../path/path.js';
import BasicLoader from '../loader/basic.js';
import BasicModel from '../models/basic.js';

export default class BasicManager {
	constructor() {
		this.type = 'basic';
		this.path = null;
		this.env = null;
		this.resLoader = null;

		this.loader = null;
		this.phaseManager = null;

		this.models = [];
	}

	setPhaseManager(phaseManager) {
		this.phaseManager = phaseManager;
	}
	
	setType(type) {
		this.type = type;
	}

	setPath(path) {
		this.path = path;
	}
	
	setEnv(env) {
		this.env = env;
	}

	setFs(fs) {
		this.fs = fs;
	}
	
	setResourceLoader(resLoader) {
		this.resLoader = resLoader;
	}
	
	initLoader(Loader = BasicLoader) {
		this.loader = new Loader(this.path, this.env, this.fs, this.resLoader);
	}

	createModel(modelData, ModelClass = BasicModel) {
		return new ModelClass(modelData);
	}
	
	setModels(models) {
		this.models = models;
	}

	async init() {
		return this.loader.init();
	}
	async load() {
		return this.loader.load();
	}
	async run() {}

	addModel(model) {
		this.models.push(model);
	}

	insertModel(model, index) {
		this.models.splice(index + 1, 0, model);
	}
	
	replaceModel(model, index) {
		this.models.splice(index + diffIndex, 1, model);
	}
	
	removeModel(model) {
		const modelIndex = this.models.indexOf(model);
		this.models.splice(modelIndex, 1);
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
		return this.models;
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
		const copyInstance = new this.constructor();
		copyInstance.setType(this.type);
		copyInstance.setEnv(this.env);
		copyInstance.setPath(this.path);
		copyInstance.setFs(this.fs);
		copyInstance.setResourceLoader(this.resLoader);
		copyInstance.setPhaseManager(this.phaseManager);

		return copyInstance;
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

	getModelsInCurrentPhase() {
		return this.models.filter(model =>{
			const modelData = model.getModelConfig();
			const phaseFilter = this.phaseManager.getCurrentPhaseFilter();
			return phaseFilter(modelData);
		});
	}
	
	executeScript(src,type = 'module', name = '') {
		return new Promise((resolve, reject) => {

			const script = document.createElement('script');
			script.type = type;
			script.onload = () => {
				resolve();
			};
			script.onerror = () => {
				reject();
			};
			script.src = src;
			if (name) {
				script.id = name;
			}
			document.body.appendChild(script);	
		});		
	}
}