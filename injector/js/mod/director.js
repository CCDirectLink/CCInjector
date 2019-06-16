import Path from '../path/path.js';
import ResourceLoader from '../resource/loader.js';
import Environment from '../environment/environment.js';

import Logger from '../logger/log.js';

import PluginManager from './manager/plugin.js';
import ModManager from './manager/mod.js';


import PhaseManager from './manager/phase.js';

class ModDirector {
	constructor() {
		this.injectDependencies();
		this.initPhases();
	}
	injectDependencies() {
		this.phaseManager = new PhaseManager();
		this.env = new Environment();
		this.path = new Path(this.env);
		this.resLoader = new ResourceLoader(this.path, this.env);
		this.fs = require('fs');
		this.pluginManager = this._managerFactory(PluginManager);
		this.modManager = this._managerFactory(ModManager);
		this.logger = new Logger(this.fs);
	}
	
	initPhases() {
		this.phaseManager.addPhase('preload');
		this.phaseManager.setPhaseFilter('preload', function(model) {
			return model.hasPriority('preload');
		});

		this.phaseManager.addPhase('postload');
		this.phaseManager.setPhaseFilter('postload', function(model) {
			return model.hasPriority('postload');
		});
		
		this.phaseManager.addPhase('prestart');
		this.phaseManager.addPhase('main');
	}

	initInjections() {
		// This loads just before dom.ready
		ig.module("mods.event.postload").defines(() => {
			addBeforeDomReady(async function () {
				await modDirector.triggerPhase('postload');
			});

			addBeforeDomReady(() => {
				// this loads just before ig.main
				ig.module("mods.event.prestart").requires("impact.base.impact").defines(() => {
					var oldMain = ig.main;
					ig.main = function() {
						const args = arguments;
						modDirector.triggerPhase('prestart').then(() => {
							oldMain.apply(this, args);
						});
					};
					this.onloadFinish();
					
				});
			});
		});


	}
	
	setCurrentPhase(name) {
		this.phaseManager.setCurrentPhase(name);
	}
	
	async triggerPhase(name) {
		this.setCurrentPhase(name);
		await this.run();
	}
	
	_managerFactory(ManagerClass) {
		const instance = new ManagerClass();
		instance.setPath(this.path);
		instance.setEnv(this.env);
		instance.setFs(require('fs'));
		instance.setResourceLoader(this.resLoader);
		instance.setPhaseManager(this.phaseManager);
		instance.initLoader();

		return instance;
	}

	async init() {
		await this.pluginManager.init();
		await this.modManager.init();
	}
	async load() {
		await this.pluginManager.load();
		await this.modManager.load();
	}

	async run() {
		await this.pluginManager.run(this.modManager);
		await this.modManager.run();
	}
	onloadFinish() {		
		window.executeOnloadCallbacks();
	}
}

(async function() {

	const modDirector = new ModDirector();
	window.modDirector = modDirector;
			
	await modDirector.init();
	await modDirector.load();


	await modDirector.triggerPhase('preload');
	// load game.compiled.js here
	await loadGameFile();
	console.log('Done loading game file?');
	modDirector.initInjections();
	ig._DOMReady(true);
})()

