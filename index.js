// variáveis que comunicam com a tela
const setupContainer = document.getElementById('setup-container')
const gameContainer = document.getElementById('game-container')
const wordDisplay = document.getElementById('word-display')
const gameMessage = document.getElementById('game-message')
const errorCount = document.getElementById('error-count')
const resetBtn = document.getElementById('reset-btn')
const hintDisplay = document.getElementById('hint-display')

const URL_API = 'https://api-palavras-8ptt.onrender.com/'


// ==========================
// SONS
// ==========================

const somAcerto = new Audio('acerto.mp3')
const somErro = new Audio('erro.mp3')


// ==========================
// INICIAR JOGO
// ==========================

async function iniciarJogo(event) {

    if (event.key == "Enter") {

        const nickname = document.getElementById('nickname-input').value

        if (!nickname) {
            alert('Preencha o nickname')
            return
        }

        const response = await fetch(`${URL_API}/iniciar`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nickname: nickname
            })
        })

        const data = await response.json()

        if (data.erro) {
            alert(data.erro)
            return
        }

        setupContainer.classList.add('hidden')
        gameContainer.classList.remove('hidden')

        document.getElementById('player-display').innerText =
            data.mensagem

        buscarPalavra()
    }
}


// ==========================
// BUSCAR PALAVRA
// ==========================

async function buscarPalavra() {

    const response = await fetch(`${URL_API}/status`, {
        credentials: 'include',
        method: 'GET',
    })

    const data = await response.json()

    // MOSTRAR DICA
    hintDisplay.innerText = `💡 Dica: ${data.dica}`

    wordDisplay.innerHTML = ''

    for (let i = 0; i < data.qtde_caracteres; i++) {

        const span = document.createElement('span')

        span.className = 'letter-slot'
        span.id = `slot-${i}`

        wordDisplay.appendChild(span)
    }
}


// ==========================
// TENTAR LETRA
// ==========================

async function tentarLetra(event) {

    if (event.key == "Enter") {

        const input = document.getElementById('letter-input')

        const caractere = input.value.trim().toLowerCase()

        input.value = ''
        input.focus()

        if (!caractere) {
            alert('Digite um caractere para jogar!')
            return
        }

        const response = await fetch(`${URL_API}/tentativa`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                caractere: caractere
            })
        })

        const data = await response.json()

        console.log(data)

        // ==========================
        // MOSTRAR LETRAS
        // ==========================

        data.posicoes.forEach(pos => {

            document.getElementById(`slot-${pos}`).innerText =
                caractere
        })


        // ==========================
        // SOM
        // ==========================

        if (data.posicoes.length > 0) {

            somAcerto.currentTime = 0
            somAcerto.play()

        } else {

            somErro.currentTime = 0
            somErro.play()
        }


        // ==========================
        // STATUS
        // ==========================

        errorCount.innerText = data.erros_atuais
        gameMessage.innerText = data.mensagem


        // ==========================
        // FIM DE JOGO
        // ==========================

        if (data.status_jogo != 'jogando') {

            resetBtn.classList.remove('hidden')

            const status = data.status_jogo.toLowerCase()


            // ==========================
            // VITÓRIA
            // ==========================

            if (
                status.includes('vitoria') ||
                status.includes('ganhou') ||
                status.includes('venceu')
            ) {

                document.body.classList.remove('derrota')
                document.body.classList.add('vitoria')

                gameMessage.style.color = '#4ade80'
            }


            // ==========================
            // DERROTA
            // ==========================

            else if (
                status.includes('derrota') ||
                status.includes('perdeu') ||
                status.includes('morreu')
            ) {

                document.body.classList.remove('vitoria')
                document.body.classList.add('derrota')

                gameMessage.style.color = '#f87171'

                // MOSTRAR PALAVRA CORRETA
                if (data.palavra) {

                    const palavra = data.palavra.toLowerCase()

                    for (let i = 0; i < palavra.length; i++) {

                        document.getElementById(`slot-${i}`).innerText =
                            palavra[i]
                    }
                }
            }
        }
    }
}


// ==========================
// REINICIAR
// ==========================

function reiniciarJogo() {
    location.reload()
}