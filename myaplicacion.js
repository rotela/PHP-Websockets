var app = angular.module('app', ['myWebSocket']);

app.controller('primario', primario);

function primario(myWebSocketService, $timeout) {
    var cuerpo = $("#cuerpo");

    var esto = this;

    esto.yo = {};
    esto.para = {
        id: 0,
        usuario: 'yo'
    };

    esto.usuarios = [];
    esto.mensajes = [];

    esto.enviar = function() {
        myWebSocketService.enviar(esto.mensaje, esto.para.id);
        esto.mostrar('Yo: ' + esto.mensaje);
        esto.mensaje = '';

    }
    esto.reconectar = function() {
        esto.limpiar();
        myWebSocketService.reconectar();
    }
    esto.salir = function() {
        esto.limpiar();
        myWebSocketService.salir();
        esto.usuarios = [];
    }
    esto.mostrar = function(msg) {
        cuerpo.append(msg + "<br>");
    }
    esto.limpiar = function() {
        cuerpo.html("");
    }
    esto.seleccionar = function(u) {
        $timeout(esto.para = u);
    }
    esto.usuario_by_id = function(id) {
        var x = id;
        angular.forEach(esto.usuarios, function(value, key) {
            if (value.id == id) {
                x = value.usuario;
            }
        });
        return x;
    }
    esto.emitir = function () {

        myWebSocketService.emit('eventoA', {
            nombre: 'rotela',
            id: 123456
        });

    }
    // eventos del sockets ------------------------------------------------

    myWebSocketService.when('onopen', function() {
        nombre = bootbox.prompt("Ingrese un alias", function(result) {
            myWebSocketService.registro(result);
        });

        myWebSocketService.on('eventoA', function(data) {
            console.log('soy eventoA');
            console.log(data);
        });

    });

    myWebSocketService.when('onclose', function() {
        esto.mostrar('Se ha desconectado con el servidor');
    });

    myWebSocketService.when('onmensaje', function(data) {
        u = esto.usuario_by_id(data.de);
        esto.mostrar(u + ': ' + data.datos);
    });

    myWebSocketService.when('onusuarios', function(data) {
        $timeout(esto.usuarios = data.datos);
    });

    myWebSocketService.when('onidentificador', function(data) {
        $timeout(esto.yo = data.datos);
    });

    //

    myWebSocketService.conectar();


}