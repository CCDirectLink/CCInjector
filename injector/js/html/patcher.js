
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
	
	setPivotElement(element) {
		this.dom.setPivotElement(element);
	}

	insertBeforePivot() {
		this.dom.insertBefore(this.tempElement);
	}
	findElementById(id) {
		return this.dom.findElementById(id);
	}

	insertAfterPivot() {
		this.dom.insertAfter(this.tempElement);
	}

	setPivotScript(name) {
		const script = this.dom.findScriptBySrc(name);
		if (!script) {
			throw new ReferenceError(`Could not find script with src "${name}"`);
		}
		this.dom.setPivotElement(script);
	}

	removeElement(element) {
		if (this.dom.pivotElement === element) {
			this.dom.setPivotElement(null);
		}
		this.dom.removeElement(element);
	}
	
	export() {
		return this.dom.toString();
	}
}
