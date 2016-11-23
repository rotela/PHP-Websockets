var myWebSocket = angular.module('myWebSocket', []);

myWebSocket.factory('myWebSocketService', myWebSocketService);

function myWebSocketService() {

    var host = "ws://127.0.0.1:8080/echobot";
    var socket;
    var funciones = [];
    var metodos = [];
    var yo = {};
    //
    metodos = {
        conectar: function() {

            try {
                socket = new WebSocket(host);

                console.log('WebSocket - estado ' + socket.readyState);

                socket.onopen = function(msg) {
                    metodos.ejecutarCallBack('onopen');
                };
                socket.onmessage = function(msg) {

                    var object = JSON.parse(msg.data);

                    if (object.tipo == 'mensaje') {
                        metodos.ejecutarCallBack('onmensaje', object);
                    }

                    if (object.tipo == 'emit') {
                        metodos.ejecutarCallBack(object.evento, object);
                    }

                    if (object.tipo == 'usuarios') {
                        metodos.ejecutarCallBack('onusuarios', object);
                    }

                    if (object.tipo == 'identificador') {
                        yo = object.datos;
                        metodos.ejecutarCallBack('onidentificador', object);
                    }

                    metodos.ejecutarCallBack('onmessage', object);

                };
                socket.onclose = function(msg) {
                    metodos.ejecutarCallBack('onclose');
                };
            } catch (ex) {
                console.log(ex);
            }

        },
        enviar: function(msg, id) {
            datos = {};
            if (id !== undefined) {
                datos = {
                    tipo: 'mensaje',
                    de: yo.id,
                    para: id,
                    datos: msg
                }
            } else {
                datos = {
                    tipo: 'mensaje',
                    de: yo.id,
                    para: '0',
                    datos: msg
                }
            }
            socket.send(JSON.stringify(datos));
        },
        on: function(evento,fn) {
            datos = {
                tipo: 'on',
                evento: evento
            }
            socket.send(JSON.stringify(datos));
            metodos.when(evento,fn);
        },
        emit: function(evento, dat) {
            datos = {
                tipo: 'emit',
                evento: evento,
                data: dat
            }
            socket.send(JSON.stringify(datos));
        },
        registro: function(usuario) {
            datos = {
                tipo: 'registro',
                datos: usuario
            }
            socket.send(JSON.stringify(datos));
        },
        salir: function() {
            if (socket !== null) {
                socket.close();
            }
            socket = null;
        },
        reconectar: function() {
            metodos.salir();
            metodos.conectar();
        },
        when: function(evento, fn) {
            cb = {
                evento: evento,
                funcion: fn
            }
            funciones.push(cb);
        },
        ejecutarCallBack: function(evento, data) {
            angular.forEach(funciones, function(value, key) {
                if (value.evento == evento) {
                    var laFuncion = value.funcion;
                    if (data !== undefined) {
                        laFuncion.call(laFuncion, data);
                    } else {
                        laFuncion.call(laFuncion);
                    }
                }
            });
        }
    }
    return metodos;
}