

export default class ModModel {
	constructor(path, modPackage) {
		this.name = modPackage.name;
		this.description = modPackage.description;
		this.main = modPackage.main;
		this.path = path;
	}
	execute() {
		return new Promise((resolve, reject) => {
			console.log(`Silly dom addition of  ${this.name}.`);
			const script = document.createElement('script');
			script.type = 'module';
			script.onload = () => {
				console.log(`${this.name} executed successfully`);
				resolve();
			};
			script.src = this.path + '/' + this.main;
			script.id = this.name;
			document.body.appendChild(script);	
		});
		
	}
}