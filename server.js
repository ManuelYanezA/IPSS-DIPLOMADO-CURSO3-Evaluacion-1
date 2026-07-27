// ─────────────────────────────────────────────────────────────────────────────
// Evaluación 1 · API del Mundial 2026
// Diplomado IPS · Módulo 3 — Backend y APIs REST
//
// Este es tu punto de partida. Los DATOS ya están (datos-mundial.js): el resto
// lo escribes tú.
//
// ANTES DE EMPEZAR — instala lo que necesites. Por ejemplo:
//     npm install express
//     npm install cors
//
// Para levantar el servidor:
//     npm run dev        (se reinicia solo al guardar)
// ─────────────────────────────────────────────────────────────────────────────

import { continentes, grupos, selecciones, partidos } from './datos-mundial.js'

// TODO: importa express y crea tu app.
//
import express from 'express'
import cors from 'cors'
const app = express()
app.use(cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE']
})) // Middleware para habilitar CORS
app.use(express.json()) // Middleware para leer el cuerpo de los POST
//
// Recuerda el middleware que hace falta para leer el cuerpo de los POST,
// y configura CORS (lo vas a necesitar para el video).

const PORT = 3000

// ─────────────────────────────────────────────────────────────────────────────
// TUS RUTAS
//
// Este es el mapa de lo que tienes que construir. El detalle completo de cada
// una (qué recibe, qué devuelve, qué status) está en el enunciado: léelo.
//
//   ── Base ──────────────────────────────────────────────────────────────────
//   GET  /api/selecciones                     todas
//   GET  /api/selecciones/:id                 una, o 404
//
//   ── Con lógica ⭐ ──────────────────────────────────────────────────────────
//   GET  /api/selecciones?continente=Europa   filtra por continente  (anidada)
//   GET  /api/selecciones?campeon=true        solo las que ganaron alguna copa
//   GET  /api/copas                           todas las copas, en una lista plana
//   GET  /api/copas/:seleccion                las copas de una (por NOMBRE), o 404
//   GET  /api/estadisticas                    resumen del torneo         (vale 2%)
//
//   ── Semifinales y final ⭐ ─────────────────────────────────────────────────
//   POST /api/worldcup/2026/semifinals/:n     registra la semifinal n (1 a 4)
//   GET  /api/worldcup/2026/semifinals/:n     el resultado de la semifinal n
//   GET  /api/worldcup/2026/semifinals        las cuatro
//   POST /api/worldcup/2026/final             registra la final
//   GET  /api/worldcup/2026/final             la final, con su ganador
//
// Ojo: /semifinals/:n es UNA ruta, no cuatro.
// ─────────────────────────────────────────────────────────────────────────────

// Ejemplo para que veas el formato. Bórralo o quédatelo, como prefieras:
//
//app.get('/api/selecciones', (req, res) => {
//    res.json(selecciones)
//})
app.get('/api/grupos', (req, res) => {
    res.json(grupos)
})
app.get('/api/continentes', (req, res) => {
    res.json(continentes)
})
//app.get('/api/selecciones/:id', (req, res) => {
//    const id = parseInt(req.params.id)
//    const seleccion = selecciones.find(s => s.id === id)
//    if (seleccion) {
//        res.json(seleccion)
//    } else {
//        res.status(404).json({ error: 'Selección no encontrada' })
//    }
//})

//
// A partir de aquí, es tuyo. 🚀

// TODO: levanta el servidor.
app.listen(PORT, () => {
  console.log(`⚽ API del Mundial escuchando en http://localhost:${PORT}`)
})

// TODO: Rutas con lógica (Punto 3 del enunciado). Por ejemplo, filtrar por continente, campeones, etc.

