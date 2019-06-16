

export default class BasicType {
	constructor(model, startIndex = 0) {
		this.model = model;
		this.startIndex = startIndex;
		this.children = new Map();
	}
	getStartIndex() {
		return this.startIndex;
	}
	
	incrementStartIndex() {
		this.children.forEach((child) => {
			child.incrementStartIndex();
		});
		++this.startIndex;
	}
	
	getModel() {
		return this.model;
	}
	
	addChild(key, value) {
		this.children.set(key, value);
	}
	
	getChild(key) {
		return this.children.get(key);
	}

	getChildren() {
		return this.children;
	}
}