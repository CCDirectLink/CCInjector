
export default class Logger {
	constructor(fs) {
		this.fs = fs;
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
		this.fs.appendFileSync('injector-log.txt', formattedMessage);
		
	}
}