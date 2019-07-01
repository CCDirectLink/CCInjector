import PriorityModel from './priority.js';
import MockPlugin from './mock-plugin.js';


export default class PluginModel extends PriorityModel {
	constructor(pluginModule) {
		super(pluginModule, 'plugin');
		this.instance = null;
		this.Class = pluginModule.Class;
	}

	/**
	 * 
	 * @param {Object} dependencies
	 * @returns {MockPlugin} - Each field isn't necessarily returned 
	 */
	createInstance(dependencies) {
		
		if (!this.Class) {
			console.log(`${this.getProperty('name')} does not have a class associated with it.`);
		} else if (this.instance === null) {
			this.instance = new this.Class(dependencies);
		}

		return this.instance;
	}

	/**
	 * 
	 * @returns {MockPlugin} - Each field isn't necessarily returned
	 */
	getInstance() {
		return this.instance;
	}
	
	/**
	 * 
	 * @returns {true}
	 */
	hasPriority() {
		return true;
	}
}