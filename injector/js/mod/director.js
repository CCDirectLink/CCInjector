import Path from '../path/path.js';
import ResourceLoader from '../resource/loader.js';
import Environment from '../environment/environment.js';

import Logger from '../logger/log.js';
import PluginManager from './manager/plugin.js';
import ModManager from './manager/mod.js';

class ModDirector {
	constructor() {
		this.injectDependencies();
	}
	injectDependencies() {
		this.env = new Environment();
		this.path = new Path(this.env);
		this.resLoader = new ResourceLoader(this.path, this.env);
		this.fs = require('fs');
		this.pluginManager = this._managerFactor(PluginManager);
		this.modManager = this._managerFactor(ModManager);
		this.logger = new Logger(this.fs);
	}
	
	_managerFactory(ManagerClass) {
		return new ManagerClass(this.path, this.env, this.fs, this.resLoader);
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
		window.onloadCallbacks.forEach((cb) => cb());
	}
}

(async () => {
	const modDirector = new ModDirector();
	await modDirector.init();
	await modDirector.load();
	await modDirector.run();
	modDirector.onloadFinish();
})()