var apiKey;
var maxTokens;

function getApiKeyAndCheck(callback) {
  chrome.storage.local.get(["apiKey", "maxTokens"], function (data) {
    apiKey = data.apiKey;
    maxTokens = data.maxTokens;

    if (maxTokens < 10) {
      maxTokens = 10;
    }

    if (apiKey) {
      callback();
    } else {
      alert("Please set your OpenAI API key in the Options.");
      chrome.runtime.sendMessage({ action: "openOptionsPage" });
    }
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("XXX")
  if (request.message === "fixText") {
    getApiKeyAndCheck(function () {
      var selectedText = request.selectedText;
      var actionPrompt = prompt(
        "What would you like to do with this text?",
        "fix this text"
      );

      if (actionPrompt === null) {
        return;
      }

      actionPrompt =
        actionPrompt.trim() === "" ? "fix this text" : actionPrompt;

      var apiUrl = "https://api.openai.com/v1/chat/completions";

      setWinContent(
        template_start +
          `<div class="center spinner-grow" role="status"></div>` +
          template_end
      );

      fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a helpful assistant. Your task is to ${actionPrompt} provided by the user. You only give the desired output, no commentary needed, no extra information.`,
            },
            {
              role: "user",
              content: `${actionPrompt} the following text: "${selectedText}"`,
            },
          ],
          max_tokens: parseInt(maxTokens),
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            console.error("Error", data);
            setWinContent(
              "Error: " +
                data?.error?.message +
                " ( " +
                data?.error?.code +
                " )"
            );
          } else {
            var fixedText = (data?.choices[0]?.message?.content ?? "")
              .trim()
              .replace(/^"(.+)"$/, "$1");
            openFixedTextWindow(fixedText);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          setWinContent("Error: " + error);
        });
    });
  }
});

var newWindow = null;

function setWinContent(text) {
  console.log(newWindow);
  if (!newWindow || newWindow.closed) {
    newWindow = window.open("", "_blank", "width=600,height=400");
  }
  newWindow.document.body.innerHTML = text;
}

const template_start = `
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>b2's OpenAI Text Fixer / Text Helper</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css"
        integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
    <style>
        body {
            margin: 10px;
        }

        div {
            margin-bottom: 20px;
        }

        button {
            margin-top: 10px;
        }
        .center {
          border: 5px solid;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          padding: 10px;
        }
    </style>
</head>

<body>
`;

const template_end = `
</body>
`;

function openFixedTextWindow(fixedText) {
  setWinContent(
    template_start +
      `
    <pre class="form-control" id="txt" style="white-space: pre-wrap;">
 ` +
      fixedText +
      `
    </pre>
 ` +
      template_end
  );
}
