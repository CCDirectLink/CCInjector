import {ModelDependency, NotFoundDependency} from './type/dependency/exporter.js';

export function createModelDependencyFromModel(model) {
	return new ModelDependency(model);
}

export function createMapOfDependencies(allModels) {
	const cache = new Map();
	const duplicateCache = new Map();
	for (const model of allModels) {
		const packageName = model.getPackageName();
		const modelDependency = createModelDependencyFromModel(model);

		// found first time
		if (cache.has(packageName))  {
			const depRef = cache.get(packageName);
			cache.remove(packageName);
			depRef.disable();

			depRef.addReferenceCount();
			duplicateCache.set(packageName, depRef);
			depRef.setDisableReason(`${packageName} was found multiple times.`);

			
		} else if(duplicateCache.has(packageName)) { 
			// if found any other time
			duplicateCache.get(packageName).addReferenceCount();
			
		} else {
			cache.set(packageName, modelDependency);
		}
	}
	
	// remove Models that occur multiple times

	return {
		unique: cache,
		duplicate: duplicateCache
	};
}

export function removeModels(managers, cache) {
	for (const [name, instance] of cache) {
		const model = instance.getModel();
		const type = model.getType();
		managers[`${type}`].removeModel(model);
	}
}

export function setUpChildDependencyFromCache(name, parent, cache) {
	if (cache.has(name)) {
		cache.get(name).addChild(parent.getModel().getPackageName(), parent);
	}
}

function setUpChildFromCache(name, parent, cache) {
	if (cache.has(name)) {
		cache.get(name).addChild(parent.getModel().getPackageName(), parent);
	}
}

export function buildDependency(cache, manager) {
	for (const [name, instance] of cache) {
		const dependencies = instance.getModel().getDependencies() || {};
		for(const depKey in dependencies) {
			if (!cache.has(depKey)) {
				const mod = manager.createModel({name: depKey});
				cache.set(depKey, new NotFoundDependency(mod));
			}
			setUpChildFromCache(depKey, instance , cache);
		}
	}
}


function _findCircularDependencies(parent, inCircular, chainDependencies = new Map(),top = true) {
	let dependencies = parent;

	if (!top) {
		dependencies = parent.getChildren();
	}

	for (const [name, instance] of dependencies) {
		
		// it was found already in a circular dependency
		if (inCircular.has(name)) {
			continue;
		}

		// current dependency is circular
		if(chainDependencies.has(name)) {
			instance.setCircular();
			for(const [chainName, chainInstance] of chainDependencies) {
				if (name !== chainName) {
					instance.setDisableReason(`"${chainName}" relies on ${name} which is circular.`);

				} else {
					instance.setDisableReason(`"${name}" is circular.`);
				}

				chainInstance.disable();
				inCircular.set(chainName, chainInstance);				
			}
			return;
		}

		
		if (instance.getVisited()) {
			continue;
		}
		
		instance.setVisited();
		chainDependencies.set(name, instance);
		_findCircularDependencies(instance, inCircular, chainDependencies, false);
		chainDependencies.delete(name);
	}



}

export function findCircularDependencies(cache) {
	const inCircular = new Map();
	_findCircularDependencies(cache, inCircular);
	
	return inCircular;
}


export function checkDependencies(cache, {satisfies}) {
	const disabledMods = new Map();
	for (const [name, instance] of cache) {
		if (!instance.getEnabled()) {
			continue;
		}
		
		const children = instance.getChildren();
		const version = instance.getModel().getProperty('version');

		for (const [childName, childInstance] of children) {
			const versionToMatch = childInstance.getModel().getDependencies()[name];
			if(!satisfies(version, versionToMatch)) {
				childInstance.setDisableReason(`"${childName}" requires "${name}" to be "${versionToMatch}" but it is "${version}"`);
				childInstance.disable();
				disabledMods.set(childName, childInstance);
			}
		}
	}
	return disabledMods;
}

export function findNotFoundDependencies(map) {
	const notFoundDependencies = new Map();
	for (const [name, instance] of map) {
		if(instance instanceof NotFoundDependency) {
			notFoundDependencies.set(name, instance);
		}
	}
	return notFoundDependencies;
}

export function splitByTypes(map) {
	const types = {

	};
	
	for(const [name, instance] of map) {
		const type = instance.getModel().getType();
		if(!(type in types)) {
			types[type] = [];
		}
		types[type].push(instance);
	}
	return types;
}