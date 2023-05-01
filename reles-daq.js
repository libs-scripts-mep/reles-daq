class DAQRelay {

    /** 
     * Formato esperado [Array's] : [1, 2, 5] 
     * 
     * @param {array} toTurnOnRelays
     * @param {number} delay
     */
    static async TurnOn(toTurnOnRelays, delay = 100) {

        return new Promise((resolve) => {

            let daqRelays = []
            let toTurnOffRelays = []

            /**
             * Monta lista de reles do DAQ
             */
            for (let relay = 1; relay <= 18; relay++) {
                daqRelays.push(index)
            }

            /**
             * Seleciona reles para desacionamento
             */
            daqRelays.forEach(relay => {
                if (!toTurnOnRelays.includes(relay)) {
                    toTurnOffRelays.push(relay)
                }
            })

            /**
             * Desaciona reles selecionados
             */
            toTurnOffRelays.forEach(rele => {
                pvi.daq.desligaRele(rele)
            })

            /**
             * Aciona reles passados inicialmente
             */
            toTurnOnRelays.forEach(rele => {
                pvi.daq.ligaRele(rele)
            })

            console.log("Relés Acionados", toTurnOnRelays)

            setTimeout(() => {
                resolve()
            }, delay)
        })
    }

    /**
     * @param {number} relay 
     * @param {[number]} buffer 
     */
    static AddRelay(relay, buffer) {
        if (!buffer.includes(relay)) {
            buffer.push(relay)
        }
    }

    /**
     * @param {number} relay 
     * @param {[number]} buffer 
     */
    static RemoveRelay(relay, buffer) {
        buffer.forEach((bufferRelay, index) => {
            if (bufferRelay == relay) {
                buffer.splice(index, 1)
            }
        })
    }

    /**
     * @param {[number]} buffer 
     */
    static ClearBuffer(buffer) {
        buffer.splice(0, buffer.length)
    }
}