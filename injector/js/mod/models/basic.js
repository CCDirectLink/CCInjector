

export default class BasicModel {
	constructor(modelModule) {
		this.name = modelModule.name || 'No name';
		this.description = modelModule.description || 'No description';		
		this.version = modelModule.version || 'v0.0.0';
		this.dependencies = modelModule.dependencies || {};
		this.path = null;
	}
	setPath(path) {
		this.path = path;
	}
	getVersion() {
		return this.version;
	}
	getDescription() {
		return this.description;
	}
	getName() {
		return this.name;
	}
	getDependencies() {
		return this.dependencies;
	}
	getPath() {
		return this.path;
	}
}