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
const node_notifier_1 = __importDefault(require("node-notifier"));
const battery_level_1 = __importDefault(require("battery-level"));
const is_charging_1 = __importDefault(require("is-charging"));
const stopCharging = (level) => {
    console.log('Stop charging');
    node_notifier_1.default.notify({
        title: 'Stop charging',
        message: `${level * 100}%`,
    });
};
const startCharging = (level) => {
    console.log('Start charging');
    node_notifier_1.default.notify({
        title: 'Battery status',
        message: `${level * 100}%`,
    });
};
const check = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [level, chargingStatus] = yield Promise.all([
            battery_level_1.default(),
            is_charging_1.default(),
        ]);
        console.log(level, chargingStatus);
        if (level <= 0.4) {
            return startCharging(level);
        }
        if (level >= 0.8) {
            return stopCharging(level);
        }
    }
    catch (err) {
        node_notifier_1.default.notify({
            title: 'Error',
            message: err.message,
        });
    }
});
check();
setInterval(() => check(), 10 * 1000);
//# sourceMappingURL=index.js.map