

export default class ModModel {
	constructor(path, modPackage) {
		this.name = modPackage.name;
		this.description = modPackage.description;
		this.main = modPackage.main;
		this.path = path;
	}
}