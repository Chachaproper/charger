import http, { RequestOptions } from 'http'
import qs from 'querystring'
import env from 'dotenv'
import nodeNotifier from 'node-notifier'
import batteryLevel from 'battery-level'
import isCharging from 'is-charging'

env.config();

const IP = process.env.HOST || '192.168.88.229'
const PORT = process.env.PORT || 80
const LOGIN = process.env.LOGIN || 'user'
const PASSWORD = process.env.PASSWORD || 'password'

console.log(IP, PORT, LOGIN, PASSWORD);

const send = (enabled: boolean = false): Promise<any> => {
  const body =  qs.encode({ btnpwr: enabled ? 'on' : 'off' })

  const options: RequestOptions = {
    hostname: IP,
    port: PORT,
    path: '/index.html',
    method: 'POST',
    headers: {
      'Content-Length': body.length,
      'Authorization': `Basic ${new Buffer(`${LOGIN}:${PASSWORD}`).toString('base64')}`,
    },
  }

  return new Promise((resolve, reject) => {
    const req = http.request(options, () => {
      return resolve()
    })

    req.on('error', (err) => {
      nodeNotifier.notify({
        title: `Request error: ${err.name}`,
        message: err.message,
      })

      return reject(err)
    })

    req.write(body)
    req.end()
  })
}

const stopCharging = async (level: number, chargingStatus: boolean) => {
  if (!chargingStatus) {
    return
  }

  await send(false)

  console.log(`${new Date()} stop charging`);

  nodeNotifier.notify({
    title: 'Stop charging',
    message: `${level * 100}%`,
  })
}

const startCharging = async (level: number, chargingStatus: boolean) => {
  if (chargingStatus) {
    return
  }

  await send(true)

  console.log(`${new Date()} start charging`);

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

    console.log(`${new Date()}: checking, batteryLevel: ${level}, isCharging: ${chargingStatus}`);

    if (level <= 0.4) {
      return startCharging(level, chargingStatus)
    }

    if (level >= 0.8) {
      return stopCharging(level, chargingStatus)
    }
  } catch (err) {
    console.error(`${new Date()}: check err`);
    console.error(err.message);

    nodeNotifier.notify({
      title: 'Error',
      message: err.message,
    })
  }
}

console.log(`${new Date()}: start`);

setInterval(() => check(), 60 * 1000)
