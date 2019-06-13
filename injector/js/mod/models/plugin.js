import BasicModel from './basic.js';

export default class PluginModel extends BasicModel {
	constructor(pluginModule) {
		super(pluginModule, 'plugin');
		this.priority = 0;
		this.setPriority(pluginModule.priority);
		this.run = pluginModule.run || (() => {
			console.log(`${this.name} - ${this.description}`);
		});
	}
	
	setPriority(priority = 'LOW') {
		let priorityNumber;
		switch (priority) {
			case 'DEPENDENCY_CHECKER':
				priorityNumber = -2;
				break;
			case 'SYSTEM':
				priorityNumber = -1;
				break;
			case 'HIGH':
				priorityNumber = 0;
				break;
			case 'MEDIUM':
				priorityNumber = 1;
				break;
			case 'LOW':
			default:
				priorityNumber = 2;
				break;
		}
		super.setPriority(priorityNumber);
	}

}