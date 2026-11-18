# Picas y Fijas — Sistemas Distribuidos

Juego de Picas y Fijas de 4 cifras para dos jugadores, implementado como API REST
con Node.js y Express, empaquetado en Docker y desplegable en Kubernetes.

## Reglas

- Cada jugador elige un número secreto de 4 cifras distintas.
- Por turnos, cada jugador intenta adivinar el número del rival.
- **Fija:** dígito correcto en la posición correcta.
- **Pica:** dígito correcto en otra posición.
- Gana el primero en obtener 4 fijas. El primer turno se escoge al azar.

## Endpoints

| Método | Ruta                | Cuerpo                                  | Descripción                          |
| ------ | ------------------- | --------------------------------------- | ------------------------------------ |
| POST   | `/login`            | `{"nombre":"andrey"}`                   | Registra al jugador                  |
| POST   | `/juego`            | `{"nombre":"andrey","numero":"4271"}`   | Crea una partida                     |
| PUT    | `/juego/{id}`       | `{"nombre":"fernando","numero":"5830"}` | Se une a una partida                 |
| POST   | `/juego/{id}/jugar` | `{"nombre":"andrey","numero":"1234"}`   | Envía un intento                     |
| GET    | `/juego/{id}`       | —                                       | Estado de una partida (sin secretos) |
| GET    | `/juego`            | —                                       | Lista de partidas                    |

### Estados de una partida

`sin completar` → (se une el segundo jugador) → `en juego` → (alguien saca 4 fijas) → `terminado`

### Códigos de respuesta

| Código | Cuándo                                                                           |
| ------ | -------------------------------------------------------------------------------- |
| 400    | Datos inválidos (número con letras, repetidos, distinto de 4 cifras, sin nombre) |
| 401    | El jugador no ha hecho login                                                     |
| 403    | El jugador no participa en esa partida                                           |
| 404    | La partida no existe                                                             |
| 409    | No es su turno, la partida está llena o ya terminó                               |

## Ejecutar en local

Requiere Node.js 18 o superior.

```bash
npm install
npm start
```

Abrir `http://localhost:3000` para usar el front de pruebas.

## Estructura

```
src/logica.js    Reglas del juego (validación y cálculo de picas y fijas)
src/almacen.js   Almacenamiento de jugadores y partidas
src/app.js       Servidor Express y endpoints
public/          Front básico (HTML + JavaScript)
```

## Docker

```bash
docker build -t picas-fijas:1.0 .
docker run -d -p 8080:3000 picas-fijas:1.0
```

Abrir `http://localhost:8080`.

Imagen publicada en Docker Hub: `deezzeagle/picas-fijas:1.0`

## Kubernetes

Manifiestos en la carpeta `k8s/`: un Deployment (1 réplica) y un Service de tipo NodePort.

```bash
git clone https://github.com/TU-USUARIO/picas-fijas.git
cd picas-fijas
kubectl apply -f k8s/
kubectl get pods
```

La aplicación queda disponible en el puerto `30080` de cualquier nodo.

## Limitaciones conocidas

- **Identidad por nombre:** cualquiera puede jugar usando el nombre de otro.
  La solución sería un token de sesión.
