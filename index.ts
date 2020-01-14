import nodeNotifier from 'node-notifier'
import batteryLevel from 'battery-level'
import isCharging from 'is-charging'

const stopCharging = (level: number, chargingStatus: boolean) => {
  if (!chargingStatus) {
    return
  }

  nodeNotifier.notify({
    title: 'Stop charging',
    message: `${level * 100}%`,
  })
}

const startCharging = (level: number, chargingStatus: boolean) => {
  if (!chargingStatus) {
    return
  }

  nodeNotifier.notify({
    title: 'Battery status',
    message: `${level * 100}%`,
  })
}


const check = async () => {
  try {
    const [level, chargingStatus] = await Promise.all([
      batteryLevel(),
      isCharging(),
    ])

    if (level <= 0.4) {
      return startCharging(level, chargingStatus)
    }

    if (level >= 0.8) {
      return stopCharging(level, chargingStatus)
    }
  } catch (err) {
    nodeNotifier.notify({
      title: 'Error',
      message: err.message,
    })
  }
}

setInterval(() => check(), 60 * 1000)
