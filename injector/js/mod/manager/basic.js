import Path from '../../path/path.js';
import BasicLoader from '../loader/basic.js';
import BasicModel from '../models/basic.js';
export default class BasicManager {
	constructor(path, env, fs, resLoader, Loader = BasicLoader, Model = BasicModel) {
		this.path = path;
		this.env = env;
		this.fs = fs;
		this.resLoader = resLoader;

		this.loader = new Loader(path, env, fs, resLoader);
		this.model = Model;
		this.models = [];
		this.type = 'basic';
	}
	setType(type) {
		this.type = type;
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

	createModel(modelData) {
		return new this.model(modelData);
	}
	addModel(model) {
		this.models.push(model);
	}

	getModelIndex(model) {
		return this.getModels().indexOf(model);
	}
	
	insertModel(model, index) {
		this.models.splice(index, 0, model);
	}
	
	replaceModel(model, index) {
		this.models.splice(index, 1, model);
	}
	
	removeModel(model) {
		const modelIndex = this.models.indexOf(model);

		if (modelIndex > -1) {
			this.models.splice(modelIndex, 1);
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
		return new this.constructor(this.path, this.env, this.fs, this.resLoader);
	}
}