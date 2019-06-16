import BasicType from '../basic.js';
export default class BasicDependency extends BasicType {
	constructor(model, index, found = true, visited = false, enabled = false) {
		super(model, index);
		
		this.found = found;
		this.visited = visited;
		this.enabled = enabled;

		this.referenceCount = 1;
		this.isCircular = false;
		this.reason = '';
	}
	addChild(key, value) {
		if (!this.getEnabled()) {
			value.disable();
		}
		super.addChild(key, value);
	}
	
	addReferenceCount() {
		++this.referenceCount;
	}
	getReferenceCount() {
		return this.referenceCount;
	}

	setVisited() {
		this.visited = true;
	}
	setCircular() {
		this.isCircular = true;
	}
	disable() {
		const isEnabled = this.getEnabled();
		this.enabled = false;
		if(isEnabled) {
			for (const [name, instance] of this.children) {
				instance.disable();
			}
		}
	}
	getVisited() {
		return this.visited;
	}
	getFound() {
		return this.found;
	}

	getEnabled() {
		return this.enabled && this.referenceCount === 1;
	}
	getIfCirculuar() {
		return this.isCircular;
	}

	setDisableReason(reason) {
		this.reason = reason;
	}

	getDisableReasion() {
		return this.reason;
	}

}