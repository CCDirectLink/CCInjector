import HtmlPatcher from './html/patcher.js';
import ResourceLoader from './resource/loader.js';
import ResourceCreator from './resource/creator.js';
import Path from './path/path.js';
import DOM from './dom/dom.js';
import Env from './environment/environment.js';

export default class Injector {

	constructor(document) {
		let env = new Env();
		this.debug = false;

		this.htmlPatcher = new HtmlPatcher();
		this.fs = require('fs');
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
		
		

		let path = 'node-webkit.html';
		
		try {
			const customHtmlExists = this.fs.existsSync(customHtmlPath);
			let needCustomHtmlFile = !customHtmlExists;
			if (customHtmlExists) {
				const hasValidBase = await this.htmlFileHasValidBase(customHtmlPath);
				if (!hasValidBase) {
					console.log(`Base path doesn't match one in html file. Possibly moved?`);
					needCustomHtmlFile = true;
				}
			} else {
				console.log(`Custom html file doesn't exist.`);
			}
			
			if (needCustomHtmlFile) {
				console.log('Creating custom html file');
				await this.patchWithDependencies();
				let patchedHtml = this.htmlPatcher.export();
				await this.resCreator.create(customHtmlPath, patchedHtml, 'utf8');
			}
		} catch (e) {
			console.log(e);
			
			console.log('Loading regular file');
			
			path = this.path.joinWithPath({
				pathKey: 'base-browser',
				relativePath: ['assets', 'node-webkit.html']
			});
		}
		

		this.gameWindow.setAttribute('src',path);
	}
	
	async htmlFileHasValidBase(path) {
		const html = await this.resLoader.load(path , {html : true});
		const base = html.getElementsByTagName('base')[0];

		const basePath = this.path.getPath('base');
		return base && (base.getAttribute('href') || '').indexOf(basePath) > -1;
	}
	
	async patchWithDependencies() {
		let originalHtmlPath =  this.path.joinWithPath({
			pathKey: 'base', 
			relativePath: 'assets/node-webkit.html'
		});
		const doc = await this.resLoader.load(originalHtmlPath , {html : true});
		const dom = new DOM(doc);
		this.htmlPatcher.addDOM(dom);
		
		const basePath = chrome.extension.getURL('assets/');
		this.htmlPatcher.setBaseUrl(basePath);

		const gameRef = this.htmlPatcher.dom.findScriptBySrc('game.compiled.js');

		this.htmlPatcher.setPivotElement(gameRef);

		let hookOnloadScript = this.htmlPatcher.createScriptTag();
		hookOnloadScript.src = this.path.joinWithPath({
			pathKey: 'injector-scripts-browser',
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

		// this will allow the game file to be loaded manually
		let gameLoaderScript = this.htmlPatcher.createScriptTag();
		gameLoaderScript.type = 'application/javascript';
		gameLoaderScript.innerHTML = `
		function loadGameFile() {
			return new Promise((resolve, reject) => {
				const gameScript = document.createElement('script');
				gameScript.src = 'js/game.compiled.js';
				gameScript.type = 'application/javascript';
				
				gameScript.onload = function() {
					resolve();
				};
				
				gameScript.onerror = function() {
					reject();
				};
				document.body.appendChild(gameScript);
			});
		}`;

		this.htmlPatcher.insertBeforePivot();

		this.htmlPatcher.removeElement(gameRef);

	}
}