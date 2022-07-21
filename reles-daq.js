class Reles {
     
    static AddRelayToBuffer(relay, buffer) {

        buffer.push(relay)

    }

    static RemoveRelayFromBuffer(relay, buffer) {

        buffer.forEach((bufferRelay, index) => {
            if (bufferRelay == relay) {
                buffer.splice(index, 1)
            }
        })

    }

    static ClearBufferRelay(buffer) {

        buffer.splice(0, buffer.length)

    }

    /**
     * 
     * @param {array} relesParaAcionamento 
     * @param {function} callback
     * @param {number} timeOut
     */
    static LigaReles(relesParaAcionamento = [], callback = () => { }, timeOut = 100) {

        console.log("Relés Acionados", relesParaAcionamento)

        let relesDaq = []
        let relesParaDesacionamento = []

        /**
         * Monta lista de relés do DAQ
         */
        for (let index = 1; index < 13; index++) {
            relesDaq.push(index)
        }

        /**
         * Seleciona relés para desacionamento
         */
        relesDaq.forEach(releDaq => {

            if (!relesParaAcionamento.includes(releDaq)) {

                relesParaDesacionamento.push(releDaq)

            }
        })

        /**
         * Desaciona relés selecionados
         */
        relesParaDesacionamento.forEach(rele => {

            pvi.daq.desligaRele(rele)

        })

        /**
         * Aciona relés passados inicialmente
         */
        relesParaAcionamento.forEach(rele => {

            pvi.daq.ligaRele(rele)

        })

        setTimeout(() => {
            callback()
        }, timeOut)
    }
}



