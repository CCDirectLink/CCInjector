export default class HtmlPatcher {

	constructor() {
		this.doc = null;
		this.pivotElement = null;
	}
	addHtmlDocument(doc) {
		this.doc = doc;
	}
	createElement(type, opts = {}) {
		if (this.doc) {
			return this.doc.createElement(type, opts);
		}
		return null;
	}
	setBaseUrl(url) {
		let base = this.doc.getElementsByTagName('base');
		
		if (!base.length) {
			base = this.doc.createElement('base');
			const head = this.doc.getElementsByTagName('head');
			this.addFirst(head[0],base);
		} else {
			base = base[0];
		}
		base.setAttribute('href', url);
	}

	setPivot(type, prop, toMatch) {
		this.pivotElement = this._findElement(type, prop, toMatch);
		return !!this.pivotElement;
	}

	addFirst(parentNode, newNode) {
		parentNode.insertBefore(newNode, parentNode.firstChild);
	}

	insertBefore(newNode) {
		let node = this.pivotElement;
		if (!node) {
			return null;
		}
		if (node) {
			node.parentNode.insertBefore(newNode, node);
		}
	}

	insertAfter(newNode) {
		let node = this.pivotElement;
		if (!node) {
			return null;
		}
		if (node.nextSibling) {
			node.parentNode.insertBefore(newNode, node.nextSibling);
		} else {
			node.parentNode.appendChild(newNode);
		}		
	}

	toString() {
		if (!this.doc) {
			return '';
		}
		return this.doc.documentElement.outerHTML;
	}
	
	_findElement(type, prop, toMatch) {
		if (this.doc) {
			var elements = this.doc.getElementsByTagName(type);
			for(var element of elements) {
				if(element[prop].indexOf(toMatch) > -1) {
					return element;
				}
			}
		}
		return null;
	}
}
