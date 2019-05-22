import BasicLoader from './basic.js';
import PluginModel from '../models/plugin.js';
import Path from '../../path/path.js';

export default class PluginLoader extends BasicLoader {

	addGlobalPath() {
		this.path.add('plugins', 'assets/plugins');
	}
	async init() {
		this.plugins = await this.getAll('plugins');
		return !!this.plugins.length;
	}
	async load() {
		let loadedPlugins = [];
		for (const pluginFolder of this.plugins) {
			const pathToPluginScript = this.path.joinWithPath({
				pathKey: 'plugins-browser',
				relativePath: [pluginFolder, 'plugin.js']
			})
			try {
				const pluginModule = await import(pathToPluginScript);
				loadedPlugins.push({
					folderName : pluginFolder,
					pluginModule
				});
			} catch (e) {
				console.log(`Failed to load "${pluginFolder}". Relevant error:`);
				console.log(e);
			}
		}
		return loadedPlugins;
	}

}