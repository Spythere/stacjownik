"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var vuex_module_decorators_1 = require("vuex-module-decorators");
var axios_1 = require("axios");
var stations_json_1 = require("@/data/stations.json");
var ConnState;
(function (ConnState) {
    ConnState[ConnState["Loading"] = 0] = "Loading";
    ConnState[ConnState["Error"] = 1] = "Error";
    ConnState[ConnState["Connected"] = 2] = "Connected";
})(ConnState || (ConnState = {}));
var Store = /** @class */ (function (_super) {
    __extends(Store, _super);
    function Store() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.trainCount = 0;
        _this.stationCount = 0;
        _this.connectionState = ConnState.Loading;
        _this.apiURLS = {
            stationDataURL: "https://api.td2.info.pl:9640/?method=getStationsOnline",
            trainDataURL: "https://api.td2.info.pl:9640/?method=getTrainsOnline",
            dispatcherDataURL: "https://api.td2.info.pl:9640/?method=readFromSWDR&value=getDispatcherStatusList%3B1"
        };
        _this.stations = [];
        _this.filteredStations = [];
        _this.filterInitStates = {
            "default": false,
            notDefault: false,
            nonPublic: false,
            SPK: false,
            SCS: false,
            ręczne: false,
            mechaniczne: false,
            współczesna: false,
            kształtowa: false,
            historyczna: false,
            mieszana: false,
            minLevel: 0,
            minOneWayCatenary: 0,
            minOneWay: 0,
            minTwoWayCatenary: 0,
            minTwoWay: 0,
            "no-1track": false,
            "no-2track": false,
            free: true,
            occupied: false,
            ending: false
        };
        _this.filters = __assign({}, _this.filterInitStates);
        return _this;
    }
    Object.defineProperty(Store.prototype, "getStationCount", {
        get: function () {
            return this.stationCount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Store.prototype, "getTrainCount", {
        get: function () {
            return this.trainCount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Store.prototype, "getStations", {
        get: function () {
            return this.filteredStations;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Store.prototype, "getAllStations", {
        get: function () {
            return this.stations;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Store.prototype, "getFilters", {
        get: function () {
            return this.filters;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Store.prototype, "getConnectionState", {
        get: function () {
            return this.connectionState;
        },
        enumerable: false,
        configurable: true
    });
    Store.prototype.setFilter = function (payload) {
        this.context.commit("mutateFilter", payload);
        this.context.commit("filterStations");
    };
    Store.prototype.resetFilters = function () {
        this.context.commit("resetFilterList");
        this.context.commit("filterStations");
    };
    Store.prototype.initStations = function () {
        var _this = this;
        this.context.commit("loadAllStations");
        this.context.dispatch("fetchStations");
        setInterval(function () { return _this.context.dispatch("fetchStations"); }, 15000);
    };
    Store.prototype.fetchStations = function () {
        var _this = this;
        var onlineStationsData;
        var onlineDispatchersData;
        var onlineTrainsData;
        var queryStations = (function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1["default"].get(this.apiURLS.stationDataURL)];
                    case 1: return [2 /*return*/, (_a.sent()).data.message];
                }
            });
        }); })();
        var queryTrains = (function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1["default"].get(this.apiURLS.trainDataURL)];
                    case 1: return [4 /*yield*/, (_a.sent()).data.message];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        }); })();
        var queryDisptachers = (function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1["default"].get(this.apiURLS.dispatcherDataURL)];
                    case 1: return [4 /*yield*/, (_a.sent()).data
                            .message];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        }); })();
        Promise.all([queryStations, queryTrains, queryDisptachers])
            .then(function (response) {
            onlineStationsData = response[0];
            onlineTrainsData = response[1];
            onlineDispatchersData = response[2];
            var updatedStations = onlineStationsData
                .filter(function (station) { return station.region === "eu" && station.isOnline; })
                .map(function (station) {
                var stationStatus = onlineDispatchersData.find(function (status) { return status[0] == station.stationHash && status[1] == "eu"; });
                var statusLabel = "";
                var statusTimestamp = -1;
                if (!stationStatus)
                    statusLabel = "NIEZALOGOWANY";
                else {
                    var statusCode = stationStatus[2];
                    statusTimestamp = stationStatus[3];
                    statusLabel = "NIEDOSTĘPNY";
                    switch (statusCode) {
                        case 0:
                            if (statusTimestamp - Date.now() > 21000000)
                                statusLabel = "BEZ LIMITU";
                            else
                                statusLabel =
                                    "DO " +
                                        new Date(statusTimestamp).toLocaleTimeString("en-US", {
                                            hour12: false,
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        });
                            break;
                        case 1:
                            statusLabel = "Z/W";
                            break;
                        case 2:
                            if (statusTimestamp == 0)
                                statusLabel = "KOŃCZY";
                            break;
                        case 3:
                            statusLabel = "BRAK MIEJSCA";
                            break;
                        default:
                            break;
                    }
                }
                var trains = onlineTrainsData.filter(function (train) {
                    return train.region === "eu" &&
                        train.isOnline &&
                        train.station.stationName === station.stationName;
                });
                var stationData = stations_json_1["default"].find(function (s) { return s.stationName === station.stationName; }) || { stationName: station.stationName, stationURL: "" };
                return __assign(__assign({}, stationData), { stationHash: station.stationHash, maxUsers: station.maxUsers, currentUsers: station.currentUsers, spawnString: station.spawnString &&
                        station.spawnString
                            .split(";")
                            .map(function (v) {
                            return v.split(",")[6] ? v.split(",")[6] : v.split(",")[0];
                        }), dispatcherName: station.dispatcherName, dispatcherRate: station.dispatcherRate, dispatcherId: station.dispatcherId, dispatcherExp: station.dispatcherExp, occupiedTo: statusLabel, statusTimestamp: statusTimestamp,
                    trains: trains });
            });
            _this.context.commit("updateStations", {
                updatedStations: updatedStations,
                trainCount: onlineTrainsData.filter(function (train) { return train.isOnline && train.region === "eu"; }).length
            });
            _this.context.commit("filterStations");
            _this.context.commit("setConnState", ConnState.Connected);
        })["catch"](function (err) {
            _this.context.commit("setConnState", ConnState.Error);
        });
    };
    Store.prototype.filterStations = function () {
        var _this = this;
        this.filteredStations = this.stations.filter(function (station) {
            if ((station.nonPublic || !station.reqLevel) && _this.filters["nonPublic"])
                return false;
            if (!station.reqLevel || station.reqLevel == "-1")
                return true;
            if (station.online &&
                station.occupiedTo == "KOŃCZY" &&
                _this.filters["ending"])
                return false;
            if (station.online && _this.filters["occupied"])
                return false;
            if (!station.online && _this.filters["free"])
                return false;
            if (station["default"] && _this.filters["default"])
                return false;
            if (!station["default"] && _this.filters["notDefault"])
                return false;
            if (station.reqLevel < _this.filters["minLevel"])
                return false;
            if (_this.filters["no-1track"] &&
                (station.routes.oneWay.catenary != 0 ||
                    station.routes.oneWay.noCatenary != 0))
                return false;
            if (_this.filters["no-2track"] &&
                (station.routes.twoWay.catenary != 0 ||
                    station.routes.twoWay.noCatenary != 0))
                return false;
            if (station.routes.oneWay.catenary < _this.filters["minOneWayCatenary"])
                return false;
            if (station.routes.oneWay.noCatenary < _this.filters["minOneWay"])
                return false;
            if (station.routes.twoWay.catenary < _this.filters["minTwoWayCatenary"])
                return false;
            if (station.routes.twoWay.noCatenary < _this.filters["minTwoWay"])
                return false;
            if (_this.filters[station.controlType])
                return false;
            if (_this.filters[station.signalType])
                return false;
            if (_this.filters["SPK"] && station.controlType.includes("SPK"))
                return false;
            if (_this.filters["SCS"] && station.controlType.includes("SCS"))
                return false;
            if (_this.filters["mechaniczne"] &&
                station.controlType.includes("mechaniczne"))
                return false;
            if (_this.filters["ręczne"] && station.controlType.includes("ręczne"))
                return false;
            return true;
        });
    };
    Store.prototype.loadAllStations = function () {
        this.stations = stations_json_1["default"].map(function (stationData) { return (__assign({ stationProject: "", spawnString: "", stationHash: "", maxUsers: 0, currentUsers: 0, dispatcherName: "", dispatcherRate: 0, dispatcherExp: -1, dispatcherId: 0, online: false, occupiedTo: "WOLNA", statusTimestamp: 0 }, stationData)); });
    };
    Store.prototype.updateStations = function (_a) {
        var _this = this;
        var updatedStations = _a.updatedStations, trainCount = _a.trainCount;
        var _loop_1 = function (i) {
            var toUpdate = updatedStations.find(function (updated) { return updated.stationName === _this.stations[i].stationName; });
            if (!toUpdate) {
                this_1.stations[i].online = false;
                this_1.stations[i].occupiedTo = "WOLNA";
                this_1.stations[i].statusTimestamp = -1;
                this_1.stations[i].dispatcherExp = -1;
                return "continue";
            }
            this_1.stations[i] = __assign(__assign({}, this_1.stations[i]), toUpdate);
            this_1.stations[i].online = true;
            updatedStations = updatedStations.filter(function (updated) { return updated.stationName !== _this.stations[i].stationName; });
        };
        var this_1 = this;
        for (var i = 0; i < this.stations.length; i++) {
            _loop_1(i);
        }
        // Dodawanie do listy online potencjalnych scenerii niewpisanych do bazy
        updatedStations.forEach(function (updated) {
            var toUpdate = _this.stations.find(function (station) { return station.stationName === updated.stationName; });
            if (!toUpdate) {
                _this.stations.push(__assign(__assign({}, updated), { online: true, reqLevel: "-1" }));
            }
        });
        // Aktualizacja liczników
        this.stationCount = this.stations.filter(function (station) { return station.online; }).length;
        this.trainCount = trainCount;
    };
    Store.prototype.mutateFilter = function (payload) {
        this.filters[payload.filterName] = payload.value;
    };
    Store.prototype.resetFilterList = function () {
        this.filters = __assign({}, this.filterInitStates);
    };
    Store.prototype.setConnState = function (state) {
        this.connectionState = state;
    };
    __decorate([
        vuex_module_decorators_1.Action
    ], Store.prototype, "setFilter");
    __decorate([
        vuex_module_decorators_1.Action
    ], Store.prototype, "resetFilters");
    __decorate([
        vuex_module_decorators_1.Action
    ], Store.prototype, "initStations");
    __decorate([
        vuex_module_decorators_1.Action
    ], Store.prototype, "fetchStations");
    __decorate([
        vuex_module_decorators_1.Mutation
    ], Store.prototype, "filterStations");
    __decorate([
        vuex_module_decorators_1.Mutation
    ], Store.prototype, "loadAllStations");
    __decorate([
        vuex_module_decorators_1.Mutation
    ], Store.prototype, "updateStations");
    __decorate([
        vuex_module_decorators_1.Mutation
    ], Store.prototype, "mutateFilter");
    __decorate([
        vuex_module_decorators_1.Mutation
    ], Store.prototype, "resetFilterList");
    __decorate([
        vuex_module_decorators_1.Mutation
    ], Store.prototype, "setConnState");
    Store = __decorate([
        vuex_module_decorators_1.Module
    ], Store);
    return Store;
}(vuex_module_decorators_1.VuexModule));
exports["default"] = Store;
