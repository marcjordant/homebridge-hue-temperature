# homebridge-hue-temperature

A homebridge plugin to use the temperature sensor of the Hue motion sensor.

# Installation

1. Install Homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebridge-hue-temperature`
3. Update your Homebridge `config.json` using the sample below.

# Configuration

## example

```json
{
  "accessory": "HueTemperature",
  "name": "Temperature",
  "hue-bridge-ip-address": "192.168.0.10",
  "hue-bridge-username": "zFAyvefApnEsO4o7Q4PrCcCpYz734cXADFEBfamo",
  "hue-sensor-id": "4"
}
```

Fields:

* `accessory` Must be "HueTemperature" (required).
* `name` The name that will be used for this sensor in homebridge (required).
* `hue-bridge-ip-address` The IP address of the Hue bridge (required).
* `hue-bridge-username` The username to connect to the Hue bridge HTTP API (required).
* `hue-sensor-id` The id of the Hue temperature sensor (required).
