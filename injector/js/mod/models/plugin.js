import PriorityModel from './priority.js';

export default class PluginModel extends PriorityModel {
	constructor(pluginModule) {
		super(pluginModule, 'plugin');
		this.instance = null;
		this.createInstance(pluginModule.Class);
	}

	// override because it should always run
	
	createInstance(Class) {
		if (Class) {
			this.instance = new Class();
		} else {
			console.log(`${this.getProperty('name')} does not have a class associated with it.`);
		}
	}

	getInstance() {
		return this.instance;
	}
	
	hasPriority() {
		return true;
	}
}