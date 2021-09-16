import store from '@/store'

import Overlay from '@/modules/overlay'
import Recorder from '@/modules/recorder'

import HeadlessController from '@/content-scripts/controller'

window.headlessRecorder = new HeadlessController({
  overlay: new Overlay({ store }),
  recorder: new Recorder({ store }),
  store,
})

window.headlessRecorder.init()
