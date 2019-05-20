export default class Environment {
	constructor() {}
	
	isDev() {
		if (this.isNwJs()) {
			return process.versions['nw-flavor'] === 'sdk';
		}
		return false;
	}
	isNode() {
		return typeof process !== 'undefined' && 
		              !!process.versions['node'];
	}
	isNwJs() {
		return this.isNode() && 
		       !!process.versions['nw'];
	}
	isBrowser() {
		return typeof window !== 'undefined' && typeof navigator !== 'undefined'; 
	}
}