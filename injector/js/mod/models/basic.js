export default class BasicModel {
	constructor(modelModule, type = "basic") {	
		this.path = null;
		this.type = type;

		this.modelModule = modelModule;
		this.description = modelModule.description || 'No description';		
		this.packageName = modelModule.packageName || this._toPackageName();
	}
	
	getConfig() {
		return this.modelModule || {};
	}

	getProperty(propName) {
		return this.getConfig()[propName];
	}
	
	getDependencies() {
		return this.getProperty('dependencies');
	}
	getType() {
		return this.type;
	}
	
	setPath(path) {
		this.path = path;
	}
	
	getPath() {
		return this.path;
	}

	getPackageName() {
		return this.packageName;
	}
	
	_toPackageName() {
		const name = this.getProperty('name');
		if (name) {
			return name.toLowerCase().trim().split(/\s+/).join("-");
		}
		return '';
	}
}