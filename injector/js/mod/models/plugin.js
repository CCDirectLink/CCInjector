

export default class PluginModel {
	constructor(pluginModule) {
		this.name = pluginModule.name;
		this.description = pluginModule.description || "No description";
		this.run = pluginModule.run || (() => {
			console.log(`${this.name} - ${this.description}`);
		});
	}
}