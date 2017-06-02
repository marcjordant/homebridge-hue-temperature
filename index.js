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
}

TemperatureAccessory.prototype =
{
    getState: function (callback)
    {
      var url = "http://" + this.hueBridgeIPAddress + "/api/" + this.hueBridgeUsername + "/sensors/" + this.hueSensorId;
      
      this.httpRequest(url, function (error, response, responseBody) {
          if (error) {
              callback(error);
          }
          else {
              var statusObj = JSON.parse(responseBody);
              var temperatureObj = statusObj["state"]["temperature"];
              var temperature = parseFloat(temperatureObj.toString().substring(0, 2) + "." + temperatureObj.toString().substring(2, 4));
              callback(null, temperature);
          }
      });
    },

    getBatteryLevel: function (callback)
    {
      var url = "http://" + this.hueBridgeIPAddress + "/api/" + this.hueBridgeUsername + "/sensors/" + this.hueSensorId;
      
      this.httpRequest(url, function (error, response, responseBody) {
          if (error) {
              callback(error);
          } else {
              var statusObj = JSON.parse(responseBody);
              var batteryLevel = parseInt(statusObj["config"]["battery"]);
              var battery = batteryLevel <= 20 ? true : false;
              callback(null, battery);
          }
      });
    },


    getServices: function ()
    {
        var informationService = new Service.AccessoryInformation();

        informationService
            .setCharacteristic(Characteristic.Manufacturer, "singleTapps")
            .setCharacteristic(Characteristic.Model, "HueTempSensor")
            .setCharacteristic(Characteristic.SerialNumber, "1GWZ009");

        temperatureService = new Service.TemperatureSensor(this.name);
        temperatureService
            .getCharacteristic(Characteristic.CurrentTemperature)
            .on('get', this.getState.bind(this));

        temperatureService
            .getCharacteristic(Characteristic.StatusLowBattery)
            .on('get', this.getBatteryLevel.bind(this));

        return [informationService, temperatureService];
    },

    httpRequest: function (url, callback) 
    {
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

