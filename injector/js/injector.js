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
		this.debug = false;

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
		let customHtmlPath = this.path.joinWithPath({
			pathKey: 'base', 
			relativePath: 'injector/node-webkit.html'
		});
		
		let createCustomHtmlFile = this.debug || (await this.fs.exists(customHtmlPath));
		
		if(createCustomHtmlFile) {
			await this.patchWithDependencies();
			let patchedHtml = this.htmlPatcher.export();
			await this.resCreator.create(customHtmlPath, patchedHtml, 'utf8');
		}

		this.gameWindow.setAttribute('src','node-webkit.html');
	}
	
	async patchWithDependencies() {
		let baseHtml = this.path.joinWithPath({
			pathKey: 'base', 
			relativePath: 'assets/node-webkit.html'
		});
		
		const doc = await this.resLoader.load(baseHtml , {html : true});
		const dom = new DOM(doc);
		this.htmlPatcher.addDOM(dom);
		
		const basePath = this.path.joinWithPath({
			pathKey : 'base', 
			relativePath : '/assets/'
		});
		this.htmlPatcher.setBaseUrl(basePath);
		
		this.htmlPatcher.setPivotScript('js/game.compiled.js');

		let hookOnloadScript = this.htmlPatcher.createScriptTag();
		hookOnloadScript.src = this.path.joinWithPath({
			pathKey: 'injector-scripts',
			relativePath: 'onload-hijacker.js'
		});
		this.htmlPatcher.insertBeforePivot();

		// this will inject the mod manager
		let modLoaderScript = this.htmlPatcher.createScriptTag();
		modLoaderScript.type = 'module';
		
		modLoaderScript.src = this.path.joinWithPath({
			pathKey: 'injector-scripts-browser',
			relativePath: '/mod/director.js'
		});
		modLoaderScript.id = 'mod-director';

		this.htmlPatcher.insertAfterPivot();

	}
}