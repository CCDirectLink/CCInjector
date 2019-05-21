
export default class Logger {
	constructor(fs) {
		this.fs = fs;
		this.queue = [];
		this.busy = false;
	}
	error(tag, message) {
		this._log(tag, 'ERROR', message);
	}
	warn(tag, message) {
		this._log(tag,'WARN', message);
	}
	debug(tag, message) {
		this._log(tag, 'DEBUG', message);
	}
	info(tag, message) {
		this._log(tag, 'INFO', message);
	}
	_log(tag, type, message) {
		let formattedMessage = `[${tag}]#${type.toUpperCase()} - ${message}`;
		this.queue.push(formattedMessage);
		if (!this.busy) {
			this.busy = true;
			let fullMessage = this.queue.splice(0).join('\n');
			this.fs.appendFile('injector-log.txt', fullMessage).then(() => {
				this.busy = false;
			});
		}
		
	}
}