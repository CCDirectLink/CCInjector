import HtmlPatcher from './html/patcher.js';
import ResourceLoader from './resource/loader.js';
import ResourceCreator from './resource/creator.js';
import Path from './path/path.js';
import DOM from './dom/dom.js';
import Env from './environment/environment.js';
import FileSystem from './filesystem-manager/fs.js';

export default class Injector {

	constructor(document) {
		let env = new Env();
		this.debug = env.isDev();

		this.htmlPatcher = new HtmlPatcher();
		this.fs = new FileSystem(env);
		this.path = new Path(env);
		this.resLoader = new ResourceLoader(this.path, env);
		this.resCreator = new ResourceCreator(this.path, env);

		this.gameWindow = document.getElementById('game-window');

		this.init();
	}
	
	async init() {
		this.path.add('injector-scripts','injector/js');
		await this.inject();
	}
	
	async inject() {
		let customHtmlPath = 'injector/node-webkit.html';
		
		let createCustomHtmlFile = this.debug || (await this.fs.exists(customHtmlPath));
		
		if(createCustomHtmlFile) {
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

		// loading order
		this.htmlPatcher.markLastScriptAsModule();

		// this will
		let preInit = this.htmlPatcher.createScriptTag();
		preInit.type = 'module';
		
		preInit.src = this.path.join('/mod/manager.js', 'injector-scripts-browser');
		preInit.id = 'mod-manager';

		this.htmlPatcher.insertAfterPivot();

	}
}