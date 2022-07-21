# Gerenciamento de Relés

Biblioteca genérica com métodos estáticos para acionamento dos relés do DAQ, tanto versão 1.9 quanto 2.0

## Exemplo de Utilização

O gerenciamento de acionamento de relés se dá pela manipulação do buffer:

``` js
//Main.js
class Main {
    constructor() {
        this.BufferReles = []
    }
}    
```

Buffer esse, manipulado pelos métodos estáticos contidos na classe Reles:

``` js
//Teste.js
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
}    
```

Exemplo de manipulação:

``` js
Reles.ClearBufferRelay(this.BufferReles)
Reles.AddRelayToBuffer(Setup.Reles.HabilitaSlot1, this.BufferReles)
Reles.AddRelayToBuffer(Setup.Reles.HabilitaPistao, this.BufferReles)
Reles.AddRelayToBuffer(Setup.Reles.HabilitaAlimentacao, this.BufferReles)
Reles.AddRelayToBuffer(Setup.Reles.HabilitaComunicacao, this.BufferReles)
Reles.LigaReles(this.BufferReles, () => {
    segue o teste..
})
  
```
