import HtmlPatcher from './html-patcher/html-patcher.js';
import ResourceLoader from './resource-manager/resource-loader.js';
import ResourceCreator from './resource-manager/resource-creator.js';
import Path from './path/path.js';
import DOM from './dom/dom.js';
import Env from './environment/environment.js';
const fs = require('fs');

export default class Injector {

	constructor(document) {
		let env = new Env();
		this.debug = env.isDev();

		this.htmlPatcher = new HtmlPatcher();

		this.path = new Path(env);
		
		this.resLoader = new ResourceLoader(this.path, env);
		this.resCreator = new ResourceCreator(this.path, env);

		this.gameWindow = document.getElementById('game-window');

		this.init();
	}
	
	async init() {
		await this.inject();
	}
	
	async inject() {
		let customHtmlPath = 'injector/node-webkit.html';

		if(this.debug || !fs.existsSync(customHtmlPath)) {
			await this.patchWithDependencies();
			let patchedHtml = this.htmlPatcher.export();
			await this.resCreator.create(customHtmlPath, patchedHtml, 'utf8');
		}
		this.gameWindow.setAttribute('src','node-webkit.html');
	}
	
	async patchWithDependencies() {
		let baseHtml = 'assets/node-webkit.html';
		
		const doc = await this.resLoader.load(baseHtml , {html : true});
		const dom = new DOM(doc);
		this.htmlPatcher.addDOM(dom);
		
		const basePath = this.path.join('/assets/');
		this.htmlPatcher.setBaseUrl(basePath);
		
		this.htmlPatcher.setPivotScript('js/game.compiled.js');
		
		let preInit = this.htmlPatcher.createScriptTag();
		preInit.src = '';
		preInit.id = 'pre-init';

		this.htmlPatcher.insertAfterPivot();
	}
}