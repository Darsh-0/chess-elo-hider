export default defineBackground(() => {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete' && tab.url?.includes('chess.com')) {
            chrome.action.setIcon({
                tabId,
                path: {
                    16: browser.runtime.getURL('/icon/16.png'),
                }
            })
        } else if (changeInfo.status === 'complete') {
            chrome.action.setIcon({
                tabId,
                path: {
                    16: browser.runtime.getURL('/icon-grey/16.png'),
                }
            })
        }
    })
})