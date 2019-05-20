import BasicLoader from './basic.js';
import PluginModel from '../models/plugin.js';
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
			const pluginPath = this.path.joinWithPath({
				pathKey : 'plugins-browser',
				relativePath : [pluginFolder, 'plugin.js']
			});
			try {
				const result = await import(pluginPath);
				const plugin = new PluginModel(result);
				loadedPlugins.push(plugin);
			} catch (e) {
				console.log(`Failed to load "${pluginPath}"`);
			}
		}
		return loadedPlugins;
	}

}