

export default class DOM {
	constructor(document) {
		this.document = document;
		this.pivotElement = null;
	}

	addBaseUrl(url) {
		let base = this.findFirstTagElement('base');
		
		if (!base) {
			base = this.document.createElement('base');
			const head = this.findFirstTagElement('head');
			this.insertFirstElement(head, base);
		}

		base.setAttribute('href', url);
	}

	setPivotElement(element) {
		this.pivotElement = element;
	}
	
	findFirstTagElement(type) {
		const elements = this.document.getElementsByTagName(type);
		return elements[0] || null;
	}

	insertFirstElement(pivot, newNode) {
		const node = pivot || this.pivotElement;
		if (node) {
			const parentNode = this.getParentNode(node);
			if (parentNode.firstChild) {
				parentNode.insertBefore(newNode,parentNode.firstChild);
			} else {
				parentNode.appendChild(newNode);
			}
		} else {
			throw new TypeError(`Pivot Element must be set.`);
		}
	}
	
	createScript() {
		if (!this.document) {
			throw new ReferenceError(`Can't create a script when no document has been set.`);
		}
		return this.document.createElement('script');
	}
	
	insertBefore(newNode) {
		let node = this.pivotElement;
		
		if (!node) {
			throw new TypeError(`No pivot element has been set.`);
		}

		const parentNode = this.getParentNode(node);
		
		parentNode.insertBefore(newNode, node);
	}
	
	insertAfter(newNode) {
		const node = this.pivotElement;
		
		if (!node) {
			throw new ReferenceError(`First argument must be set to a valid element.`);
		}
		
		const parentNode = this.getParentNode(node);

		if (node.nextSibling) {
			parentNode.insertBefore(newNode, node.nextSibling);
		} else {
			parentNode.appendChild(newNode);
		}		
	}

	getParentNode(node) {
		if (!node || !node.parentNode) {
			return this.document;
		} 
		return node.parentNode;
	}
	
	findScriptBySrc(src) {
		const scripts = this.document.getElementsByTagName('script');
		for (const script of scripts) {
			if (script.src.indexOf(src) > -1) {
				return script;
			}
		}
		return null;
	}

	toString() {
		if (!this.document) {
			return '';
		}
		return this.document.documentElement.outerHTML;
	}

}