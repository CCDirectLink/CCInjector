import BasicDependency from './basic.js';

export default class NotFoundDependency extends BasicDependency {
	constructor(model, index = 0) {
		super(model, index, false, true , false);
		this.setDisableReason(`Could not find "${model.getPackageName()}"`);
	}
} 