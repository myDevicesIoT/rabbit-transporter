const events = require('events'),
    util = require('util'),
    Transport = require('@mydevices/transporter').Transport;

const amqp = require('amqplib');

//
// ### function Rabbit (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Rabbit transport object responsible
// for sending messages to Rabbit.
//
const Rabbit = function (options) {
    Transport.call(this, options);
    this.options = options || {
        uri: 'amqp://localhost',
        exchange: 'rabbit-transporter-exchange',
        type: 'fanout'
    };

    this.channel = null;
    const self = this;

    amqp.connect(this.options.uri, { rejectUnauthorized: false })
    .then((conn) => {
        return conn.createChannel();
    })
    .then((ch) => {
        self.channel = ch;
        return ch.assertExchange(self.options.exchange, self.options.type);
    })
    .then(console.log)
    .catch(console.warn);
    
};

//
// Inherit from `transporter.Transport`.
//
util.inherits(Rabbit, Transport);

//
// Expose the name of this Transport on the prototype
//
Rabbit.prototype.name = 'Rabbit';

Rabbit.prototype.publish = function(msg, callback) {
    const self = this;
    self.channel.publish(self.options.exchange, msg.bus, Buffer.from(JSON.stringify(msg)));
    return callback(null);
}

exports.Rabbit = Rabbit;