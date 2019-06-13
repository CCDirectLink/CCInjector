
import BasicManager from './basic.js';
import ModLoader from '../loader/mod.js';
import ModModel from '../models/mod.js';

export default class ModManager extends BasicManager {
	constructor(path, env, fs, resLoader, models = []) {
		super(path, env, fs, resLoader, models, ModLoader, ModModel);
		this.loaded = false;
		this.setType('mods');
	}
	async load() {
		let modsLoaded = await super.load();
		modsLoaded.forEach(({folderName, packageData}) => {
			const model = this.createModel(packageData);
			this.addModel(model);

			const modPath = this._createPath(folderName);
			model.setPath(modPath);
			
		});
		this.loaded = true;
	}
	
	getMods() {
		if (!this.loaded) {
			return [];
		}
		return this.mods;
	}
	
	async run() {
		for (const mod of this.getModels()) {
			try {
				await this._loadMod(mod);
			} catch (e) {
				console.log(`Could not load "${mod.name}"`);
			}
		}
	}
	async _loadMod(mod) {
		const main = mod.getMain();
		if (!main) {
			return;
		}
		let modSrc = mod.path.joinWithPath({
			pathKey: 'base-browser',
			relativePath: main
		});
		try {
			await this.executeScript(modSrc, 'module', mod.getName());
			console.log(`${mod.getName()} executed successfully`);	
		} catch (e){
			console.log(`${mod.getName()} failed to load`);
		}
	}
}