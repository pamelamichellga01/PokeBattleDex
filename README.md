# 📘 Pokédex Battle App

Aplicación web interactiva tipo Pokédex que permite buscar Pokémon, filtrarlos por tipo y simular combates entre equipos basados en sus estadísticas.

---

## 🚀 Características

### 🔍 Buscador de Pokémon
- Búsqueda por nombre con autocompletado (búsqueda parcial).
- Ejemplo: `"char"` → Charmander, Charmeleon, Charizard.
- Selección automática del nombre en el input.
- Filtro adicional por tipo.
- Visualización en tarjeta con:
  - ❤️ Vida (HP)
  - ⚔️ Ataque
  - 🛡️ Defensa

---

### 📂 Pestañas por tipo
- Navegación por tipos (fuego, agua, planta, etc.).
- Muestra automáticamente todos los Pokémon del tipo seleccionado.
- El buscador sigue activo:
  - Si escribes un nombre → muestra solo ese Pokémon.
  - Si no escribes → muestra todos los del tipo.

---

### 📄 Vista de detalle
- Información completa del Pokémon:
  - Imagen
  - Estadísticas completas
  - Habilidades
  - Movimientos
- Botón para regresar a la lista.

---

### ⚔️ Modo batalla

#### 👥 Jugador vs Jugador
- Dos equipos de 3 Pokémon.
- Organización por posiciones (1, 2, 3).
- Posibilidad de reordenar.

#### 🤖 Jugador vs Máquina
- El equipo rival se genera automáticamente.
- El jugador arma su equipo manualmente.

---

### 🧠 Sistema de combate
Cada Pokémon tiene un puntaje basado en:


Combates:
- A1 vs B1
- A2 vs B2
- A3 vs B3

Gana quien tenga mayor puntaje.
El equipo con más victorias gana.

En caso de empate:
- Se enfrentan los Pokémon ganadores entre sí.

---

## 🗂️ Estructura del proyecto

📁 css/
├── batalla.css
├── detalle.css
└── styles.css

📁 html/
├── batalla.html
├── detalle.html
└── pokemon.html

📁 img/
├── Badge_13_1_01.png
├── Badge_13_2_01.png
├── Badge_13_3_01.png
└── logo.png

📁 js/
├── api.js
├── batalla.js
├── navigation.js
├── pokemon-detail.js
└── pokemon-list.js


---

## 🛠️ Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- API: https://pokeapi.co/

---

## ⚙️ Cómo ejecutar el proyecto

1. Clonar el repositorio:

```bash
git clone https://github.com/tu-usuario/tu-repo.git
```  

2. Abrir el archivo:

```bash
index.html
```  

3. Ejecutar en el navegador.
