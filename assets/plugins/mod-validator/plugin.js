
import {
	createMapOfDependencies,
	removeModels,
	buildDependency,
	findCircularDependencies,
	findNotFoundDependencies,
	checkDependencies,
	splitByTypes
} from './util.js';

export const name = 'Dependency Checker';

// used for other plugins or mods to reference as a
// dependency
export const packageName = 'dependency-checker';

export const description = 'Checks plugin + mod dependencies Checker'; 

export const version = 'v1.0.0';

export const dependencyChecker = true;

// Influences the load order
// These are suggested behaviors for each level
// SYSTEM - critical components of the core
// HIGH - Should be used for plugins that handle assets
// MEDIUM - Adding functionalities to CrossCode 
// LOW - Anything only mods can use

export const dependencies = {
	crosscode: '>=2.0.0'
};

// This where your code should run
// SYSTEM plugins will get a plugins property
// all plugins will get a mods and require field
// this will give you access to both the global require
// and your own local require (you can add your own node_modules folder, too)

export const Class = class DependencyChecker {
	constructor() {}
	
	async preload({managers, require}) {
		const pluginModels = managers.plugin.getModels();
		const modModels = managers.mod.getModels();
		const allDependencyTypes = pluginModels.concat(modModels);
		
		const ccModel = await this._createCCModel(managers.mod);

		allDependencyTypes.push(ccModel);

		const {
			unique, 
			duplicate: duplicateCache
		} = createMapOfDependencies(allDependencyTypes);

		console.log('First - remove packages with multiple references of the same package name.');
		removeModels(managers, duplicateCache);


		buildDependency(unique, managers.mod);

		console.log('Second - Check for circular dependencies');
		const depInCycleMap = findCircularDependencies(unique);
		
		// remove from unique
		for (const [depName, depInstance] of depInCycleMap) {
			unique.delete(depName);
		}

	
		removeModels(managers, depInCycleMap);

		console.log('Third - Check for not found dependencies');
		const notFoundMap = findNotFoundDependencies(unique);

		for (const [depName, depInstance] of notFoundMap) {
			unique.delete(depName);
		}
		
		removeModels(managers, notFoundMap);

		
		// TODO when I actually figure out a system for enabling and disabling
		console.log('Fourth - Check for disable dependencies');

		
		
		console.log('Finally - check for valid dependencies');
		const versionChecker = require('node-semver-6.0.0');

		const failedDependencyChecks = checkDependencies(unique, versionChecker);
		
		// remove from unique
		for (const [depName, depInstance] of failedDependencyChecks) {
			unique.delete(depName);
		}

		removeModels(managers, failedDependencyChecks);

		// sort by dependencies

		// don't need to run CrossCode
		unique.delete('crosscode');

		// this will increment every time
		// it is referenced
		for (let [name, instance] of unique) {
			instance.incrementStartIndex();
		}
		// split by type
		const types = splitByTypes(unique);
	
		// sort by startIndex
		
		for(const type in types) {
			// sort each type by least to greatest
			types[type].sort((a,b) => a.getStartIndex() - b.getStartIndex());
			types[type] = types[type].map((modelDependency) => modelDependency.getModel());

			managers[type].setModels(types[type]);
		}

	}

	async _createCCModel(manager) {
		return manager.createModel({
			name: "crosscode",
			version: (await this._getCCVersion())
		});
	}
	async _getCCVersion() {
		// TODO: Get latest version
		return '1.1.0';
	}
};