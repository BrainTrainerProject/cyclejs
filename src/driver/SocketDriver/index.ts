import { adapt } from "@cycle/run/lib/adapt";
import xs from 'xstream';
import { Notifications } from "../../common/Notification";

const io = require('socket.io-client');

export function makeSocketIODriver() {

    const localStorage = window.localStorage;
    const storageKey = 'auh0-driver-tokens';
    let idToken = null;
    let socket = null;

    function getIdToken() {
        const auth0Storage = localStorage.getItem(storageKey);
        idToken = (auth0Storage) ? JSON.parse(auth0Storage).idToken : null;
        socket = io('http://localhost:8080', {
            transportOptions: {
                polling: {
                    'Authorization': "Bearer " + idToken,
                }
            }
        });
        socket.on('connected', function (data) {
            console.log("connected but not authorized");
            socket.emit('authorize', {token: idToken});
        });
        socket.on('authorized', function (data) {
            console.log("authorized");
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