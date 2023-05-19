document.getElementById("save").addEventListener("click", saveOptions);

function saveOptions() {
  var apiKey = document.getElementById("apikey").value;
  var maxTokens = document.getElementById("maxTokens").value;
  chrome.storage.local.set(
    { apiKey: apiKey, maxTokens: maxTokens },
    function () {
      var status = document.getElementById("status");
      status.textContent = "API Key and Max Tokens saved.";
      setTimeout(function () {
        status.textContent = "";
      }, 1000);
    }
  );
}

function restoreOptions() {
  chrome.storage.local.get(["apiKey", "maxTokens"], function (items) {
    document.getElementById("apikey").value = items.apiKey || "";
    document.getElementById("maxTokens").value = items.maxTokens || "";
  });
}
document.addEventListener("DOMContentLoaded", restoreOptions);
