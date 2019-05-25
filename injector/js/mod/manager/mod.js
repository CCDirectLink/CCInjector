
import BasicManager from './basic.js';
import ModLoader from '../loader/mod.js';
import ModModel from '../models/mod.js';

export default class ModManager extends BasicManager {
	constructor(path, env, fs, resLoader) {
		super(path, env, fs, resLoader, ModLoader, ModModel);
		this.mods = [];
		this.loaded = false;
		this.setType('mods');
	}
	async load() {
		let modsLoaded = await super.load();
		modsLoaded.forEach(({folderName, packageData}) => {
			const model = super.createModel(packageData);
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
		for (const mod of this.mods) {
			try {
				await this._loadMod(mod);
			} catch (e) {
				console.log(`Could not load "${mod.name}"`);
			}
		}
	}
	async _loadMod(mod) {
		return new Promise((resolve, reject) => {
			const main = mod.getMain();
			if (!main) {
				resolve();
			}

			const script = document.createElement('script');
			script.type = 'module';
			script.onload = () => {
				console.log(`${mod.getName()} executed successfully`);
				resolve();
			};
			script.onerror = () => {
				console.log(`${mod.getName()} failed to load`);
				reject();
			};
			let modSrc = mod.path.joinWithPath({
				pathKey: 'base-browser',
				relativePath: main
			});
			script.src = modSrc;
			script.id = mod.getName();
			document.body.appendChild(script);	
		});
	}
}