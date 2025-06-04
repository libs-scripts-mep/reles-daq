import { DAQ } from "../daq-fwlink/DAQ.js"

class ProhibitedVoltageObserver {

    /** 
     * @description Desliga a alimentação e lança uma exceção se a tensão for alterada para um valor proibido
     * @param {number} voltage 
     */
    constructor(voltage) {
        this.voltage = voltage
    }

    async change(newVal) {
        const currentVoltage = Array.from(Power.voltageToOutValue.entries()).find(([voltage, outValue]) => outValue == newVal)[0]
        if (currentVoltage == this.voltage) {
            await Power.set(0)
            throw new Error(`Prohibited voltage → ${this.voltage}V`)
        }
    }
}

export class Power {
    /** Key: tensão, Value: valor que a propriedade DAQ.out.power.value recebe */
    static voltageToOutValue = new Map([[0, 0], [12, 1], [24, 2], [110, 4], [220, 8]])

    static init() {
        try {
            DAQ.desligaAlimentacao()
            DAQ.out.power.observers = []
            DAQ.out.power.onChange = (newVal) => {
                for (const observer of DAQ.out.power.observers) observer.change(newVal)
            }
        } catch (error) {
            console.error(error)
            console.error("DAQ not connected")
        }
    }

    /**
     * Altera a tensão de alimentação para a tensão informada
     * @param {number} voltage 0-12-24-110-220
     * @param {number} delay
     * @example
     * await Power.set(0, 1000)
     * Power.set(12)
     * await Power.set(24, 3000)
     * Power.set(110)
     * await Power.set(220, 2000)
     */
    static async set(voltage, delay = 0) {
        if (!this.voltageToOutValue.has(voltage)) throw new Error(`Invalid voltage value → ${voltage}V`)

        voltage == 0 ? DAQ.desligaAlimentacao() : DAQ[`alimenta${voltage}`]()
        console.warn(`Power set to ${voltage}V ⚡`)

        await this.delay(delay)
    }

    /**
     * Liga ou desliga a auxiliar 220V
     * @param {boolean} state 
     * @param {number} delay
     * @example
     * Power.aux(true)
     * await Power.aux(false, 1000)
     */
    static async aux(state, delay = 0) {
        DAQ.out.auxpower1.setValue(state)
        await this.delay(delay)
    }

    /**
     * Permite definir uma tensão que não deve ser acionada
     * @param {number} voltage 
     * @example
     * Power.addProhibitedVoltage(12)
     * Power.addProhibitedVoltage(220)
     */
    static addProhibitedVoltage(voltage) {
        if (!this.voltageToOutValue.has(voltage)) throw new Error(`Invalid voltage value → ${voltage}V`)
        DAQ.out.power.observers.push(new ProhibitedVoltageObserver(voltage))
    }

    static delay(delay) {
        return new Promise(resolve => setTimeout(resolve, delay))
    }

    static {
        this.init()
        window.Power = this
    }
}