- [Gerenciamento de Relés e Alimentação do DAQ](#gerenciamento-de-relés-e-alimentação-do-daq)
  - [Instalando](#instalando)
  - [Desinstalando](#desinstalando)
  - [Relés](#relés)
    - [Importação](#importação)
    - [Comportamento](#comportamento)
    - [Métodos de Gerenciamento de Relés](#métodos-de-gerenciamento-de-relés)
    - [Observers, Sincronização e Segurança](#observers-sincronização-e-segurança)
  - [Alimentação](#alimentação)
    - [Importação](#importação-1)
    - [Métodos para Controle da Alimentação](#métodos-para-controle-da-alimentação)
    - [Observers, Sincronização e Segurança](#observers-sincronização-e-segurança-1)


# Gerenciamento de Relés e Alimentação do DAQ

Biblioteca para controle de relés e alimentação do DAQ, com features para segurança.

## Instalando

Abra o terminal, e na pasta do script, execute:

```
npm i @libs-scripts-mep/reles-daq
```

## Desinstalando

Abra o terminal, e na pasta do script, execute:

```
npm uninstall @libs-scripts-mep/reles-daq
```

## Relés

### Importação

```js
import { Relays } from "@libs-scripts-mep/reles-daq/relays.js"
```

### Comportamento

- Ao inicializar, o método `init()` desliga todos os relés, popula o set `disabledRelays` e inicializa os `onChange()` dos relés, garantindo a sincronização inicial. Através dos Sets `enabledRelays` e `disabledRelays` e os atrelando aos `onChange()`, a biblioteca sempre está atualizada com os relés ligados e desligados, ou seja, mesmo que as saídas sejam manipuladas diretamente na tela do PVI, os buffers sempre estarão sincronizados;
- Existe validação dos relés informados, caso não estejam no set `validRelays`, uma exceção será lançada;
- Para uma maior performance e aproveitando os métodos nativos de comparação entre sets, a biblioteca não irá enviar comandos de ligar ou desligar um relé que já está no estado desejado. EX: se for solicitado o acionamento dos relés 1, 2 e 3, mas os relés 1 e 2 já constam no set `enabledRelays`, apenas o relé 3 será acionado.

### Métodos de Gerenciamento de Relés

A biblioteca fornece os métodos abaixo para acionamento dos relés. Informações adicionais estão documentadas via JSDoc.

| Método                   | Descrição                                                        |
| ------------------------ | ---------------------------------------------------------------- |
| `enable(relays, delay)`  | Liga os relés informados                                         |
| `disable(relays, delay)` | Desliga os relés informados                                      |
| `set(relays, delay)`     | Altera os buffers para manter ligados apenas os relés informados |
| `clear(delay)`           | Desliga todos os relés                                           |

### Observers, Sincronização e Segurança

- A biblioteca possui os seguintes observers para os relés:

| Observer                        | Método de Adição                                    | Aplicação                                                  |
| ------------------------------- | --------------------------------------------------- | ---------------------------------------------------------- |
| `ChangeObserver`                | Não é possível, o observer é criado automaticamente | Atualização e sincronização dos buffers                    |
| `ProhibitedCombinationObserver` | `Relays.addProhibitedCombination()`                 | Segurança: verificação de combinações proibidas            |
| `TimeoutObserver`               | `Relays.addTimeout()`                               | Segurança: configura um tempo limite para um relé acionado |

- Na inicialização da biblioteca, o método `init()` cria uma nova propriedade chamada `observers` dentro de cada objeto de saída relé, que é um array que irá armazenar observers e que já contém um `ChangeObserver` adicionado;
- Observers são notificados via `onChange()`, que invoca o método `change()` de cada um;
- Um observer é adicionado apenas aos relés de interesse, portanto a notificação apenas ocorre quando a mudança é nestes relés. EX: Se um `TimeoutObserver` for adicionado ao relé 1, apenas as mudanças do relé 1 serão capazes de notificá-lo. Desta forma, não é obrigatório que todos os relés possuam todos os observers, tornando a execução mais flexível e eficiente;
- Se for necessário criar novos observers, basta que ele possua um método `change()`, sendo que pode ser incorporado à biblioteca ou também pode ser apenas um observer local e específico de um projeto.

## Alimentação

### Importação

```js
import { Power } from "@libs-scripts-mep/reles-daq/power.js"
```

### Métodos para Controle da Alimentação

A biblioteca fornece os métodos abaixo para controle da alimentação. Informações adicionais estão documentadas via JSDoc.

| Método                | Descrição                                                                                           |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| `set(voltage, delay)` | Altera a tensão de alimentação para a tensão informada. Passar voltage como 0 desliga a alimentação |
| `aux(state, delay)`   | Liga ou desliga a auxiliar 220V                                                                     |

### Observers, Sincronização e Segurança

- De modo semelhante aos relés, a biblioteca notifica os observer no método `onChange()` da saída de alimentação;
- A biblioteca possui o seguinte observer:

| Observer                    | Método de Adição               | Aplicação                                 |
| --------------------------- | ------------------------------ | ----------------------------------------- |
| `ProhibitedVoltageObserver` | `Power.addProhibitedVoltage()` | Segurança: verificação de tensão proibida |

- O observer `ProhibitedVoltageObserver` desliga a alimentação e lança uma exceção caso a tensão seja alterada para um valor proibido. EX: em um script para um produto 12V, é possível configurar as tensões de 24V, 110V e 220V como proibidas. Caso, via script ou interface do PVI, alguma destas tensões seja acionada, o observer irá atuar e cortar a alimentação, o que pode evitar danos ao produto.