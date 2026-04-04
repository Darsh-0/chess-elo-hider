let boardFlipped = false

function applySettings() {
    chrome.storage.local.get(['hideElo', 'hideOpponentElo', 'hideCountry', 'hideName', 'hideImage'], (result) => {
        if (result.hideElo) { hideMyElo(true) }
        if (result.hideOpponentElo) { hideOpponentElo(true) }
        if (result.hideCountry) { hideOpponentCountry(true) }
        if (result.hideName) { hideOpponentName(true) }
        if (result.hideImage) { hideOpponentImage(true) }
    })
}

export default defineContentScript({
    matches: ['*://www.chess.com/*'],
    main() {
        console.log('content script running')
        applySettings()

        chrome.storage.onChanged.addListener((changes) => {
            if (changes.hideElo) { hideMyElo(changes.hideElo.newValue as boolean) }
            if (changes.hideOpponentElo) { hideOpponentElo(changes.hideOpponentElo.newValue as boolean) }
            if (changes.hideCountry) { hideOpponentCountry(changes.hideCountry.newValue as boolean) }
            if (changes.hideName) { hideOpponentName(changes.hideName.newValue as boolean) }
            if (changes.hideImage) { hideOpponentImage(changes.hideImage.newValue as boolean) }
        })

        waitForElement('#board-controls-images-palette', () => {
            waitForElement('#board-controls-flip', (el) => {
                el.addEventListener('click', () => {
                    boardFlipped = !boardFlipped
                    applySettings()
                    console.log('Board flipped:', boardFlipped)
                })
            })
        })
    }
})

function waitForElement(selector: string, callback: (el: HTMLElement) => void) {
    const el = document.querySelector(selector)
    if (el) return callback(el as HTMLElement)

    const observer = new MutationObserver(() => {
        const el = document.querySelector(selector)
        if (el) {
            observer.disconnect()
            callback(el as HTMLElement)
        }
    })
    observer.observe(document.body, { childList: true, subtree: true })
}

function hideMyElo(hide: boolean) {

}

let eloObserver: MutationObserver | null = null

function hideOpponentElo(hide: boolean) {
    eloObserver?.disconnect()
    eloObserver = null

    if (!hide) {
        const container = getEloElement()
        const el = container?.querySelector<HTMLElement>('.cc-text-medium.cc-user-rating-white')
        if (el?.dataset.originalElo !== undefined) {
            el.textContent = el.dataset.originalElo
            delete el.dataset.originalElo
        }
        return
    }

    applyEloMask()

    eloObserver = new MutationObserver(() => applyEloMask())
    eloObserver.observe(document.body, { childList: true, subtree: true, characterData: true })
}

function getEloElement(): HTMLElement | null {
    const containerSelector = boardFlipped
        ? '.board-layout-player.board-layout-bottom.player-component.player-bottom'
        : '.board-layout-player.board-layout-top.player-component.player-top'

    return document.querySelector(containerSelector)
}

function applyEloMask() {
    const container = getEloElement()
    if (!container) return

    const el = container.querySelector<HTMLElement>('.cc-text-medium.cc-user-rating-white')
    if (!el) return

    if (!el.dataset.originalElo) {
        el.dataset.originalElo = el.textContent ?? ''
    }

    if (el.textContent !== ' (????) ') {
        el.textContent = ' (????) '
    }
}

function hideOpponentCountry(hide: boolean) {

}

function hideOpponentName(hide: boolean) {

}

function hideOpponentImage(hide: boolean) {

}
