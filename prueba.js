const { esNumeroValido, calcular } = require("./src/logica");

console.log(calcular("4271", "1234"));
console.log(calcular("5830", "3850"));
console.log(calcular("4271", "4271"));
console.log(calcular("4271", "9568"));

console.log(esNumeroValido("1234"));
console.log(esNumeroValido("1123"));
console.log(esNumeroValido("12a4"));
console.log(esNumeroValido("123"));
