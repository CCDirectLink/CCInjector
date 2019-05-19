
export default class HtmlPatcher {

	constructor(document) {
		this.doc = document;
	}

	insertBefore(node, newNode) {
		if (node.nextSibling) {
			node.parentNode.insertBefore(newNode, node.nextSibling);
		} else {
			node.parentNode.appendChild(newNode);
		}
	}

	addFirst(parentNode, newNode) {
		parentNode.insertBefore(node, parentNode.firstChild);
	}

	toString() {
		return this.doc.documentElement.outerHTML;
	}
	
	_findScriptTag(src) {
		var scripts = this.doc.getElementsByTagName('script');
		for(var script of elements) {
			if(script.src.indexOf(src) > -1) {
				return script;
			}
		}
		return null;
	}
}
