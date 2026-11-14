let yo = null;
let partidaActual = null;

const $ = (id) => document.getElementById(id);

function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto ?? "";
  return div.innerHTML;
}

function mostrarMensaje(texto) {
  $("mensaje").textContent = texto;
}

async function api(metodo, ruta, cuerpo) {
  const opciones = {
    method: metodo,
    headers: { "Content-type": "application/json" },
  };
  if (cuerpo) opciones.body = JSON.stringify(cuerpo);

  const respuesta = await fetch(ruta, opciones);
  const datos = await respuesta.json();

  if (!respuesta.ok) throw new Error(datos.error);
  return datos;
}

async function entrar() {
  try {
    const datos = await api("POST", "/login", { nombre: $("nombre").value });
    yo = datos.nombre;
    $("yo").textContent = yo;
    $("login").hidden = true;
    $("principal").hidden = false;
    mostrarMensaje("");
    refrescar();
    setInterval(refrescar, 2000);
  } catch (error) {
    mostrarMensaje(error.message);
  }
}

async function crear() {
  try {
    const datos = await api("POST", "/juego", {
      nombre: yo,
      numero: $("secreto").value,
    });
    partidaActual = datos.id;
    mostrarMensaje("");
    refrescar();
  } catch (error) {
    mostrarMensaje(error.message);
  }
}

async function unirse(id) {
  try {
    await api("PUT", `/juego/${id}`, {
      nombre: yo,
      numero: $("secreto").value,
    });
    partidaActual = id;
    mostrarMensaje("");
    refrescar();
  } catch (error) {
    mostrarMensaje(error.message);
  }
}

async function jugar() {
  try {
    const datos = await api("POST", `/juego/${partidaActual}/jugar`, {
      nombre: yo,
      numero: $("intento").value,
    });
    $("intento").value = "";
    mostrarMensaje(`Resultado: ${datos.fijas} fijas, ${datos.picas} picas`);
    refrescar();
  } catch (error) {
    mostrarMensaje(error.message);
  }
}

function ver(id) {
  partidaActual = id;
  refrescar();
}

async function refrescar() {
  const juegos = await api("GET", "/juego");

  $("partidas").innerHTML = juegos
    .map((j) => {
      let boton = `<button onclick="ver('${j.id}')">Ver</button>`;
      if (j.estado === "sin completar" && j.creador !== yo) {
        boton += ` <button onclick="unirse('${j.id}')">Unirse</button>`;
      }
      return `<tr>
        <td>${j.id}</td>
        <td>${j.estado}</td>
        <td>${escapar(j.creador)}</td>
        <td>${escapar(j.jugadores.join(", "))}</td>
        <td>${escapar(j.ganador || "-")}</td>
        <td>${boton}</td>
        </tr>`;
    })
    .join("");

  if (!partidaActual) return;

  const p = await api("GET", `/juego/${partidaActual}`);
  $("detalle").hidden = false;
  $("d-id").textContent = p.id;

  if (p.estado === "terminado") {
    $("d-info").textContent = `Terminada. Ganó ${p.ganador}.`;
  } else if (p.estado === "sin completar") {
    $("d-info").textContent = "Esperando a que alguien se una...";
  } else {
    $("d-info").textContent =
      p.turno === yo ? "Es tu turno." : `Turno de ${p.turno}.`;
  }

  $("jugar").disabled = !(p.estado === "en juego" && p.turno === yo);

  $("intentos").innerHTML = p.intentos
    .map(
      (i) => `<tr>
        <td>${escapar(i.jugador)}</td>
        <td>${i.numero}</td>
        <td>${i.fijas}</td>
        <td>${i.picas}</td>
    </tr>`,
    )
    .join("");
}

$("entrar").onclick = entrar;
$("crear").onclick = crear;
$("jugar").onclick = jugar;
