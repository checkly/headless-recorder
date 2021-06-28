import express from 'express'
import path from 'path'

export const waitForAndGetEvents = async function(page, amount) {
  await waitForRecorderEvents(page, amount)
  return getEventLog(page)
}

export const waitForRecorderEvents = function(page, amount) {
  return page.waitForFunction(`window.eventRecorder._getEventLog().length >= ${amount || 1}`)
}

export const getEventLog = function(page) {
  return page.evaluate(() => {
    return window.eventRecorder._getEventLog()
  })
}

export const cleanEventLog = function(page) {
  return page.evaluate(() => {
    return window.eventRecorder._clearEventLog()
  })
}

export const startServer = function(buildDir, file) {
  return new Promise(resolve => {
    const app = express()
    app.use('/build', express.static(path.join(__dirname, buildDir)))
    app.get('/', (req, res) => {
      res.status(200).sendFile(file, { root: __dirname })
    })
    let server
    let port
    const retry = e => {
      if (e.code === 'EADDRINUSE') {
        setTimeout(() => connect, 1000)
      }
    }
    const connect = () => {
      port = 0 | (Math.random() * 1000 + 3000)
      server = app.listen(port)
      server.once('error', retry)
      server.once('listening', () => {
        return resolve({ server, port })
      })
    }
    connect()
  })
}
