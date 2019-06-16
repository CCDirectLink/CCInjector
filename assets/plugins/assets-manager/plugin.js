
export const name = 'Assets Manager';

// used for other plugins or mods to reference as a
// dependency
export const packageName = 'assets-manager';

export const description = 'Assets Manager for mods'; 

export const version = 'v0.1.0';

export const dependencies = {
	crosscode: '>=1.1.0'
};


export const Class = class AssetsManager {
	constructor() {
		this.assetsPath = new Map();
		this.configFiles = {};
	}
	
	async init({managers : {mod: mods}}) {
		const managerPath = mods.path;
		const rootPath = managerPath.joinWithPath({
			pathKey: 'base',
			relativePath: 'assets/'
		});
		for (const mod of mods.getModels()) {
			const modsAssetsPath = mod.getPath().joinWithPath({
				pathKey: 'base',
				relativePath: 'assets/'
			}); 
			try {
				const allPaths = await getAllFilesRecursively(modsAssetsPath, mods, mod.getPath());
				const assetsPath = this.assetsPath;

				for (const aPath of allPaths) {
					let isPatched = false;
					let assetPath = aPath;
					if (aPath.endsWith(".patch")) {
						isPatched = true;
						assetPath = assetPath.replace(".patch", "");
					}
					// pathKey is the relative path
					// the game understands
					const pathKey = assetPath.replace(modsAssetsPath, '').replace(/\\/g, '/');

					// pathValue is the mod relative path
					// it is overriding 
					const pathValue = assetPath.replace(rootPath, '').replace(/\\/g, '/');
					
					// indirectly loaded in stuff
					if (pathKey.startsWith('config/')) {
						const patchData = await mods.resLoader.load(aPath, {json: true});
						const url = new URL(pathKey);
						const type = url.pathname.split('/').pop().replace('.json', '');
						
						this.configFiles[type] = this.configFiles[type] || [];
						this.configFiles[type].push(patchData);
						continue;
					}

					let config = {
						patches: [], 
						path: ''
					};

					if (assetsPath.has(pathKey)) {
						config = assetsPath.get(pathKey);
					} else	{
						assetsPath.set(pathKey, config);
					}
						
					if (isPatched) {
						try {
							// preload the patches so we can manually patch it
							// later
							const patchData = await mods.resLoader.load(aPath, {json: true});
							config.patches.push(patchData);
						} catch (e) {
							console.log(`Failed to load "${aPath}"`);
						}
					} else {
						config.path = pathValue;
					}
				}
			} catch (e) {
				console.log(e);
			}
		}
	}
	async preload(dependencies) {
		await this.init(dependencies);
		const oldAjax = $.ajax;
		$.ajax = (a,b) => {
			// this is where we will modify the request
			if (this.assetsPath.has(a.url)) {
				const config = this.assetsPath.get(a.url);
				if (config.patches.length) {
					const oldSuccess = a.success || (() => {});
					a.success = function(data) {
						for (const patch of config.patches) {
							// patch(data, patch);
							ig.merge(data, patch);
						}
						oldSuccess.apply(this, [data]);
					};	
				}
				a.url = config.path || a.url;
			}

			oldAjax(a,b);
		};
	}
	
	async prestart() {
		if ("bgm" in this.configFiles) {
			this.configFiles["bgm"].forEach((bgmConfig) => {
				ig.merge(ig.BGM_TRACK_LIST, bgmConfig);
			});
		}

		const assetsPath = this.assetsPath;
		ig.Image.inject({
			loadInternal: function() {
				if (assetsPath.has(this.path)) {
					const config = assetsPath.get(this.path);
					this.data = new Image;
					this.data.onload = this.onload.bind(this);
					this.data.onerror = this.onerror.bind(this);
					this.data.src = ig.getFilePath(ig.root + config.path + ig.getCacheSuffix());
					return;
				}
				this.parent();
			}
		});
	}
}

async function getAllFilesRecursively(folderPath, manager, path, allPaths = []) {
	const files = await manager.fs.readdirSync(folderPath);
	for (const file of files) {
		const fullPath = path.join(folderPath, file);
		if (manager.fs.lstatSync(fullPath).isDirectory()) {
			await getAllFilesRecursively(fullPath, manager, path, allPaths);
		} else {
			allPaths.push(fullPath);
		}
	}
	return allPaths;
}