# Glosario

Referencia de términos técnicos de Manaflow y conceptos de TCGs.

---

## Términos de Manaflow

### Replay

Una grabación de una partida que puede reproducirse. Contiene el estado inicial y una secuencia de eventos.

### GameSnapshot

Estado completo del juego en un momento específico. Incluye:
- Jugadores
- Entidades
- Zonas
- Fase actual
- Turno

### ReplayFrame

Un frame del replay que contiene:
- El evento que lo generó (opcional)
- El snapshot resultante

### ReplayEngine

Motor que gestiona la navegación por los frames del replay.

### ReplayStore

Store que gestiona el estado y permite suscribirse a cambios.

### Entity (Entidad)

Cualquier objeto en el juego: cartas, jugadores, markers, tokens.

### Component (Componente)

Parte de una entidad que define sus características (CARD, ATTACK, etc.).

### Zone (Zona)

Área del juego donde residen las entidades:
- **hand** - Mano del jugador
- **board** - Tablero de juego
- **deck** - Mazo
- **discard** - Cementerio
- **stack** - Pila (para efectos)
- **resource** - Recursos (mana, runas)

---

## Términos de TCG

### Mulligan

Proceso de reemplazar la mano inicial antes de empezar la partida.

### Priority (Prioridad)

El orden en que los jugadores pueden tomar acciones. En la mayoría de TCGs, el jugador activo tiene prioridad primero.

### Stack (Pila)

Área donde se resuelven los efectos en orden LIFO (Last In, First Out). Común en Magic: The Gathering.

### Combat Phase (Fase de Combate)

Fase del turno donde ocurren los ataques.

### Main Phase (Fase Principal)

Fase donde se pueden jugar cartas y activar habilidades.

### Draw Phase (Fase de Robar)

Fase donde el jugador roba una carta.

### End Phase (Fase Final)

Fase donde se resuelven efectos de final de turno.

### Tapped (Girado)

Estado de una carta que ha sido usada este turno y no puede usarse de nuevo.

### Exhausted (Agotado)

Similar a tapped, usado en algunos juegos.

### Attack (Ataque)

Acción de una unidad para inflictir daño.

### Block (Bloqueo)

Acción de defender contra un ataque.

### Damage (Daño)

Puntos de vida perdidos por un ataque o efecto.

### Mana/Resources (Recursos)

Recursos usados para jugar cartas.

### Rarity (Rareza)

Clasificación de cartas:
- **common** - Común
- **rare** - Rara
- **epic** - Épica
- **legendary** - Legendaria

---

## Términos Técnicos

### ECS (Entity-Component-System)

Arquitectura donde las entidades tienen componentes que definen su comportamiento.

### Schema (Esquema)

Definición formal de la estructura de datos.

### Validator (Validador)

Función que verifica que los datos cumplen el esquema.

### Hydration (Hidratación)

Proceso derenderizar contenido del servidor en el cliente.

---

## Referencias

- [Arquitectura](architecture.md)
- [Tipos de datos](../reference/types.md)
- [Esquemas JSON](../reference/schemas.md)
