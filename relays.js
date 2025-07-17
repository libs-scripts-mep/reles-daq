import { DAQ } from "../daq-fwlink/DAQ.js"

class ChangeObserver {

    /**
     * @description Atualiza os sets de relés ligados e desligados
     * @param {number} relay 
     */
    constructor(relay) {
        this.relay = relay
    }

    change(newVal) {
        if (newVal) {
            Relays.enabledRelays.add(this.relay)
            Relays.disabledRelays.delete(this.relay)
        } else {
            Relays.enabledRelays.delete(this.relay)
            Relays.disabledRelays.add(this.relay)
        }
    }
}

class ProhibitedCombinationObserver {

    /** 
     * @description Desliga os relés e lança uma exceção se houver uma combinação proibida
     * @param {Set<number>} combination 
     */
    constructor(combination) {
        this.combination = combination
    }

    change(newVal) {
        if (newVal && this.combination.isSubsetOf(Relays.enabledRelays)) {
            Relays.clear()
            console.error(`Relays [${Array.from(this.combination).join(", ")}] are in a prohibited combination!`)
            throw new Error(`Relays [${Array.from(this.combination).join(", ")}] are in a prohibited combination!`)
        }
    }
}

class TimeoutObserver {
    /**
     * @description Desliga o relé se o timeout for atingido, lançando ou não uma exceção
     * @param {number} relay
     * @param {number} timeout 
     * @param {boolean} throws
     */
    constructor(relay, timeout, throws) {
        this.relay = relay
        this.timeout = timeout
        this.throws = throws
        this.disableRelayTimeout
    }

    change(newVal) {
        if (newVal) {
            this.disableRelayTimeout = setTimeout(() => {
                Relays.disable(this.relay)
                console.warn(`Relay ${this.relay} has been disabled due to timeout! → ${this.timeout}ms`)
                if (this.throws) throw new Error(`Relay ${this.relay} has been disabled due to timeout! → ${this.timeout}ms`)
            }, this.timeout)
        } else {
            clearTimeout(this.disableRelayTimeout)
        }
    }
}

export default class Relays {
    static validRelays = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18])
    static enabledRelays = new Set()
    static disabledRelays = new Set()

    /**@type {Array<Set<number>>} */
    static prohibitedCombinations = []

    /** Desliga todos os relés, popula o set de relés desligados e inicializa os `onChange()` dos relés */
    static init() {
        try {
            DAQ.desligaReles(Array.from(this.validRelays))
            this.disabledRelays = new Set(this.validRelays)
            for (const relay of this.validRelays) {
                DAQ.out[`rl${relay}`].observers = [new ChangeObserver(relay)] // Cria a propriedade `observers` para cada relé
                DAQ.out[`rl${relay}`].onChange = newVal => {
                    for (const observer of DAQ.out[`rl${relay}`].observers) observer.change(newVal) // Notifica os observers
                }
            }
        } catch (error) {
            console.error(error)
            console.error("DAQ not connected")
        }
    }

    /**
     * Configura uma combinação de relés que não devem acionar juntos
     * @param {number[]} combination 
     * @example
     * Relays.addProhibitedCombination([1, 3])
     * Relays.addProhibitedCombination([4, 5, 6])
     */
    static addProhibitedCombination(combination) {
        const relaySet = this.createRelaySet(combination)
        for (const relay of relaySet) DAQ.out[`rl${relay}`].observers.push(new ProhibitedCombinationObserver(relaySet))
    }

    /**
     * Configura um tempo limite que um relé pode ficar ligado
     * @param {number} relay 
     * @param {number} timeout 
     * @param {boolean} throws define se deve lançar uma exceção ao atingir o timeout
     * @example
     * Relays.addTimeout(1, 1000, true)
     * Relays.addTimeout(2, 5000)
     */
    static addTimeout(relay, timeout, throws = false) {
        DAQ.out[`rl${relay}`].observers.push(new TimeoutObserver(relay, timeout, throws))
    }

    /**
     * Liga os relés informados
     * @param {number | number[]} relays 
     * @param {number} delay 
     * @example
     * Relays.enable(1)
     * await Relays.enable([1, 2, 3], 1000)
     */
    static async enable(relays, delay = 0) {
        const relaySet = this.createRelaySet(relays)
        DAQ.ligaReles(Array.from(relaySet.difference(this.enabledRelays)))
        for (const relay of relaySet.difference(this.enabledRelays)) {
            this.disabledRelays.delete(relay)
            this.enabledRelays.add(relay)
        }
        console.warn("Relés acionados", Array.from(this.enabledRelays).sort((a, b) => a - b))
        await this.delay(delay)
    }

    /**
     * Desliga os relés informados
     * @param {number | number[]} relays 
     * @param {number} delay 
     * @example
     * Relays.disable(1)
     * await Relays.disable([1, 2, 3], 1000)
     */
    static async disable(relays, delay = 0) {
        const relaySet = this.createRelaySet(relays)
        DAQ.desligaReles(Array.from(relaySet.difference(this.disabledRelays)))
        for (const relay of relaySet.difference(this.disabledRelays)) {
            this.enabledRelays.delete(relay)
            this.disabledRelays.add(relay)
        }
        console.warn("Relés acionados", Array.from(this.enabledRelays).sort((a, b) => a - b))
        await this.delay(delay)
    }

    /**
     * Altera os buffers para manter ligados apenas os relés informados
     * @param {number | number[]} relays 
     * @param {number} delay 
     * @example
     * Relays.set(1)
     * await Relays.set([1, 2, 3], 1000)
     */
    static async set(relays, delay = 0) {
        const relaySet = this.createRelaySet(relays)
        await this.disable(Array.from(this.validRelays.difference(relaySet)))
        await this.enable(relays)
        await this.delay(delay)
    }

    /**
     * Desliga todos os relés
     * @param {number} delay 
     * @example
     * Relays.clear()
     * await Relays.clear(1000)
     */
    static async clear(delay = 0) {
        await this.disable(Array.from(this.validRelays), delay)
    }

    /**
     * Cria um novo Set com os relés informados, verificando se são válidos
     * @param {number | number[]} relays
     */
    static createRelaySet(relays) {
        if (typeof relays == "number") relays = [relays]
        const relaySet = new Set(relays)

        if (relaySet.isSubsetOf(this.validRelays)) return relaySet

        console.error(`Relays [${[...relaySet.difference(this.validRelays)].join(", ")}] are not valid!`)
        throw new Error(`Relays [${[...relaySet.difference(this.validRelays)].join(", ")}] are not valid!`)
    }


    static async delay(time) {
        await new Promise(resolve => setTimeout(resolve, time))
    }

    static {
        this.init()
        window.Relays = this
    }
}