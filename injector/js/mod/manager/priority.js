export default class PriorityManager {
	constructor(minPriority = -Infinity, maxPriority = Infinity) {
		this.minPriority = minPriority
		this.maxPriority = maxPriority;
	}

	setMinPriority(priority) {
		this.minPriority = priority;
	}
	
	getMinPriority() {
		return this.minPriority
	}

	setMaxPriority(priority){
		this.maxPriority = priority;
	}

	getMaxPriority() {
		return this.maxPriority;
	}
}