
export default class PriorityModel {
	constructor(priority = 0) {
		this.priority = priority;
	}

	setPriority(priorityNumber) {
		this.priority = priorityNumber;
	}
	
	getPriority() {
		return this.priority;
	}
	
	hasLowerPriorityThan(model) {
		return this.getPriority() < model.getPriority();
	}
	
	hasGreaterPriorityThan(model) {
		return this.getPriority() > model.getPriority();
	}

	hasEqualPriorityWith(model) {
		return this.getPriority() === model.getPriority();
	}
	
}