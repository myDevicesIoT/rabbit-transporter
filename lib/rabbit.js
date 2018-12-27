
const util = require('util');
const Transport = require('@mydevices/transporter').Transport;
const amqp = require('amqplib');

//
// ### function Rabbit (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Rabbit transport object responsible
// for sending messages to Rabbit.
//
const Rabbit = function (options) {
    Transport.call(this, options);

    this.options = Object.assign({
        uri: 'amqp://localhost',
        exchange: 'rabbit-transporter-exchange',
        type: 'fanout'        
    }, options);

    this.channel = null;
    this.failed = false;
    const self = this;

    amqp.connect(this.options.uri, { rejectUnauthorized: false })
    .then((conn) => {
        return conn.createChannel();
    })
    .then((ch) => {
        self.channel = ch;

        ch.on('error', (err) => {
            self.failed = true;
            self.emit('error', err, self);
        });
        ch.on('close', () => {
            self.failed = true;
            self.emit('error', new Error('AMQP channel closed'), self);
        });

        return ch.assertExchange(self.options.exchange, self.options.type);
    })
    .then(msg => self.emit('ready', msg))
    .catch(err => {
        self.emit('error', err, self);
        self.failed = true;
        return;
    });
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
    if (this.failed) {
        this.emit('error', new Error('AMQP connection error'), this);
        return callback();
    } else if (this.channel) {
        this.channel.publish(this.options.exchange, msg.bus, Buffer.from(JSON.stringify(msg)));
    }

    return callback(null);
}

exports.Rabbit = Rabbit;
