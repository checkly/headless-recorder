import store from '@/store'

import Overlay from '@/modules/overlay'
import Shooter from '@/modules/shooter'
import Recorder from '@/modules/recorder'

import HeadlessController from '@/content-scripts/controller'

window.headlessRecorder = new HeadlessController({
  shooter: new Shooter(),
  overlay: new Overlay({ store }),
  recorder: new Recorder({ store }),
  store,
})

window.headlessRecorder.init()
