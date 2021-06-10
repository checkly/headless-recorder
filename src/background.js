browser.runtime.onMessage.addListener(function() {
  console.log("Hello from the background");

  browser.tabs.executeScript({
    file: "content-script.js"
  });
});
