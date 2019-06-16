
export default class PhaseModel {
	constructor(name) {
		this.name = name;
		this.filter = () => {return false};
		this.callbacks = [];
	}

	setFilter(filter) {
		this.filter = filter;
	}

	getFilter() {
		return this.filter;
	}

	addCallback(cb) {
		this.callbacks.push(cb);
	}

	removeCallback(cb) {
		const cbIndex = this.callbacks.indexOf(cb);
		this.callbacks.splice(cbIndex, 1);
	}

	async trigger() {
		for (const cb of this.callbacks) {
			await cb(this.name);
		}
	}

}