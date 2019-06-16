import BasicLoader from './basic.js';

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
		let hasDependencyChecker = false;
		for (const pluginFolder of this.plugins) {
			let pathToPluginScript = this.path.joinWithPath({
				pathKey: 'plugins',
				relativePath: [pluginFolder, 'plugin.js']
			});


			if (this.fs.existsSync(pathToPluginScript)) {
				try {
					pathToPluginScript = this.path.joinWithPath({
						pathKey: 'plugins-browser',
						relativePath: [pluginFolder, 'plugin.js']
					});
					const pluginModule = await import(pathToPluginScript);
					const data = {
						folderName : pluginFolder,
						pluginModule
					};
					

					// dependencyChecker has to be first
					if (!hasDependencyChecker && pluginModule.dependencyChecker) {
						loadedPlugins.unshift(data);
						hasDependencyChecker = true;
					} else {
						loadedPlugins.push(data);
					}
					
				} catch (e) {
					console.log(`Failed to load "${pluginFolder}". Relevant error:`);
					console.log(e);
				}
			} else {
				console.log(`${pluginFolder} does not have the proper format`);
			}
			
			
		}
		

		return loadedPlugins;
	}

}