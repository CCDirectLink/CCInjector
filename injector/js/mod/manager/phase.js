import PhaseModel from '../models/phase.js';

export default class PhaseManager {
	constructor() {
		this.phases = new Map();
		this.currentPhase = "";
	}

	setCurrentPhase(phaseName) {
		this.currentPhase = phaseName;
	}
	
	addPhase(name) {
		let phase = this.phases.get(name);
		if (!phase) {
			phase = new PhaseModel(name);
			this.phases.set(name, phase);
		}
		return phase;
	}
	
	removePhase(name) {
		this.phases.delete(name);
	}

	addPhaseListener(name, listener) {
		const phase = this.getPhase(name);
		if (!phase) {
			throw new Error(`Phase "${name}" was not found.`);
		}
		phase.addCallback(listener);
	}
	
	removeListener(name, listener) {
		const phase = this.getPhase(name);
		if (!phase) {
			throw new Error(`Phase "${name}" was not found.`);
		}
		phase.removeCallback(listener);	
	}

	async trigger() {
		const phase = this.getPhase(this.currentPhase);
		if (phase) {
			await phase.trigger();
		}
	}
	

	setPhaseFilter(name, phaseFilter) {
		const phase = this.getPhase(name);
		if (!phase) {
			throw new Error(`Phase "${name}" was not found.`);
		}
		phase.setFilter(phaseFilter);
	}

	getCurrentPhase() {
		return this.currentPhase;
	}
	
	getCurrentPhaseFilter() {
		const phase = this.getPhase(this.currentPhase);
		if (!phase) {
			throw new Error(`Phase "${name}" was not found.`);
		}
		return phase.getFilter();
	}

	getPhase(name) {
		return this.phases.get(name) || null;	
	}

}