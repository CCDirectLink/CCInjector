import PriorityModel from './priority.js';

export default class ModModel extends PriorityModel {
	constructor(modModule) {
		super(modModule, 'mod');
	}

	getDependencies() {
		let modDependencies = this.getProperty('ccmodDependencies');
		
		if (!modDependencies) {
			return super.getDependencies();
		}
		
		return modDependencies;
	}
}