import { SimConnectConnection } from '../SimConnectConnection';
import { SimConnectException } from '../enums/SimConnectException';
import { IdFactory } from './IdFactory';

export class BaseHelper {
    protected readonly _handle: SimConnectConnection;

    protected readonly _globals: IdFactory;

    private _exceptionHandlers: { [sendId: number]: (ex: SimConnectException) => void } = {};

    constructor(handle: SimConnectConnection) {
        this._handle = handle;
        this._globals = IdFactory.getInstance();

        this._handle.on('exception', recvException => {
            if (recvException.sendId in this._exceptionHandlers) {
                const handler = this._exceptionHandlers[recvException.sendId];
                handler(recvException.exception);
            }
        });
    }

    /**
     * Should be called immediately after sending a simconnect packet.
     * Can be used by both promise and callback based helper functions.
     * @param sendId the ID of the newly sent packet
     * @param handler function to be called in case of an exception
     * @private
     */
    protected _checkForException(
        sendId: number,
        handler: (exception: SimConnectException) => void
    ) {
        this._exceptionHandlers[sendId] = handler;
        setTimeout(() => {
            // Give SimConnect server some time to throw the exception, then remove the listener
            delete this._exceptionHandlers[sendId];
        }, 1000);
    }
}
