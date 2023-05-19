chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: "fix-text",
    title: "Fix / modify selected text with OpenAI",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  console.log(info, tab)
  if (info.menuItemId === "fix-text") {
    chrome.tabs.sendMessage(tab.id, {
      message: "fixText",
      selectedText: info.selectionText,
    });
  }
});

chrome.runtime.onMessage.addListener(function (message) {
  switch (message.action) {
    case "openOptionsPage":
      openOptionsPage();
      break;
    default:
      break;
  }
});

function openOptionsPage() {
  chrome.runtime.openOptionsPage();
}
