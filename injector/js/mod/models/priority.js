import BasicModel from './basic.js';

export default class PriorityModel extends BasicModel {
	constructor(modelModule, type) {
		super(modelModule, type);
	}	
	
	hasPriority(priorityName) {
		return !!this.getProperty(priorityName);
	}
}