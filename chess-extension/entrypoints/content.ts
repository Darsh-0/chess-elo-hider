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

let globalObserver: MutationObserver | null = null
let activeSettings = { hideUserElo: false, hideOpponentElo: false, hideOpponentCountry: false, hideOpponentName: false, hideOpponentImage: false}

function startObserver() {
    if (globalObserver) return
    globalObserver = new MutationObserver(() => {
        if (activeSettings.hideUserElo) applyMyEloMask()
        if (activeSettings.hideOpponentElo) applyEloMask()
        if (activeSettings.hideOpponentCountry) applyCountryMask()
        if (activeSettings.hideOpponentName) applyEloMask()
        if (activeSettings.hideOpponentImage) applyEloMask()
    })
    globalObserver.observe(document.body, { childList: true, subtree: true, characterData: true })
}

function stopObserverIfUnneeded() {
    if (!Object.values(activeSettings).some(Boolean)) {
        globalObserver?.disconnect()
        globalObserver = null
    }
}

function hideMyElo(hide: boolean) {
    activeSettings.hideUserElo = hide
    hide ? startObserver() : stopObserverIfUnneeded()

    if (!hide) {
        const container = getUserElement()
        const el = container?.querySelector<HTMLElement>('.cc-text-medium.cc-user-rating-white')
        if (el?.dataset.originalElo !== undefined) {
            el.textContent = el.dataset.originalElo
            delete el.dataset.originalElo
        }
        return
    }

    if (hide) applyMyEloMask()
}

function applyMyEloMask() {
    const container = getUserElement()
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

function getUserElement(): HTMLElement | null {
    const containerSelector = boardFlipped
        ? '.board-layout-player.board-layout-top.player-component.player-top'
        : '.board-layout-player.board-layout-bottom.player-component.player-bottom'

    return document.querySelector(containerSelector)
}

function hideOpponentElo(hide: boolean) {
    activeSettings.hideOpponentElo = hide
    hide ? startObserver() : stopObserverIfUnneeded()

    if (!hide) {
        const container = getOpponentElement()
        const el = container?.querySelector<HTMLElement>('.cc-text-medium.cc-user-rating-white')
        if (el?.dataset.originalElo !== undefined) {
            el.textContent = el.dataset.originalElo
            delete el.dataset.originalElo
        }
        return
    }

    if (hide) applyEloMask()
}

function getOpponentElement(): HTMLElement | null {
    const containerSelector = boardFlipped
        ? '.board-layout-player.board-layout-bottom.player-component.player-bottom'
        : '.board-layout-player.board-layout-top.player-component.player-top'

    return document.querySelector(containerSelector)
}

function applyEloMask() {
    const container = getOpponentElement()
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
    activeSettings.hideOpponentCountry = hide
    hide ? startObserver() : stopObserverIfUnneeded()

    if (!hide) {
        const container = getOpponentElement()
        const el = container?.querySelector<HTMLElement>('.cc-country-flag-component.cc-country-flag-small')
        if (el?.dataset.originalCountry) {
            const current = Array.from(el.classList).find(c => c.startsWith('country-'))
            if (current) el.classList.remove(current)
            el.classList.add(el.dataset.originalCountry)
            el.innerHTML = el.dataset.originalHtml ?? ''
            delete el.dataset.originalCountry
            delete el.dataset.originalHtml
        }
        return
    }

    applyCountryMask()
}

function applyCountryMask() {
    const container = getOpponentElement()
    if (!container) return

    const el = container.querySelector<HTMLElement>('.cc-country-flag-component.cc-country-flag-small')
    if (!el) return

    const countryClass = Array.from(el.classList).find(c => c.startsWith('country-'))
    if (!countryClass) return

    if (!el.dataset.originalCountry) {
        el.dataset.originalCountry = countryClass
        el.dataset.originalHtml = el.innerHTML
    }

    el.classList.remove(countryClass)
    el.classList.add('country-1')
    el.innerHTML = ''
}

function hideOpponentName(hide: boolean) {

}

function hideOpponentImage(hide: boolean) {

}
