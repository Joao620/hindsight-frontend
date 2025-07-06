const local = true

let SERVER_URL: string
let WEBSOCKET_PROTOCOL: string
let HTTP_PROTOCOL: string

if (local){
    SERVER_URL = "localhost:5000"
    WEBSOCKET_PROTOCOL = "ws"
    HTTP_PROTOCOL = "http"
} else {
    SERVER_URL = "https://hindsight-c49366b607ea.herokuapp.com"
    WEBSOCKET_PROTOCOL = "wss"
    HTTP_PROTOCOL = "https"
}

export {
    SERVER_URL,
    WEBSOCKET_PROTOCOL,
    HTTP_PROTOCOL
}