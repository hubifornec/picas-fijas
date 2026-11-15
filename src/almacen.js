const { createClient } = require("redis");

const cliente = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});
cliente.on("error", (error) =>
  console.error("Error de Redis: ", error.message),
);
cliente.connect();

async function registrarJugador(nombre) {
  await cliente.sAdd("jugadores", nombre);
}

async function existeJugador(nombre) {
  return (await cliente.sIsMember("jugadores", nombre)) === 1;
}

async function crearJuego(datos) {
  const id = String(await cliente.incr("siguienteId"));
  const juego = { id, ...datos };
  await cliente.set(`juego:${id}`, JSON.stringify(juego));
  await cliente.rPush("juegos", id);
  return juego;
}

async function obtenerJuego(id) {
  const texto = await cliente.get(`juego:${id}`);
  return texto ? JSON.parse(texto) : null;
}

async function guardarJuego(juego) {
  await cliente.set(`juego:${juego.id}`, JSON.stringify(juego));
}

async function listarJuegos() {
  const ids = await cliente.lRange("juegos", 0, -1);
  if (ids.length === 0) return [];

  const textos = await cliente.mGet(ids.map((id) => `juego:${id}`));
  return textos
    .filter((texto) => texto !== null)
    .map((texto) => JSON.parse(texto));
}
module.exports = {
  registrarJugador,
  existeJugador,
  crearJuego,
  obtenerJuego,
  guardarJuego,
  listarJuegos,
};
