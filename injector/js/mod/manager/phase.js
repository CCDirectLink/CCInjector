

export default class PhaseManager {
	constructor() {
		this.phase = new Map();
		this.currentPhase = "";
	}

	setCurrentPhase(phaseName) {
		this.currentPhase = phaseName;
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

	getCurrentPhase() {
		return this.currentPhase;
	}
	
	getCurrentPhaseFilter() {
		return this.getPhaseFilter(this.currentPhase);
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