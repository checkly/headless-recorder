export default class LinesWrapper {
  constructor (frameId, line) {
    this._lines = []
    this._frameId = frameId

    if (line) {
      line.frameId = this._frameId
      this._lines.push(line)
    }
  }

  addToTop (line) {
    line.frameId = this._frameId
    this._lines.unshift(line)
  }

  push (line) {
    line.frameId = this._frameId
    this._lines.push(line)
  }

  getLines () {
    return this._lines
  }
}
