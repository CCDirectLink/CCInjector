
import BasicLoader from './basic.js';
import ModModel from '../models/mod.js';
import Path from '../../path/path.js';
export default class ModLoader extends BasicLoader {

	addGlobalPath() {
		this.path.add('mods', 'assets/mods');
	}

	async init() {
		this.mods = await this.getAll('mods');
	}
	async load() {
		// this will return mod models 
		// for the mod manager to handle
		let loadedMods = [];
		for (const modsFolder of this.mods) {
			try {
				// load package 
				let packagePath = this.path.joinWithPath({
					pathKey: 'mods',
					relativePath: [modsFolder, 'package.json']
				});
				let packageData = await this.resLoader.load(packagePath , {json: true});
				loadedMods.push({
					folderName : modsFolder,
					packageData
				});
			} catch (e) {
				console.log(`Failed to load "${modsFolder}"`);
			} 
		}
		return loadedMods;
	}
}