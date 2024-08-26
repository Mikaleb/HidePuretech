/**
 * When chrome extension icon is clicked, append a button to
 * the DOM that when clicked sends an alert 'Hey WittCode!'
 */
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting
    .executeScript({
      func: () => {
        const myButton: HTMLButtonElement = document.createElement("button");
        myButton.textContent = "Say hi to Mikaleb!";
        myButton.onclick = () => {
          alert("Hey Mikaleb!");
        };
        document.body.appendChild(myButton);
      },
      target: {
        tabId: tab.id || 0,
      },
    })
    .then(() => {
      console.log("Button inserted");
    })
    .catch((err) => {
      console.error("Button not inserted", err);
    });
});
