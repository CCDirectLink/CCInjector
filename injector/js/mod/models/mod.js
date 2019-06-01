
import BasicModel from './basic.js';
export default class ModModel extends BasicModel {
	constructor(modModule) {
		super(modModule, 'mod');
		this.main = modModule.main;
	}
	setPriority(priority = 'LOW') {
		let priorityNumber;
		switch (priority) {
			case 'preload':
				priorityNumber = -1;
				break;
			case 'default':
			default:
				priorityNumber = 0;
				break;
		}
		super.setPriority(priorityNumber);
	}

	getMain() {
		return this.main;
	}
}