
import BasicManager from './basic.js';
import ModLoader from '../loader/mod.js';
import ModModel from '../models/mod.js';

export default class ModManager extends BasicManager {
	constructor() {
		super();
		this.loaded = false;
		this.setType('mods');
	}

	initLoader() {
		super.initLoader(ModLoader);
	}

	createModel(modelData) {
		return super.createModel(modelData, ModModel);
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
		const phaseName = this.phaseManager.getCurrentPhase();
		for (const mod of this._getModelsIterator()) {
		
			if (mod.hasPriority(phaseName)) {
				
				const prioritySrc = mod.getProperty(phaseName);
				const modName = mod.getProperty('name');
				try {
					await this._loadMod(prioritySrc, mod, modName);
				} catch (e) {
					console.log(`Could not load "${modName}"`);
				}
			}
			
		}
	}
	
	async _loadMod(scriptSrc, mod, id) {
		if (!scriptSrc) {
			return;
		}
		let modSrc = mod.path.joinWithPath({
			pathKey: 'base-browser',
			relativePath: scriptSrc
		});
		let type = 'application/javascript';
		if (mod.getProperty('module') === true) {
			type = 'module';
		}
		 
		try {
			await this.executeScript(modSrc, type, id);
			console.log(`${id} executed successfully`);	
		} catch (e){
			console.log(`${id} failed to load`);
		}
	}
}