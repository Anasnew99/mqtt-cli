# [mqtt-client-cli](https://github.com/Anasnew99/mqtt-cli)

> A simple MQTT Client CLI.

> This library is created and maintained by [Anas Aneeque](https://www.linkedin.com/in/anasnew99/)

> This library is written for Node.js

# Features

- Connect to MQTT Server using broker url.
- Test MQTT Connections.
- Subscribe topic and receive messages.
- Publish message to topic.

# Usage

Use it with CLI.

```
npm i -g mqtt-client-cli
mqtt-client-cli <BROKER URL>
```

or also you can use shorthand

```
mcc <BROKER URL>
```

Broker URL Example

```
protocol://user:password@host:8883/path
```

![Usage Example](./example/connect.jpg)

Subscribe to a topic

```
sub Hello
```

![Subscribe Example](./example/sub.jpg)

Now to check whether we are really subscribed, we will publish a message to Hello

```
pub Hello "Hello World"
```

![Publish Example](./example/pub.jpg)

Voila we received a message, output format of the recieved message is '<message>@<topic>'

Any error occur in subscribing or publishing, a log will be received

![Error Example](./example/error.jpg)

At last, exit anytime by pressing e.
