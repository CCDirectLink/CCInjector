
export default class HtmlPatcher {

	constructor() {
		this.dom = null;
		this.tempElement = null;
	}
	
	addDOM(dom) {
		this.dom = dom;
	}
	
	setBaseUrl(url) {
		this.dom.addBaseUrl(url);
	}
	
	createScriptTag() {
		this.tempElement = this.dom.createScript();
		return this.tempElement;
	}
	
	insertBeforePivot() {
		this.dom.insertBefore(this.tempElement);
	}
	
	insertAfterPivot() {
		this.dom.insertAfter(this.tempElement);
	}

	setPivotScript(name) {
		const script = this.dom.findScriptBySrc(name);
		this.dom.setPivotElement(script);
	}

	markLastScriptAsModule() {
		let lastScript = this._getLastScript();
		lastScript.type = 'module';
	}
	_getLastScript() {
		let scripts = this.dom.findAllScripts();
		return scripts[scripts.length - 1];
	}
	export() {
		return this.dom.toString();
	}
}