app.get('/api/selecciones', (req, res) => {
  
  const { continente, campeon } = req.query
  //console.log('Query params:', req.query) // Para depuración: ver qué query string llegó

  //Parto entregando todas las selecciones, y voy filtrando según las querys que se tengan en la query string
  let resultado = selecciones;


  // 1) GET /api/selecciones?continente=Europa
  //Si existe query de Continente, filtra por continente
  if (continente) {
    const continenteObj = continentes.find(c => c.nombre.toLowerCase() === continente.toLowerCase())
    if (continenteObj) {
      //Se aplica el filtro sobre el resultado actual, en caso de que el usuario necesite filtrar por continente y por algún otro parámetro
      resultado = resultado.filter(s => s.continenteId === continenteObj.id)
    } else {
      return res.status(404).json({ error: `No se encontró el continente ${continente}` })
    }
  }

  // 2) GET /api/selecciones?campeon=true
  //Si existe query de Campeón, filtra por campeones
  if (campeon && campeon.toLowerCase() == 'true') {
    resultado = resultado.filter(s => s.copas.length > 0)
  } else if (campeon && campeon.toLowerCase() == 'false') {
    resultado = resultado.filter(s => s.copas.length === 0)
  } else if (campeon) {
    return res.status(400).json({
        error: `El valor '${campeon}' no es válido. Debe ser 'true' o 'false'.`
    })
}

if(resultado.length === 0) {
  return res.status(200).json({ mensaje: 'No se encontraron selecciones que coincidan con los criterios de búsqueda.' })
}

  //Enviar resultado junto con un status 200
  res.status(200).json(resultado)
  
})

app.get('/api/copas', (req, res) => {
  // 3) GET /api/copas
  let resultado = selecciones.flatMap(s => s.copas)

  //Enviar resultado junto con un status 200
  res.status(200).json(resultado)
})

app.get('/api/copas/:seleccion', (req, res) => {

  // 4) GET /api/copas/:seleccion
  const { seleccion } = req.params; //NOTA: Como se trata de un parámetro de ruta, se accede a él mediante req.params, no req.query.

  const seleccionObj = selecciones.find(
      s => s.nombre.toLowerCase() === seleccion.toLowerCase()
  );

  if (!seleccionObj) {
    return res.status(404).json({
      error: `No se encontró la selección '${seleccion}'.`
    });
  }

  res.status(200).json(seleccionObj.copas)

})

// TODO: Rutas de semifinales y final (Punto 4 del enunciado).

// 1) POST /api/worldcup/2026/semifinals/:n
app.post('/api/worldcup/2026/semifinals/:n', (req, res) => {
    // Obtener el número de semifinal desde la URL, se parsea a número para poder compararlo
    const numero = Number(req.params.n)

    // Obtener los datos enviados en el body
    const { local, visita } = req.body

    // Validar que n esté entre 1 y 4
    if (numero < 1 || numero > 4) {
        return res.status(400).json({
            error: "El número de semifinal debe estar entre 1 y 4."
        })
    }

    // Validar que existan los datos necesarios
    if (!local || !visita) {
        return res.status(400).json({
            error: "Debe enviar los equipos local y visita."
        })
    }

    // Crear el partido
    const partido = {
        numero,
        local,
        visita
    }

    // Guardarlo en memoria
    partidos.semifinales.push(partido)

    // Responder
    res.status(201).json(partido)
})


// 2) GET /api/worldcup/2026/semifinals/:n
app.get('/api/worldcup/2026/semifinals/:n', (req, res) => {
  let resultado = partidos.semifinales

  if (req.params.n) {
    const numero = Number(req.params.n)
    if(numero < 1 || numero > 4) {
      return res.status(400).json({ error: "El número de semifinal debe estar entre 1 y 4." })
    }
    resultado = partidos.semifinales.find(p => p.numero === numero)
    if (resultado) {
      return res.status(200).json(resultado)
    } else {
      return res.status(404).json({ error: "Partido no encontrado" })
    }
  } else {
    return res.status(404).json({ error: "No se detecta número a seleccionar en la ruta" })
  }
})

// 3) GET /api/worldcup/2026/semifinals
app.get('/api/worldcup/2026/semifinals', (req, res) => {
  res.status(200).json(partidos.semifinales)
})

// 4) POST /api/worldcup/2026/final
app.post('/api/worldcup/2026/final', (req, res) => {
  const { local, visita } = req.body

  // Validar que existan los datos necesarios
  if (!local || !visita) {
    return res.status(400).json({
        error: "Debe enviar los equipos local y visita."
    })
  }

  // Crear el partido
  const partido = {
    local,
    visita
  }

  // Guardarlo en memoria
  partidos.final = partido

  // Responder
  res.status(201).json(partido)
})

// 5) GET /api/worldcup/2026/final
app.get('/api/worldcup/2026/final', (req, res) => {
  if (partidos.final) {
    return res.status(200).json(partidos.final)
  } else {
    return res.status(404).json({ error: "Partido no encontrado" })
  }
})