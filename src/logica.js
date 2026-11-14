function esNumeroValido(numero) {
  if (typeof numero !== "string") return false;
  if (!/^\d{4}$/.test(numero)) return false;
  return new Set(numero).size === 4;
}

function calcular(secreto, intento) {
  let fijas = 0;
  let picas = 0;
  for (let i = 0; i < 4; i++) {
    if (intento[i] === secreto[i]) {
      fijas++;
    } else if (secreto.includes(intento[i])) {
      picas++;
    }
  }
  return { fijas, picas };
}

module.exports = { esNumeroValido, calcular };
