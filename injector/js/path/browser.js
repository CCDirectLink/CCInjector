


export default class BrowserPath {
	constructor() {

	}
	
	join() {
		const fullPath = Array.from(arguments).join('/');
		try {
			const url =  new URL(fullPath);
			return url.href;
		} catch (e) {
			// invalid url
			throw new Error(`Can't join invalid url.`);
		}
	}
}