

export default class BasicModel {
	constructor(modelModule, type = "basic") {
		this.name = modelModule.name || 'No name';
		this.description = modelModule.description || 'No description';		
		this.version = modelModule.version || 'v0.0.0';
		this.dependencies = modelModule.dependencies || {};
		this.packageName = modelModule.packageName || this._toPackageName();
		this.path = null;
		this.type = type;
	}
	getType() {
		return this.type;
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

	getPackageName() {
		return this.packageName;
	}
	
	_toPackageName() {
		return this.name.toLowerCase().trim().split(/\s+/).join("-");
	}
}