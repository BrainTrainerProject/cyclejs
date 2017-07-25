import { adapt } from "@cycle/run/lib/adapt";
import xs from 'xstream';

const io = require('socket.io-client');

export function makeSocketIODriver() {

    const localStorage = window.localStorage;
    const storageKey = 'auh0-driver-tokens';
    let idToken = null;
    let socket = null;

    function getIdToken() {
        const auth0Storage = localStorage.getItem(storageKey);
        idToken = (auth0Storage) ? JSON.parse(auth0Storage).idToken : null;
        console.log('ID TOKEN');
        console.log(idToken);
        socket = io('http://localhost:8080', {
            extraHeaders: {
                Authorization: "Bearer " + idToken
            }
        });
    }

    document.addEventListener("storageItemChanged", () => {
        getIdToken();
    }, false);

    getIdToken();

    function validToken() {
        if (!idToken) {
            console.warn('[SocketDriver] Kein IdToken vorhanden!');
            return;
        }
    }

    function get(eventName, {multiArgs = false} = {}) {
        validToken();
        const socketStream$ = xs.create({
            start(listener) {
                this.eventListener = multiArgs
                    ? (...args) => listener.next(args)
                    : arg => listener.next(arg);

                socket.on(eventName, this.eventListener);
            },
            stop() {
                socket.removeListener(eventName, this.eventListener);
            },
            eventListener: null,
        });

        return adapt(socketStream$);
    }

    function publish(messageType, message) {
        validToken();
        socket.emit(messageType, message);
    }

    return function socketIODriver(events$) {
        validToken();

        events$.addListener({
            next: event => publish(event.messageType, event.message)
        });

        return {
            get,
            dispose: socket.destroy.bind(socket)
        }
    };
}