#!/usr/bin/env node
import mqtt from "mqtt";
import { URL } from "url";
var timeInterval: null | NodeJS.Timeout = null;
var startTime: null | number = null;

const getNetworkChange = (action: string) => {
  return `CONNECTION : ${action}`;
};
const getTAndM = (topic: string, message: string) => {
  return `'${message}'@'${topic}'`;
};
const getM = (title: string, content: string) => {
  return `${title} : ${content}`;
};

const getActionStatus = (service: string, status: string) => {
  return `${service} ${status}`;
};

const successMessage = (message: string) => {
  return console.log(`\n\x1b[32m${message} \x1b[0m\n`);
};

const warningMessage = (message: string) => {
  return console.log(`\x1b[33m${message}\x1b[0m`);
};

const infoMessage = (message: string) => {
  return console.log(`\x1b[34m${message}\x1b[0m`);
};

const errorMessage = (message: string) => {
  return console.log(`\x1b[31m${message}\x1b[0m`);
};

const sanitize = (text: string): string => {
  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'"))
  ) {
    return text.slice(1, text.length - 1).trim();
  }
  return text;
};

const exitProcess = function () {
  process.exit(0);
};

const subscribe = function (topic: string, RecieverClient: mqtt.MqttClient) {
  topic = sanitize(topic);
  if (RecieverClient.connected) {
    if (topic) {
      RecieverClient.subscribe(topic, (error) => {
        if (error) {
          errorMessage(getM(getActionStatus("SUBSCRIBED", "Error"), topic));
        } else {
          infoMessage(getM(getActionStatus("SUBSCRIBED", "Success"), topic));
        }
      });
    } else {
      errorMessage(getM("TOPIC", "Invalid"));
    }
  } else {
    errorMessage(getM("CONNECTION", "Not Connected"));
  }
};

const publish = function (
  topic: string,
  message: string,
  RecieverClient: mqtt.MqttClient
) {
  topic = sanitize(topic);
  message = sanitize(message);
  if (RecieverClient.connected) {
    if (topic) {
      if (message) {
        RecieverClient.publish(topic, message, (e) => {
          if (e) {
            errorMessage(
              getM(
                getActionStatus("PUBLISHED", "Error"),
                getTAndM(topic, message)
              )
            );
          } else {
            infoMessage(
              getM(
                getActionStatus("PUBLISHED", "Success"),
                getTAndM(topic, message)
              )
            );
          }
        });
      } else {
        errorMessage(getM("MESSAGE", "Invalid"));
      }
    } else {
      errorMessage(getM("TOPIC", "Invalid"));
    }
  } else {
    errorMessage(getM("CONNECTION", "Not Connected"));
  }
};

const showConnectDuration = (endTime: number = new Date().getTime()) => {
  if (endTime && startTime) {
    infoMessage(
      getM("CONNECTION DURATION (s)", `${(endTime - startTime) / 1000}`)
    );
    startTime = null;
  }
  return;
};

export const connectMQTT = function (brokerURL: string) {
  try {
    const url = new URL(brokerURL);
    console.log(url);
    const RecieverClient = mqtt.connect(brokerURL, { keepalive: 0 });

    infoMessage(getM("\nNOTE", "Press e to exit anytime"));

    process.stdin.on("data", function (data) {
      const [basecmd = "", topic = "", message = ""] =
        data
          .toString()
          .trim()
          .match(/(?:[^\s"]+|"[^"]*")+/g) || [];

      switch (basecmd) {
        case "sub":
          return subscribe(topic, RecieverClient);

        case "pub":
          return publish(topic, message, RecieverClient);

        case "e":
          return exitProcess();

        default:
          errorMessage(getM("COMMAND", "Unknown"));
      }
    });
    RecieverClient.on("connect", () => {
      successMessage(getNetworkChange("Connected"));
      startTime = new Date().getTime();
      console.log(
        "Start writing commands: \nsub <TOPIC> : Subscribe a topic. \npub <TOPIC> <MESSAGE>: Publish a message to the topic\ne: Exit The Process\n"
      );
      if (timeInterval) {
        clearInterval(timeInterval);
      }
      timeInterval = setInterval(() => {
        if (RecieverClient.connected) {
          RecieverClient.publish("/ping_req_sys", "");
        } else {
          if (timeInterval) {
            clearInterval(timeInterval);
          }
        }
      }, 3000);
    });

    RecieverClient.on("message", (topic, message) => {
      successMessage(
        getM("INCOMING MESSAGE", getTAndM(topic, message.toString()))
      );
    });

    RecieverClient.on("reconnect", () => {
      infoMessage(getNetworkChange("Reconnect"));
    });

    RecieverClient.on("offline", () => {
      warningMessage(getNetworkChange("Offline"));
      showConnectDuration();
    });

    RecieverClient.on("closed", () => {
      warningMessage(getNetworkChange("Closed"));
      showConnectDuration();
    });

    RecieverClient.on("disconnect", () => {
      infoMessage(getNetworkChange("Disconnect"));
      showConnectDuration();
    });

    RecieverClient.on("error", (error) => {
      errorMessage(getNetworkChange("Error"));
      showConnectDuration();
    });
  } catch (error) {
    errorMessage(getM("BROKER URL", "Invalid"));
  }
};

connectMQTT(process.argv[2]);
