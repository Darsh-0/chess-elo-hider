export default defineBackground(() => {
  function updateIcon(tabId: number, url?: string) {
    const isChess = url?.includes('chess.com')
    chrome.action.setIcon({
      tabId,
      path: {
        16: isChess ? 'icon/16.png' : 'icon/16-grey.png',
        32: isChess ? 'icon/32.png' : 'icon/32-grey.png',
      }
    })
  }

  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.id) updateIcon(tab.id, tab.url)
    })
  })

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      updateIcon(tabId, tab.url)
    }
  })

  chrome.tabs.onActivated.addListener(({ tabId }) => {
    chrome.tabs.get(tabId, (tab) => {
      updateIcon(tabId, tab.url)
    })
  })
})