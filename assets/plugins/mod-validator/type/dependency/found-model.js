import BasicDependency from './basic.js';

export default class ModelDependency extends BasicDependency {
	constructor(model, index = 0) {
		super(model, index, true, false, true);
	}
}