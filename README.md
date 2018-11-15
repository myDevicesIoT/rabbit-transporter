## RabbitMQ Transporter
RabbitMQ Adapter for [transporter](https://github.com/myDevicesIoT/transporter)

### Usage

```
const Transporter = require('@mydevices/transporter');
const RabbitMQ = require('@mydevices/rabbit-transporter').Rabbit;

Transporter.add(RabbitMQ, {
    uri: 'amqp://localhost',
    exchange: 'transporter',
    type: 'fanout'
});

Transporter.publish( { hello: "world" } );

```
