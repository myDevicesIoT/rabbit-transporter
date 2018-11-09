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
var Rabbit = exports.Rabbit = function (options) {
    Transport.call(this, options);
    this.options = options || {
        uri: 'amqp://localhost',
        exchange: 'rabbit-transporter-exchange',
        type: 'fanout'
    };

    this.conn = amqplib.connect(this.options.uri);
    this.channel = null;

    this.conn
    .then((conn) => {
        return conn.createChannel();
    })
    .then((ch) => {
        return ch.assertExchange(this.options.exchange, this.options.type);
    })
    .then((ch) => {
        this.channel = ch;
    })
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
    self.channel.publish(JSON.stringify(msg));
}