const path = require("path");
const express = require("express");
const almacen = require("./almacen");
const { esNumeroValido, calcular } = require("./logica");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

function vistaPublica(juego) {
  return {
    id: juego.id,
    estado: juego.estado,
    creador: juego.creador,
    jugadores: juego.jugadores.map((j) => j.nombre),
    turno: juego.turno,
    ganador: juego.ganador,
    intentos: juego.intentos,
  };
}

async function identificar(req, res, next) {
  const { nombre } = req.body || {};

  if (typeof nombre !== "string" || nombre.trim() === "") {
    return res.status(400).json({ error: "Debes enviar tu nombre" });
  }

  if (!(await almacen.existeJugador(nombre.trim()))) {
    return res.status(401).json({ error: "Primero debes hacer login" });
  }

  req.nombre = nombre.trim();
  next();
}

app.post("/login", async (req, res) => {
  const { nombre } = req.body || {};

  if (typeof nombre !== "string" || nombre.trim() === "") {
    return res.status(400).json({ error: "Debes enviar tu nombre" });
  }
  await almacen.registrarJugador(nombre.trim());
  res.json({ nombre: nombre.trim(), mensaje: "Jugador registrado" });
});

app.post("/juego", identificar, async (req, res) => {
  const { numero } = req.body || {};

  if (!esNumeroValido(numero)) {
    return res
      .status(400)
      .json({ error: "El número debe tener 4 cifras distintas" });
  }

  const juego = await almacen.crearJuego({
    estado: "sin completar",
    creador: req.nombre,
    jugadores: [{ nombre: req.nombre, secreto: numero }],
    turno: null,
    ganador: null,
    intentos: [],
  });

  res.status(201).json({ id: juego.id, estado: juego.estado });
});

app.put("/juego/:id", identificar, async (req, res) => {
  const { numero } = req.body;

  if (!esNumeroValido(numero)) {
    return res.status(400).json({ error: "El número debe tener 4 cifras" });
  }

  const juego = await almacen.obtenerJuego(req.params.id);
  if (!juego) {
    return res.status(404).json({ error: "La partida no existe" });
  }

  if (juego.estado !== "sin completar") {
    return res.status(409).json({ error: "La partida ya tiene 2 jugadores" });
  }

  if (juego.creador === req.nombre) {
    return res
      .status(409)
      .json({ error: "No puedes unirte a tu propia partida" });
  }

  juego.jugadores.push({ nombre: req.nombre, secreto: numero });
  juego.estado = "en juego";
  juego.turno = juego.jugadores[Math.floor(Math.random() * 2)].nombre;

  await almacen.guardarJuego(juego);

  res.json({ id: juego.id, estado: juego.estado, turno: juego.turno });
});

app.post("/juego/:id/jugar", identificar, async (req, res) => {
  const { numero } = req.body;

  if (!esNumeroValido(numero)) {
    return res
      .status(400)
      .json({ error: "El número debe tener 4 cifras distintas" });
  }

  const juego = await almacen.obtenerJuego(req.params.id);
  if (!juego) {
    return res.status(404).json({ error: "La partida no existe" });
  }

  const yo = juego.jugadores.find((j) => j.nombre === req.nombre);
  if (!yo) {
    return res.status(403).json({ error: "No participas en esta partida" });
  }

  if (juego.estado !== "en juego") {
    return res.status(409).json({ error: "La partida no está en juego" });
  }

  if (juego.turno !== req.nombre) {
    return res.status(409).json({ error: "No es tu turno" });
  }

  const rival = juego.jugadores.find((j) => j.nombre !== req.nombre);
  const { fijas, picas } = calcular(rival.secreto, numero);

  juego.intentos.push({ jugador: req.nombre, numero, fijas, picas });

  if (fijas === 4) {
    juego.estado = "terminado";
    juego.ganador = req.nombre;
    juego.turno = null;
  } else {
    juego.turno = rival.nombre;
  }

  await almacen.guardarJuego(juego);

  res.json({ fijas, picas, ganador: juego.ganador, turno: juego.turno });
});

app.get("/juego/:id", async (req, res) => {
  const juego = await almacen.obtenerJuego(req.params.id);
  if (!juego) {
    return res.status(404).json({ error: "La partida no existe" });
  }
  res.json(vistaPublica(juego));
});

app.get("/juego", async (req, res) => {
  const juegos = await almacen.listarJuegos();

  res.json(
    juegos.map((juego) => ({
      id: juego.id,
      estado: juego.estado,
      creador: juego.creador,
      jugadores: juego.jugadores.map((j) => j.nombre),
      ganador: juego.ganador,
    })),
  );
});

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => {
  console.log(`Servidor escuchando en el puerto ${PUERTO}`);
});
