
import BasicManager from './basic.js';
import ModLoader from '../loader/mod.js';
import ModModel from '../models/mod.js';

export default class ModManager extends BasicManager {
	constructor(path, env, fs, resLoader) {
		super(path, env, fs, resLoader, ModLoader);
		this.mods = [];
		this.loaded = false;
	}
	async load() {
		let modsLoaded = await super.load();
		this.mods = modsLoaded.map(({path, packageData}) => {
			return new ModModel(path, packageData);
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
			const script = document.createElement('script');
			script.type = 'module';
			script.onload = () => {
				console.log(`${mod.name} executed successfully`);
				resolve();
			};
			script.onerror = () => {
				console.log(`${mod.name} failed to load`);
				reject();
			};
			script.src = mod.path + '/' + mod.main;
			script.id = mod.name;
			document.body.appendChild(script);	
		});
	}
}