import store from '@/store'

import Overlay from '@/services/overlay'
import Recorder from '@/services/recorder'
import Shooter from '@/services/shooter'
import Controller from '@/services/controller'

window.headlessRecorder = new Controller({
  shooter: new Shooter(),
  overlay: new Overlay({ store }),
  recorder: new Recorder({ store }),
})

window.headlessRecorder.init()
