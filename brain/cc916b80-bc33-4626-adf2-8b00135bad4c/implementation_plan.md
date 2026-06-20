# Arquitectura de Incidencias: Flujo de Juzgado (Habbo-Web)

¡Me encanta la visión! Entiendo perfectamente tu punto como arquitecto. Si tenemos la sede en el hotel, la plataforma debe ser la **antesala preparatoria** y el **registro histórico**, no reemplazar la interacción en vivo. 

Aquí te presento la nueva arquitectura estructurada para reflejar exactamente ese flujo profesional:

## 1. La Línea de Tiempo del Caso (Estados)

El ciclo de vida de una Incidencia pasará por estas fases formales:

1. **`ABIERTA` (Bandeja de Solicitudes)**: 
   - El Comandante A radica la denuncia.
   - Aparece en la pestaña "Solicitudes" de los jueces. Nadie puede comentar.

2. **`EN_REVISION` (Caso Tomado)**:
   - Un Juez hace click en **"Tomar Caso"**. A partir de este momento, **ningún otro juez puede intervenir** ni comentar.
   - El Juez asignado analiza las pruebas iniciales.
   - Toma una decisión: o lo **Desestima** (rechazado por falta de pruebas) o lo **Acepta para Juicio**.

3. **`EN_PROCESO` (Juicio Programado)**:
   - El Juez acepta el caso y **fija Fecha y Hora** para la audiencia en Habbo.
   - El Ejército B (acusado) es notificado, puede entrar al caso y **subir sus pruebas de defensa**.
   - Los comentarios internos entre el Juez y las partes se habilitan como un canal preparatorio antes del juicio.

4. **`RESUELTA` (Veredicto Final)**:
   - Se realiza el juicio en la sala del hotel.
   - El Juez entra a la web, redacta la sentencia final (Veredicto) y cierra el caso.

## 2. Cambios en la Base de Datos (Prisma)
- Agregar el campo `fechaJuicio DateTime?` a la tabla `Incidencia`.
- El enum de estados ya tiene `ABIERTA`, `EN_REVISION`, `EN_PROCESO`, `RESUELTA`, `DESESTIMADA`, por lo que calza perfectamente con nuestra lógica sin necesidad de migraciones destructivas.

## 3. El Calendario Central
- Como mencionaste que necesitan un calendario para "actividades, juzgados, reuniones", usaré el modelo `Evento` que ya existe en la base de datos (y tiene fecha, tipo, etc).
- Cuando el Juez programe el juicio, **se creará automáticamente un Evento de tipo "JUICIO"** que aparecerá en el calendario global.
- Crearemos una pestaña/vista de **Calendario** para que todos (o los oficiales) puedan ver cuándo hay juicios, reuniones o actividades de ejércitos.

## 4. El "Traspaso"
- Simplemente habrá un botón **"Soltar Caso"** (para el Juez asignado o un Admin). Al pulsarlo, el caso pierde el `juezId` y vuelve a estado `ABIERTA` en la bandeja pública de los jueces.

## User Review Required

> [!IMPORTANT]
> **Sobre el Calendario**: ¿Querés que construya una pestaña pública de "Calendario" (ej. `/calendario` o `/eventos`) donde toda la comunidad pueda ver la grilla de Juicios y Reuniones agendadas? ¿O el calendario será solo de uso interno en el panel de Comandantes/Administradores?

Confírmame si esta arquitectura de "Antesala Web -> Juicio Habbo -> Veredicto Web" es exactamente lo que tenés en mente, y en base a lo del calendario, arranco a modificar la base de datos.
