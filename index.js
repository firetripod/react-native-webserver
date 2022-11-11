import { NativeEventEmitter, NativeModules } from 'react-native';

const HttpServerModule = NativeModules.HttpServer;
const { HTTP_SERVER_RESPONSE_RECEIVED } = HttpServerModule.getConstants();
const HttpServerModuleEmitter = new NativeEventEmitter(HttpServerModule);

export class HttpServer  {
  static get isRunning() {
    return HttpServerModule.isRunning() === '1'
  }

  static async start (port, name, callback) {
    if (port === 80) {
      throw 'Invalid server port specified. Port 80 is reserved.';
    }

    HttpServerModuleEmitter.addListener(HTTP_SERVER_RESPONSE_RECEIVED, request => {
      callback(request, {
        send: (status, contentType, content) => {
          HttpServerModule.respond(request.requestId, status, contentType, content);
        },
        sendFile: path => HttpServerModule.responseFile(request.requestId, path),
      });
    });
    return await HttpServerModule.start(port, name);
  }

  static async stop () {
   await HttpServerModule.stop();
    HttpServerModuleEmitter.removeAllListeners(HTTP_SERVER_RESPONSE_RECEIVED);
  }
};
