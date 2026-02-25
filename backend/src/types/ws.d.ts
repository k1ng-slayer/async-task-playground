declare module "ws" {
  import { EventEmitter } from "events";
  import { Duplex } from "stream";

  export interface PerMessageDeflateOptions {
    zlibDeflateOptions?: Record<string, unknown>;
    zlibInflateOptions?: Record<string, unknown>;
    clientNoContextTakeover?: boolean;
    serverNoContextTakeover?: boolean;
    clientMaxWindowBits?: number;
    serverMaxWindowBits?: number;
    concurrencyLimit?: number;
    threshold?: number;
  }

  export interface ServerOptions {
    noServer?: boolean;
    clientTracking?: boolean;
    perMessageDeflate?: boolean | PerMessageDeflateOptions;
  }

  export class WebSocket extends EventEmitter {
    readyState: number;
    send(data: unknown, cb?: (err?: Error) => void): void;
    close(code?: number, data?: string): void;
    terminate(): void;
    on(event: string, listener: (...args: unknown[]) => void): this;
  }

  export class Server extends EventEmitter {
    constructor(options?: ServerOptions);
    handleUpgrade(
      request: unknown,
      socket: Duplex,
      head: Buffer,
      cb: (socket: WebSocket) => void,
    ): void;
    close(cb?: (err?: Error) => void): void;
    on(event: string, listener: (...args: unknown[]) => void): this;
  }
}
