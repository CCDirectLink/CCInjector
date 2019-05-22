import BasicModel from './basic.js';

export default class PluginModel extends BasicModel {
	constructor(pluginModule) {
		super(pluginModule);
		this.priority = 0;
		this.setPriority(pluginModule.priority);
		this.run = pluginModule.run || (() => {
			console.log(`${this.name} - ${this.description}`);
		});
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
	
	hasLowerPriorityThan(plugin) {
		return this.getPriority() > plugin.getPriority();
	}
	
	hasEqualPriorityWith(plugin) {
		return this.getPriority() === plugin.getPriority();
	}
	
	hasGreaterPriorityThan(plugin) {
		return this.getPriority() < plugin.getPriority();
	}
}