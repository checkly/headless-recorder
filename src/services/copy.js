// copyCode() {
//   navigator.permissions.query({ name: 'clipboard-write' }).then(result => {
//     if (result.state == 'granted' || result.state == 'prompt') {
//       this.isCopying = true
//       setTimeout(() => {
//         this.isCopying = false
//         navigator.clipboard.writeText(this.code)
//       }, 500)
//     }
//   })
// },
