
import BasicModel from './basic.js';
export default class ModModel extends BasicModel {
	constructor(modModule) {
		super(modModule);
		this.main = modModule.main;
	}
	getMain() {
		return this.main;
	}
}