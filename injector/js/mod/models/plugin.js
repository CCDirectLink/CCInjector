import Path from "../../path/path.js";


export default class PluginModel {
	constructor(pluginModule) {
		this.name = pluginModule.name;
		this.description = pluginModule.description || "No description";
		this.priority = 0;
		this.setPriority(pluginModule.priority);
		this.run = pluginModule.run || (() => {
			console.log(`${this.name} - ${this.description}`);
		});
		
		this.path = null;

	}
	setPath(path) {
		this.path = path;
	}
	getPath() {
		return this.path;
	}
	setPriority(priority = 'LOW') {
		switch (priority) {
			case 'SYSTEM':
				this.priority = -1;
				break;
			case 'HIGH':
				this.priority = 0;
				break;
			case 'MEDIUM':
				this.priority = 1;
				break;
			case 'LOW':
			default:
				this.priority = 2;
				break;
		}
	}
	getPriority() {
		return this.priority;
	}
}