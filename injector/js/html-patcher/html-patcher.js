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

	export() {
		return this.dom.toString();
	}
}
