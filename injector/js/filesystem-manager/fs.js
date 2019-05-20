

export default class FileSystem {
	constructor(env) {
		this.env = env;
		this.fs = null;
		if (this.env.isNode()) {
			this.fs = require('fs');
		} else if (this.env.isBrowser()) {

		}
	}
	readFile(path, opts = '') {
		if (this.fs) {
			return new Promise((resolve, reject) => {
				let cb = (error, result) => {
					if (error) {
						reject(error);
					}
					resolve(result);
				};

				if (!opts) {
					this.fs.readFile(path, cb);
				} else {
					this.fs.readFile(path, opts, cb);
				}
			}); 
		}
	}

	writeFile(path, content, opts = {}) {
		if (this.fs) {
			return new Promise((resolve, reject) => {
				let cb = (error, result) => {
					if (error) {
						reject(error);
					}
					resolve(result);
				};
				if (!opts) {
					this.fs.writeFile(path, content, cb);
				} else {
					this.fs.writeFile(path, content, opts, cb);
				}
			});
		}
	}
}