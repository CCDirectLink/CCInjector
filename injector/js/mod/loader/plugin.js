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
			const pluginPath = new Path(this.env);
			const pluginBrowserBase = this.path.joinWithPath({
				pathKey: 'plugins-browser',
				relativePath: [pluginFolder]
			});
			const pluginAbsoluteBase = this.path.joinWithPath({
				pathKey: 'plugins',
				relativePath: [pluginFolder]
			});
			pluginPath.setBase({
				browser: pluginBrowserBase,
				absolute: pluginAbsoluteBase
			});
			const pathToPlugin = pluginPath.joinWithPath({
				pathKey: 'base-browser',
				relativePath: ['plugin.js']
			});
			try {
				const result = await import(pathToPlugin);
				const plugin = new PluginModel(result);
				plugin.setPath(pluginPath);
				loadedPlugins.push(plugin);
			} catch (e) {
				console.log(`Failed to load "${pathToPlugin}". Relevant error:`);
				console.log(e);
			}
		}
		return loadedPlugins;
	}

}