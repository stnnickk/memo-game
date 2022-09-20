class Game {
    constructor(cards, cardsTotal) {
        this.cards = cards
        this.cardsTotal = cardsTotal

        this.animals = ['squirrel', 'panda', 'bear', 'squid', 'sheep', 'mouse']
        this.animalsExpanded = this.animals.concat(this.animals)
        this.animalsCount = this.animals.length
        
        // Game configuration.
        this.game = {}
        this.game.gameResult = null
        this.game.gameTime = 0

        // Gards configuration.
        this.cardsC = {}
        this.cardsC.opened = 0
        this.cardsC.success = 0

        // Timer configuration.
        this.timerC = {}
        this.timerC.isActive = false
        this.timerC.seconds = 60
        this.timerC.timerFunction = ''

        for (let i = 0; i < this.cardsTotal; i++) {
            this.cards.children[i].addEventListener('click', (event) => {
                const target = event.currentTarget
                let card1

                // Finding the element object.
                for (let i = 1; i <= this.cardsTotal; i++) {
                    if (window['Card' + i].card === target) {
                        card1 = window['Card' + i]
                        break
                    }
                }

                switch (card1.state) {
                    case 'default':
                        card1.open()
                        break
                    case 'open':
                        card1.close()
                        break
                    default:
                        break
                }
            })
        }
    }

    start() {
        const minutes = document.querySelector('.minutes'),
                  seconds = document.querySelector('.seconds')

        this.timerC.isActive = true

        minutes.textContent = '00'
        seconds.textContent = this.timerC.seconds

        this.timerC.timerFunction = setInterval(() => {
            let textSeconds = --seconds.textContent

            if (+seconds.textContent < 10) {
                textSeconds = '0' + textSeconds
            }
            seconds.textContent = textSeconds

            if (seconds.textContent === '00') {
                this.gameResult = 'lose'
                this.end(this.gameResult)
            }
            if (this.cardsC.success === this.animalsCount) {
                this.game.gameTime = this.timerC.seconds - seconds.textContent // Calculate how much gravel you spend at the hour.
                this.game.gameResult = 'win'
                this.end(this.game.gameResult, this.game.gameTime)
            }
        }, 1000)
    }

    end(gameResult, gameTime) {
        clearInterval(this.timerC.timerFunction)
        this.timerC.isActive = false
        this.showModal(gameResult, gameTime)
    }

    restart() {
        const minutes = document.querySelector('.minutes'),
              seconds = document.querySelector('.seconds')

        this.closeModal(this.game.gameResult)

        minutes.textContent = '1'
        seconds.textContent = '00'
        this.cardsC.success = 0
        this.cardsC.opened = 0
        this.game.gameResult = null


        this.animalsExpanded = this.animals.concat(this.animals)

        // Recreate cards.
        for (let i = 0; i < this.cardsTotal; i++) {
            this.cards.children[i].classList.remove('card_opened')
            this.cards.children[i].classList.remove('card_success')
            this.cards.children[i].classList.remove('card_error')

            delete window['Card' + (i + 1)]
            window['Card' + (i + 1)] = new Card(this.cards.children[i])
        }
    }

    closeAllErrorCards() {
        for (let i = 1; i <= this.cardsTotal; i++) {
            const card = window['Card' + i]

            if (card.state === 'error') card.close()
        }
    }

    showModal(gameResult, gameTime) {
        const modal = document.querySelector('.modal__wrapper'),
              modalBg = document.querySelector('.modal__background'),
              modalTitle = document.querySelector('.modal__title'),
              modalPicture = document.querySelector('.modal__picture').children[0]

        modal.classList.add('modal_active')
        modalBg.classList.add('modalbg_active')

        if (gameResult === 'win') {
            modalTitle.textContent = 'You win!'
            modalPicture.src='img/won.png'
            modalPicture.alt='won'
            modalTitle.insertAdjacentHTML('afterend', `<div class="game__time">Game time: <span style="color: #FF4747; font-weight: bold">${gameTime}</span> sec.</div>`)
        } else {
            modalTitle.textContent = 'You lost!'
            modalPicture.src='img/lost.png'
            modalPicture.alt='lost'
        }
    }

    closeModal(gameResult) {
        const modal = document.querySelector('.modal__wrapper'),
              modalBg = document.querySelector('.modal__background'),
              modalTitle = document.querySelector('.modal__title'),
              gameTime = document.querySelector('.game__time')

        if (gameResult === 'win') gameTime.remove() // If it is a win, then he has playing time, that needs to be removed.
        modal.classList.remove('modal_active')
        modalBg.classList.remove('modalbg_active')
        modalTitle.textContent = ''
    }
}

class Card {
    constructor(card) {
        this.card = card
        this.animal = this.getRandomAnimal()
        this._state = 'default'
    }

    get state() {
        return this._state
    }

    set state(state) {
        return this._state = state
    }

    getRandomAnimal() {
        const animalIndex = Math.floor(Math.random() * MemoGame.animalsExpanded.length)
        const animal = MemoGame.animalsExpanded[animalIndex]

        this.card.setAttribute('data-animal', animal)

        const cardBack = this.card.querySelector('.card__back')
        cardBack.innerHTML = ''
        cardBack.insertAdjacentHTML('afterbegin', `<picture><img class="card__back-picture" src="img/animals/${animal}.png" alt="${animal}"/></picture>`)
        
        MemoGame.animalsExpanded.splice(animalIndex, 1)

        return animal
    }

    open() {
        MemoGame.closeAllErrorCards()

        if (MemoGame.timerC.isActive === false) MemoGame.start()

        this.state = 'open'
        this.card.classList.add('card_opened')
        MemoGame.cardsC.opened++

        if (MemoGame.cardsC.opened === 2) this.compareCards()
    }

    close() {
        this.state = 'default'
        this.card.classList.remove('card_opened', 'card_success')

        if (!this.card.classList.contains('card_error')) {
            MemoGame.cardsC.opened--
        } else {
            this.card.classList.remove('card_error')
        }
    }

    compareCards() {
        const cards = []

        // Collecting all open cards.
        for (let i = 1; i <= MemoGame.cardsTotal; i++) {
            const card = window['Card' + i]

            if (card.state === 'open') cards.push(card)
        }

        if (cards[0].animal === cards[1].animal) {
            cards[0].setSuccess()
            cards[1].setSuccess()
            
            MemoGame.cardsC.success++
        } else {
            cards[0].setError()
            cards[1].setError()
        }

        MemoGame.cardsC.opened = 0
        cards.length = 0
    }

    setSuccess() {
        this.state = 'success'
        this.card.classList.add('card_success')

        return this
    }

    setError() {
        this.state = 'error'
        this.card.classList.add('card_error')

        return this
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelector('.cards')
    const restart = document.querySelector('.restart')

    window.MemoGame = new Game(cards, cards.children.length) // Create game.

    document.querySelectorAll('.card').forEach((card, index) => {
        window['Card' + (index + 1)] = new Card(card) // Create objects for cards.
    })

    restart.addEventListener('click', MemoGame.restart.bind(MemoGame))
})