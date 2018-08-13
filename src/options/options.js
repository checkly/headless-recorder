// Saves options to chrome.storage
const defaults = {
  codeOptions: {
    asyncWrapper: true
  }
}

function saveOptions () {
  const asyncWrapper = document.getElementById('asyncWrapper').checked
  chrome.storage.local.set({
    codeOptions: {
      asyncWrapper
    }
  }, () => {
    var status = document.getElementById('status')
    status.textContent = 'Options saved.'
    setTimeout(() => { status.textContent = '' }, 750)
  })
}

function restoreOptions () {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.local.get(defaults, (items) => {
    console.log(items)
    document.getElementById('asyncWrapper').checked = items.codeOptions.asyncWrapper
  })
}
document.addEventListener('DOMContentLoaded', restoreOptions)
document.getElementById('save').addEventListener('click', saveOptions)
