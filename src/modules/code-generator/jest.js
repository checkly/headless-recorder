import Block from '@/modules/code-generator/block'
import { headlessActions } from '@/modules/code-generator/constants'
import BaseGenerator from '@/modules/code-generator/base-generator'

const header = `describe("Scenario 1", () => {
	beforeAll(async () => {
		jest.setTimeout(20000); // allow longer than 5 sec default for page load waits
	});
    
    it("Testcase 1", async () => {`

const footer = `	});
});`

export default class JestCodeGenerator extends BaseGenerator {
  constructor(options) {
    super(options)
    this._header = header
    this._footer = footer
    this._wrappedHeader = header
    this._wrappedFooter = footer
  }

  generate(events) {
    return this._getHeader() + this._parseEvents(events) + this._getFooter()
  }

  _handleViewport(width, height) {
    return new Block(this._frameId, {
      type: headlessActions.VIEWPORT,
      value: `await ${this._frame}.setViewport({ width: ${width}, height: ${height} })`,
    })
  }
}

