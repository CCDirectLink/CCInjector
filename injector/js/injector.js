import HtmlPatcher from './html-patcher/html-patcher.js';
import ResourceLoader from './resource-manager/resource-loader.js';
import ResourceCreator from './resource-manager/resource-creator.js';
import Path from './path.js';

export default class Injector {

	constructor(document) {
		this.debug = true;
		this.htmlPatcher = new HtmlPatcher();
		this.path = new Path();
		
		this.resLoader = new ResourceLoader(this.path);
		this.resCreator = new ResourceCreator(this.path);

		this.gameWindow = document.getElementById('game-window');
		this.init();
	}
	
	async init() {
		await this.inject();
	}
	
	async inject() {
		let customHtml = 'injector/node-webkit.html';

		if(this.debug || !this.resLoader.exist(customHtml)) {
			await this.patchWithDependencies();
			let patchedHtml = this.htmlPatcher.toString();
			this.resCreator.create(customHtml, patchedHtml);
		}
		this.gameWindow.src = 'node-webkit.html';
	}
	
	async patchWithDependencies() {
		let baseHtml = 'assets/node-webkit.html';
		
		let doc = await this.resLoader.load(baseHtml , {html : true});
		this.htmlPatcher.addHtmlDocument(doc);
		
		const basePath = this.path.join('/assets/');
		this.htmlPatcher.setBaseUrl(basePath);
		
		this.htmlPatcher.setPivot('script', 'src', 'js/game.compiled.js');
		
		let preLoad = this.htmlPatcher.createElement('script');
		preLoad.src = '';
		preLoad.id = 'preload';
		this.htmlPatcher.insertBefore(preLoad);
		
		let preInit = this.htmlPatcher.createElement('script');
		preInit.src = '';
		preInit.id = 'pre-init';
		this.htmlPatcher.insertAfter(preInit);
	}
}