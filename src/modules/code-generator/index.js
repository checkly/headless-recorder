import PuppeteerCodeGenerator from '@/modules/code-generator/puppeteer'
import PlaywrightCodeGenerator from '@/modules/code-generator/playwright'
import JestCodeGenerator from '@/modules/code-generator/jest'

export default class CodeGenerator {
  constructor(options = {}) {
    this.puppeteerGenerator = new PuppeteerCodeGenerator(options)
    this.playwrightGenerator = new PlaywrightCodeGenerator(options)
    this.jestGenerator = new JestCodeGenerator(options)
  }

  generate(recording) {
    return {
      puppeteer: this.puppeteerGenerator.generate(recording),
      playwright: this.playwrightGenerator.generate(recording),
      jest: this.jestGenerator.generate(recording),
    }
  }
}
