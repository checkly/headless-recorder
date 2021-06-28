import store from '@/store'

import Overlay from '@/modules/overlay'
import Recorder from '@/modules/recorder'
import Shooter from '@/modules/shooter'
import Controller from '@/modules/controller'

window.headlessRecorder = new Controller({
  shooter: new Shooter(),
  overlay: new Overlay({ store }),
  recorder: new Recorder({ store }),
})

window.headlessRecorder.init()
