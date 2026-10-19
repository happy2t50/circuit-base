# Seguridad: precauciones y límites de los ejercicios

## Alcance

Todo el contenido trabaja con **corriente continua de baja tensión**: 5 V (USB y Arduino), 6 V (4 pilas AA), 9 V (pila) y como máximo 12 V. **No se trabaja con la red eléctrica** (127 V en México, 230 V en Europa) en ninguna lección ni práctica.

## Reglas que muestra la aplicación

Están en la lección *Seguridad eléctrica* (Módulo 1) y se recuerdan en el panel principal, el laboratorio y cada práctica:

1. Empezar con circuitos de baja tensión.
2. Desconectar la alimentación antes de modificar el cableado.
3. Evitar cortocircuitos (nunca unir + con − sin carga).
4. Calcular la resistencia limitadora de cada LED.
5. Respetar los límites de corriente y tensión (Arduino Uno: 20 mA recomendados por pin, 40 mA máximo absoluto).
6. Verificar polaridad y conexiones antes de energizar.
7. No trabajar con tensión de red.
8. No conectar cargas de potencia (motores, relés, tiras LED) sin conocer sus requisitos y protecciones.

## Comprobación previa obligatoria

Cada práctica incluye una lista de verificación adaptada a su circuito. El botón "Marcar práctica como completada" permanece desactivado hasta marcar todos los puntos. Para la práctica A1:

- USB desconectado mientras se revisa.
- Resistencia de 220 Ω (rojo, rojo, marrón, oro).
- Ánodo en la tira de la resistencia; cátodo hacia GND.
- Ningún cable une 5V con GND y ningún componente tiene sus dos patas en la misma tira.
- Señal en D8 (no en 5V) y negro en GND.

## Límites de las herramientas

- El **verificador de protoboard** comprueba conexiones, no simula tensiones ni corrientes. Un montaje "correcto" en el verificador puede fallar en la realidad por un componente dañado, un falso contacto o un valor equivocado de resistencia.
- Las **calculadoras** usan valores típicos (tensión directa de LED por color). Los valores reales dependen del componente: consulta su hoja de datos.
- La **calculadora de LED** rechaza corrientes mayores de 20 mA.
- Las advertencias sobre relés y motores explican por qué necesitan transistor, diodo y a menudo alimentación independiente. Las prácticas con esas cargas (Módulo 8) aún no están implementadas.
