import Log from "../../@libs-scripts-mep/script-loader/utils-script.js"

export class DAQRelay {

    static State = []

    /** 
     * @param {array} toTurnOnRelays
     * @param {number} delay
     * 
     * # Formato Esperado
     * 
     * ```js
     * toTurnOnRelays = [1, 2, 3]
     * delay = 1000
     * ```
     * 
     * # Exemplos
     * 
     * Utilizando buffer interno `DAQRelay.State` e sem timeout:
     * ```js
     * DAQRelay.TurnOn()
     * ```
     * 
     * Utilizando buffer interno com timeout:
     * ```js
     * await DAQRelay.TurnOn(undefined, 1000)
     * ```
     * 
     * Utilizando outro buffer com timeout:
     * ```js
     * await DAQRelay.TurnOn(myBuffer, 1000)
     * ```
     */
    static async TurnOn(toTurnOnRelays = DAQRelay.State, delay = 0) {
        let daqRelays = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]

        //Desaciona relés não inclusos no buffer
        for (const relay of daqRelays) {
            if (!toTurnOnRelays.includes(relay)) {
                DAQ.desligaRele(relay)
            }
        }

        //Aciona reles inclusos no buffer
        for (const relay of toTurnOnRelays) {
            DAQ.ligaRele(relay)
        }

        console.warn("Relés Acionados", toTurnOnRelays)

        if (delay) { await this.Delay(delay) }
        return
    }

    /**
    * @param {number | number[]} relay 
    * @param {number[]} buffer
    * @example
    * let relay = 4
    * let buffer = [1, 2, 3]
    * DAQRelay.AddRelay(relay)
    * await DAQRelay.TurnOn(undefined, 500)
    */
    static AddRelay(relay, buffer = DAQRelay.State) {
        if (typeof relay == "number") {
            if (!buffer.includes(relay)) {
                buffer.push(relay)
            }
        } else if (typeof relay == "object") {
            for (const rl of relay) {
                if (!buffer.includes(rl)) {
                    buffer.push(rl)
                }
            }
        }
    }

    /**
      * @param {number | number[]} relay 
      * @param {number[]} buffer
      * @example
      * let relay = 4
      * let buffer = [1, 2, 3]
      * DAQRelay.RemoveRelay(relay)
      * await DAQRelay.TurnOn(undefined, 500)
      */
    static RemoveRelay(relay, buffer = DAQRelay.State) {
        buffer.forEach((bufferRelay, index) => {

            if (typeof relay == "number") {
                if (bufferRelay == relay) {
                    buffer.splice(index, 1)
                }
            } else if (typeof relay == "object") {
                for (const rl of relay) {
                    if (bufferRelay == rl) {
                        buffer.splice(index, relay.length)
                    }
                }
            }
        })
    }

    /**
     * @param {Array} buffer
     * # Formato Esperado
     * 
     * ```js
     * buffer = [1, 2, 3]
     * ```
     * 
     * # Exemplo
     * 
     * ```js
     * DAQRelay.ClearBuffer(myBuffer)
     * ```
     */
    static ClearBuffer(buffer = DAQRelay.State) {
        buffer.splice(0, buffer.length)
    }

    static async Delay(timeout = 1000) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve()
            }, timeout)
        })
    }

    static { window.DAQRelay = DAQRelay }
}

export class Power {

    static enableCyclePower = false

    /**
     * @param {Number} voltage 
     * @param {Number} delay 
     * 
     * # Exemplo
     * 
     * Sem delay pós-energização:
     * ```js
     * Power.On(220)
     * ```
     * 
     * Com delay pós-energização:
     * ```js
     * await Power.On(220, 2000)
     * ```
     * ### Opções de tensão
     * 
     * `12`
     * `24`
     * `110`
     * `220`
     */
    static async On(voltage, delay = 0) {
        switch (voltage) {
            case 12:
                Log.console(`12VDC Alimentação Geral [Delay ${delay}ms]`, Log.Colors.Yellow.Gold)
                DAQ.alimenta12()
                break
            case 24:
                Log.console(`24VDC Alimentação Geral [Delay ${delay}ms]`, Log.Colors.Yellow.Gold)
                DAQ.alimenta24()
                break
            case 110:
                Log.console(`110VAC Alimentação Geral [Delay ${delay}ms]`, Log.Colors.Yellow.Gold)
                DAQ.alimenta110()
                break
            case 220:
                Log.console(`220VAC Alimentação Geral [Delay ${delay}ms]`, Log.Colors.Yellow.Gold)
                DAQ.alimenta220()
                break
            default:
                alert("Tensão informada inválida")
                break
        }
        if (delay) { await this.Delay(delay) }
        return
    }

    /**
     * 
     * @param {Number} delay
     * # Exemplo
     * 
     * Sem delay pós-energização:
     * ```js
     * Power.Off()
     * ```
     * 
     * Com delay pós-energização:
     * ```js
     * await Power.Off(2000)
     * ```
     */
    static async Off(delay = 0) {
        Log.console(`Desenergizando Alimentação Geral [Delay ${delay}ms]`, Log.Colors.Yellow.Gold)
        DAQ.desligaAlimentacao()
        if (delay) { await this.Delay(delay) }
        return
    }

    /**
     * 
     * @param {Boolean} state 
     * @param {Number} delay 
     * # Exemplo
     * 
     * Sem delay pós-energização:
     * ```js
     * Power.Aux(true)
     * ```
     * 
     * Sem delay pós-energização:
     * ```js
     * await Power.Aux(false, 1000)
     * ```
     */
    static async Aux(state, delay = 0) {
        Log.console(`${state ? "Energizando" : "Desenergizando"} Alimentação Auxiliar [Delay ${delay}ms]`, Log.Colors.Yellow.Gold)
        state ? DAQ.ligaAux220() : DAQ.desligaAux220()
        if (delay) { await this.Delay(delay) }
        return
    }

 /**
     * Cicla a alimentação do produto entre 220V e 110V
     * 
     * ⚠️ UTILIZAR APENAS COM PEÇAS COM ALIMENTAÇÃO DE 85VAC À 250VAC ⚠️
     * @param {Number} cycletime - Tempo de duração do ciclo em milisegundos (padrão 5000ms)
     * @example
     * Power.enableCyclePower = true
     * await Power.cyclePowerSupply(5000)
     */
    static async cyclePowerSupply(cycletime = 5000) {
        while (true) {
            await this.Delay(100)
            if (this.enableCyclePower) {
                await this.On(220, cycletime)
                await this.On(110, cycletime)
            }
        }
    }


    static async Delay(timeout = 1000) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve()
            }, timeout)
        })
    }
}