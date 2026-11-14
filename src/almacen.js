const jugadores = new Set();
const juegos = new Map();
let siguienteId = 1;

async function registrarJugador(nombre) {
  jugadores.add(nombre);
}

async function existeJugador(nombre) {
  return jugadores.has(nombre);
}

async function crearJuego(datos) {
  const id = String(siguienteId++);
  const juego = { id, ...datos };
  juegos.set(id, JSON.stringify(juego));
  return juego;
}

async function obtenerJuego(id) {
  const texto = juegos.get(id);
  return texto ? JSON.parse(texto) : null;
}

async function guardarJuego(juego) {
  juegos.set(juego.id, JSON.stringify(juego));
}

async function listarJuegos() {
  return Array.from(juegos.values()).map((texto) => JSON.parse(texto));
}
module.exports = {
  registrarJugador,
  existeJugador,
  crearJuego,
  obtenerJuego,
  guardarJuego,
  listarJuegos,
};
