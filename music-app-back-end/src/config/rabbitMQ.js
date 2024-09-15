/* eslint-disable linebreak-style */

// eslint-disable-next-line import/no-extraneous-dependencies
const amqp = require('amqplib');

let channel = null;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_SERVER || 'amqp://localhost');
    channel = await connection.createChannel();
    console.log('Connected to RabbitMQ');
  } catch (err) {
    console.error('Failed to connect to RabbitMQ', err);
  }
};

const sendToQueue = async (queueName, message) => {
  if (!channel) throw new Error('RabbitMQ channel not established');
  await channel.assertQueue(queueName, { durable: true });
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
};

module.exports = { connectRabbitMQ, sendToQueue };
