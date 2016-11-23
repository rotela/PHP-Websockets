<?php

include_once 'websocketserver.php';

class myServidor extends WebSocketServer
{
    private $usuarios = array();
    private $eventos = array();

    protected function process($user, $message)
    {
        $deco = json_decode($message);

        if ($deco->tipo == 'on') {
            $this->agregar_evento($deco->evento, $user);
        }

        if ($deco->tipo == 'emit') {
            $this->avisar_evento($deco->evento, $message);
        }

        if ($deco->tipo == 'mensaje') {
            if ($deco->para == '0') {
                foreach ($this->users as $key => $usuario) {
                    $this->send($usuario, $message);
                }
            } else {
                $this->send($this->usuario_by_id($deco->para), $message);
            }
        }

        if ($deco->tipo == 'registro') {
            foreach ($this->usuarios as $key => $value) {
                if ($value['id'] == $user->id) {
                    $this->usuarios[$key]['usuario'] = $deco->datos;
                    break;
                }
            }

            $this->listar_usuarios();
            $this->enviar_usuarios();
            $this->enviar_identificador($user);
        }

        if ($deco->tipo == 'usuarios') {
            $this->enviar_usuarios();
        }
    }
    // hay una conexión
    protected function connected($user)
    {
        array_push($this->usuarios, array('id' => $user->id, 'usuario' => $user->id));
        $this->listar_usuarios();
        $this->enviar_usuarios();
        $this->enviar_identificador($user);
    }
    // hay una desconexión
    protected function closed($user)
    {
        $this->listar_usuarios();
        $this->enviar_usuarios();
    }
    public function agregar_evento($evento, $user)
    {
        if (array_key_exists($evento, $this->eventos)) {
            array_push($this->eventos[$evento], $user->id);
        } else {
            $this->eventos[$evento] = array($user->id);
        }
    }
    public function avisar_evento($evento, $msg)
    {
        $destino = array();
        if (array_key_exists($evento, $this->eventos)) {
            $destino = $this->eventos[$evento];
        }
        if (count($destino) > 0) {
            foreach ($destino as $key => $id) {
                if ($this->existe_id($id)) {
                    $this->send($this->usuario_by_id($id), $msg);
                }
            }
        }
    }
    public function limpiar_usuarios()
    {
        $e = array();
        $nuevo = array();
        foreach ($this->users as $k => $user) {
            foreach ($this->usuarios as $key => $usuario) {
                if ($user->id == $usuario['id']) {
                    array_push($nuevo, $usuario);
                }
            }
        }
        $this->usuarios = $nuevo;
    }
    private function enviar_identificador($user)
    {
        $u = array();
        foreach ($this->usuarios as $key => $usuario) {
            if ($user->id == $usuario['id']) {
                $u = $usuario;
            }
        }
        $a = array('tipo' => 'identificador', 'datos' => $u);
        $b = json_encode($a);

        $this->send($user, $b);
    }
    private function enviar_usuarios()
    {
        if (count($this->usuarios) > 0) {
            $a = array('tipo' => 'usuarios', 'datos' => $this->usuarios);
            $b = json_encode($a);
            foreach ($this->users as $key => $usuario) {
                $this->send($usuario, $b);
            }
        }
    }
    private function usuario_by_id($id = '')
    {
        $u = $id;
        foreach ($this->users as $key => $user) {
            if ($user->id == $id) {
                $u = $user;
            }
        }

        return $u;
    }
    private function existe_id($id = '')
    {
        $f = false;
        foreach ($this->users as $key => $user) {
            if ($user->id == $id) {
                $f = true;
                break;
            }
        }

        return $f;
    }
    private function listar_usuarios($value = '')
    {
        $this->limpiar_usuarios();
        if (count($this->usuarios) > 0) {
            echo '-------- Usuario/s conectado/s ('.count($this->usuarios).") --------\n";
            $i = 0;
            foreach ($this->usuarios as $key => $value) {
                $i++;
                echo '---- '.$i.'- '.$value['id'].': '.$value['usuario']."\n";
            }
            echo "-------------------------------------------\n";
        } else {
            echo "-------- No hay usuarios conectados --------\n";
        }
    }
}

$echo = new myServidor('127.0.0.1', '8080');

try {
    $echo->run();
} catch (Exception $e) {
    $echo->stdout($e->getMessage());
}
