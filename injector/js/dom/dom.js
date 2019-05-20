

export default class DOM {
	constructor(document) {
		this.document = document;
		this.pivotElement = null;
	}

	addBaseUrl(url) {
		let base = this.findFirstTagElement('base');
		
		if (!base) {
			const head = this.findFirstTagElement('head');
			base = this.document.createElement('base');
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
		}
	}
	
	createScript() {
		return this.document.createElement('script');
	}
	
	insertBefore(newNode) {
		let node = this.pivotElement;
		
		if (!node) {
			return null;
		}

		const parentNode = this.getParentNode(node);
		
		if (node) {
			parentNode.insertBefore(newNode, node);
		}
	}
	
	insertAfter(newNode) {
		const node = this.pivotElement;
		
		if (!node) {
			return null;
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

	findAllScripts() {
		return Array.from(this.document.getElementsByTagName('script'));
	}
	toString() {
		if (!this.document) {
			return '';
		}
		return this.document.documentElement.outerHTML;
	}

}