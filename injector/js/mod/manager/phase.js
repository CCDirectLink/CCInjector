

export default class PhaseManager {
	constructor() {
		this.phase = new Map();
	}

	addPhase(name) {
		this.phase.set(name, {});
	}

	removePhase(name) {
		this.phase.delete(name);
	}

	setPhaseFilter(name, phaseFilter) {
		const phaseConfig = this.getPhase(name);
		if (!phaseConfig) {
			throw new Error(`Phase "${name}" was not found.`);
		}

		phaseConfig.filter = phaseFilter;
	}

	getPhaseFilter(name) {
		const phaseConfig = this.getPhase(name);
		if (!phaseConfig) {
			throw new Error(`Phase "${name}" was not found.`);
		}
		return phaseConfig.filter;		
	}

	getPhase(name) {
		return this.phase.get(name) || null;	
	}

}