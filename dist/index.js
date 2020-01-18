"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const querystring_1 = __importDefault(require("querystring"));
const node_notifier_1 = __importDefault(require("node-notifier"));
const battery_level_1 = __importDefault(require("battery-level"));
const is_charging_1 = __importDefault(require("is-charging"));
const IP = '192.168.88.229';
const PORT = 80;
const USER = 'user';
const PASSWORD = 'password';
const send = (enabled = false) => {
    const body = querystring_1.default.encode({ btnpwr: enabled ? 'on' : 'off' });
    const options = {
        hostname: IP,
        port: PORT,
        path: '/index.html',
        method: 'POST',
        headers: {
            'Content-Length': body.length,
            'Authorization': `Basic ${new Buffer(`${USER}:${PASSWORD}`).toString('base64')}`,
        },
    };
    return new Promise((resolve, reject) => {
        const req = http_1.default.request(options, () => {
            return resolve();
        });
        req.on('error', (err) => {
            node_notifier_1.default.notify({
                title: `Request error: ${err.name}`,
                message: err.message,
            });
            return reject(err);
        });
        req.write(body);
        req.end();
    });
};
const stopCharging = (level, chargingStatus) => __awaiter(void 0, void 0, void 0, function* () {
    if (!chargingStatus) {
        return;
    }
    yield send(false);
    node_notifier_1.default.notify({
        title: 'Stop charging',
        message: `${level * 100}%`,
    });
});
const startCharging = (level, chargingStatus) => __awaiter(void 0, void 0, void 0, function* () {
    if (chargingStatus) {
        return;
    }
    yield send(true);
    node_notifier_1.default.notify({
        title: 'Battery status',
        message: `${level * 100}%`,
    });
});
const check = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [level, chargingStatus] = yield Promise.all([
            battery_level_1.default(),
            is_charging_1.default(),
        ]);
        if (level <= 0.4) {
            return startCharging(level, chargingStatus);
        }
        if (level >= 0.8) {
            return stopCharging(level, chargingStatus);
        }
    }
    catch (err) {
        node_notifier_1.default.notify({
            title: 'Error',
            message: err.message,
        });
    }
});
setInterval(() => check(), 60 * 1000);
//# sourceMappingURL=index.js.map