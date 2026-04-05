let boardFlipped = false
let originalCountryClass: string | null = null
let originalImageSrc: string | null = null
let originalImageSrcset: string | null = null

function applySettings() {
    chrome.storage.local.get(['hideElo', 'hideOpponentElo', 'hideCountry', 'hideName', 'hideImage', 'hideScore', 'hideChatInfo'], (result) => {
        if (result.hideElo) { hideMyElo(true) }
        if (result.hideOpponentElo) { hideOpponentElo(true) }
        if (result.hideCountry) { hideOpponentCountry(true) }
        if (result.hideName) { hideOpponentName(true) }
        if (result.hideImage) { hideOpponentImage(true) }
        if (result.hideScore) { hideScore(true) }
        if (result.hideChatInfo) { hideChatInfo(true) }
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
            if (changes.hideScore) { hideScore(changes.hideScore.newValue as boolean) }
            if (changes.hideChatInfo) { hideChatInfo(changes.hideChatInfo.newValue as boolean) }
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
let activeSettings = { hideUserElo: false, hideOpponentElo: false, hideOpponentCountry: false, hideOpponentName: false, hideOpponentImage: false, hideScore: false, hideChatInfo: false }

function startObserver() {
    if (globalObserver) return
    globalObserver = new MutationObserver(() => {
        if (activeSettings.hideUserElo) applyMyEloMask()
        if (activeSettings.hideOpponentElo) applyEloMask()
        if (activeSettings.hideOpponentCountry) applyCountryMask()
        if (activeSettings.hideOpponentName) applyNameMask()
        if (activeSettings.hideOpponentImage) applyImageMask()
        if (activeSettings.hideScore) applyScoreMask()
        if (activeSettings.hideChatInfo) applyChatInfoMask()
        if (activeSettings.hideUserElo || activeSettings.hideOpponentElo) applyRatingChangeMask()
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
        if (!activeSettings.hideOpponentElo) restoreRatingChange()
        return
    }

    if (hide) applyMyEloMask()
}

function applyMyEloMask() {
    applyRatingChangeMask()
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
        if (!activeSettings.hideUserElo) restoreRatingChange()
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
    applyRatingChangeMask()
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
        if (container) {
            const el = container.querySelector<HTMLElement>('.cc-country-flag-component.cc-country-flag-small[data-masked]')
            const fake = container.querySelector<HTMLElement>('[data-fake-flag]')
            if (el) {
                el.style.display = ''
                delete el.dataset.masked
            }
            fake?.remove()
            originalCountryClass = null
        }
        return
    }

    applyCountryMask()
}

function applyCountryMask() {
    const container = getOpponentElement()
    if (!container) return

    const el = container.querySelector<HTMLElement>('.cc-country-flag-component.cc-country-flag-small')
    if (!el || el.dataset.masked) return

    const countryClass = Array.from(el.classList).find(c => c.startsWith('country-'))
    if (!countryClass) return

    if (!originalCountryClass) {
        originalCountryClass = countryClass
    }

    el.style.display = 'none'
    el.dataset.masked = 'true'

    const fake = document.createElement('div')
    fake.className = 'cc-country-flag-component cc-country-flag-small country-1'
    fake.dataset.fakeFlag = 'true'
    el.insertAdjacentElement('afterend', fake)
}

function hideOpponentName(hide: boolean) {
    activeSettings.hideOpponentName = hide
    hide ? startObserver() : stopObserverIfUnneeded()

    if (!hide) {
        const container = getOpponentElement()
        const el = container?.querySelector<HTMLElement>('.cc-user-username-component')
        if (el?.dataset.originalName !== undefined) {
            el.textContent = el.dataset.originalName
            delete el.dataset.originalName
        }

        document.querySelectorAll<HTMLElement>('.user-tagline-chat-member').forEach(chatEl => {
            if (chatEl.dataset.originalName !== undefined) {
                chatEl.textContent = chatEl.dataset.originalName
                delete chatEl.dataset.originalName
            }
        })

        document.querySelectorAll<HTMLElement>('.game-rate-sport-message-component').forEach(el => {
            const link = el.querySelector<HTMLAnchorElement>('a.user-username')
            if (link?.dataset.originalName !== undefined) {
                link.textContent = link.dataset.originalName
                delete link.dataset.originalName
            }
        })

        return
    }

    if (hide) applyNameMask()
}

function applyNameMask() {
    const container = getOpponentElement()
    if (!container) return

    const el = container.querySelector<HTMLElement>('.cc-user-username-component')
    if (!el) return

    if (!el.dataset.originalName) {
        el.dataset.originalName = el.textContent ?? ''
    }

    if (el.textContent !== 'Opponent') {
        el.textContent = 'Opponent'
    }

    document.querySelectorAll<HTMLElement>('.user-tagline-chat-member').forEach(chatEl => {
        if (!chatEl.dataset.originalName) {
            chatEl.dataset.originalName = chatEl.textContent ?? ''
        }
        if (chatEl.textContent !== 'Opponent:') {
            chatEl.textContent = 'Opponent:'
        }
    })

    document.querySelectorAll<HTMLElement>('.game-rate-sport-message-component').forEach(el => {
        const link = el.querySelector<HTMLAnchorElement>('a.user-username')
        if (!link) return
        if (!link.dataset.originalName) {
            link.dataset.originalName = link.textContent ?? ''
        }
        if (link.textContent !== 'your Opponent') {
            link.textContent = 'your Opponent'
        }
    })
}

function hideOpponentImage(hide: boolean) {
    activeSettings.hideOpponentImage = hide
    hide ? startObserver() : stopObserverIfUnneeded()

    if (!hide) {
        const container = getOpponentElement()
        const el = container?.querySelector<HTMLImageElement>('.cc-avatar-img')
        if (el && originalImageSrc) {
            el.src = originalImageSrc
            el.srcset = originalImageSrcset ?? ''
            originalImageSrc = null
            originalImageSrcset = null
        }
        return
    }

    if (hide) applyImageMask()
}

function applyImageMask() {
    const container = getOpponentElement()
    if (!container) return

    const el = container.querySelector<HTMLImageElement>('.cc-avatar-img')
    if (!el) return

    if (!originalImageSrc) {
        originalImageSrc = el.src
        originalImageSrcset = el.srcset
    }

    el.src = 'https://www.chess.com/bundles/web/images/black_400.png'
    el.srcset = ''
}

function hideScore(hide: boolean) {
    activeSettings.hideScore = hide
    hide ? startObserver() : stopObserverIfUnneeded()

    if (!hide) {
        document.querySelectorAll<HTMLElement>('.grudge-score-component').forEach(el => {
            el.style.display = ''
        })
        return
    }

    if (hide) applyScoreMask()
}

function applyScoreMask() {
    document.querySelectorAll<HTMLElement>('.grudge-score-component').forEach(el => {
        el.style.display = 'none'
    })
}

function hideChatInfo(hide: boolean) {
    activeSettings.hideChatInfo = hide
    hide ? startObserver() : stopObserverIfUnneeded()

    if (!hide) {
        const container = document.querySelector('.chat-room-chat')
        container?.querySelectorAll<HTMLElement>('.game-start-message-component').forEach(el => {
            if (el.dataset.originalText !== undefined) {
                el.textContent = el.dataset.originalText
                delete el.dataset.originalText
            }
        })
        return
    }

    if (hide) applyChatInfoMask()
}

function applyChatInfoMask() {
    const container = document.querySelector('.chat-room-chat')
    if (!container) return

    container.querySelectorAll<HTMLElement>('.game-start-message-component').forEach(el => {
        if (!el.dataset.originalText) {
            el.dataset.originalText = el.textContent ?? ''
        }
        if (el.textContent !== 'Game started') {
            el.textContent = 'Game started'
        }
    })

    container.querySelectorAll<HTMLElement>('.game-over-message-component').forEach(el => {
        if (!el.dataset.originalText) {
            el.dataset.originalText = el.textContent ?? ''
        }
        if (el.textContent !== 'Game over') {
            el.textContent = 'Game over'
        }
    })
}

function applyRatingChangeMask() {
    if (document.getElementById('rating-change-hide-style')) return
    const style = document.createElement('style')
    style.id = 'rating-change-hide-style'
    style.textContent = '.rating-score-change { visibility: hidden !important; }'
    document.head.appendChild(style)
}

function restoreRatingChange() {
    document.getElementById('rating-change-hide-style')?.remove()
}