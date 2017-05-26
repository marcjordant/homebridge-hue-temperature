"use strict";

var Service, Characteristic;
var temperatureService;
var request = require("request");

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-hue-temperature", "HueTemperature", TemperatureAccessory);
}

function TemperatureAccessory(log, config) {
    this.log = log;
    this.name = config["name"];
    this.hueBridgeIPAddress = config["hue-bridge-ip-address"];
    this.hueBridgeUsername = config["hue-bridge-username"];
    this.hueSensorId = config["hue-sensor-id"];
    this.lastupdate = 0;
    this.temperature = 0;
    this.lastupdateBattery = 0;
    this.battery = 0;
}

TemperatureAccessory.prototype =
    {
        getState: function (callback) {
            // Only fetch new data every 1 minute
            if (this.lastupdate + (60 * 1) < (Date.now() / 1000 | 0)) {
                var url = "http://" + this.hueBridgeIPAddress + "/api/" + this.hueBridgeUsername + "/sensors/" + this.hueSensorId;
                
                this.httpRequest(url, function (error, response, responseBody) {
                    if (error) {
                        this.log("HTTP get sensor status function failed: %s", error.message);
                        callback(error);
                    } else {
                        var statusObj = JSON.parse(responseBody);
                        var temperature = statusObj["state"]["temperature"];
                        temperature = temperature.toString().substring(0, 2);
                        this.temperature = parseInt(temperature);
                        this.lastupdate = (Date.now() / 1000);
                        callback(null, this.temperature);
                    }
                }.bind(this));
            } else {
                this.log("Returning cached data", this.temperature);
                temperatureService.setCharacteristic(Characteristic.CurrentTemperature, this.temperature);
                callback(null, this.temperature);
            }
        },

        getActive: function (callback) {
          this.log("getActive requested")
                var url = "http://" + this.hueBridgeIPAddress + "/api/" + this.hueBridgeUsername + "/sensors/" + this.hueSensorId;
                
                this.httpRequest(url, function (error, response, responseBody) {
                    if (error) {
                        this.log("HTTP get sensor status function failed: %s", error.message);
                        callback(null, false);
                    } else {
                        callback(null, true);
                    }
                }.bind(this));
        },

        getBatteryLevel: function (callback) {
          this.log("getBatteryLevel requested")
            // Only fetch new data every 1 minute
            if (this.lastupdateBattery + (60 * 1) < (Date.now() / 1000 | 0)) {
                var url = "http://" + this.hueBridgeIPAddress + "/api/" + this.hueBridgeUsername + "/sensors/" + this.hueSensorId;
                
                this.httpRequest(url, function (error, response, responseBody) {
                    if (error) {
                        this.log("HTTP get sensor status function failed: %s", error.message);
                        callback(error);
                    } else {
                        var statusObj = JSON.parse(responseBody);
                        var battery = parseInt(statusObj["config"]["battery"]);
                        this.battery = battery <= 20 ? true : false;
                        this.lastupdateBattery = (Date.now() / 1000);
          this.log("BatteryLevel : "  + this.battery)
                        callback(null, battery);
                    }
                }.bind(this));
            } else {
                this.log("Returning cached data", this.temperature);
                temperatureService.setCharacteristic(Characteristic.StatusLowBattery, this.battery);
                callback(null, this.battery);
            }
        },



        identify: function (callback) {
            this.log("Identify requested");
            callback();
        },



        getServices: function () {
            var informationService = new Service.AccessoryInformation();

            informationService
                .setCharacteristic(Characteristic.Manufacturer, "singleTapps")
                .setCharacteristic(Characteristic.Model, "Hue Temperature sensor")
                .setCharacteristic(Characteristic.SerialNumber, "1GWZ009");

            temperatureService = new Service.TemperatureSensor(this.name);
            temperatureService
                .getCharacteristic(Characteristic.CurrentTemperature)
                .on("get", this.getState.bind(this));

            temperatureService
                .getCharacteristic(Characteristic.CurrentTemperature)
                .setProps({minValue: -30});

            temperatureService
                .getCharacteristic(Characteristic.CurrentTemperature)
                .setProps({maxValue: 120});

            temperatureService
                .getCharacteristic(Characteristic.StatusActive)
                .on("get", this.getActive.bind(this));

            temperatureService
                .getCharacteristic(Characteristic.StatusLowBattery)
                .on("get", this.getBatteryLevel.bind(this));


            return [informationService, temperatureService];
        },

        httpRequest: function (url, callback) {
            request({
                    url: url,
                    body: "",
                    method: "GET",
                    rejectUnauthorized: false
                },
                function (error, response, body) {
                    callback(error, response, body)
                })
        }

    };

if (!Date.now) {
    Date.now = function () {
        return new Date().getTime();
    }
}
