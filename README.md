# VOSTOK-BOT | CORE

---

## ◣ ASISTENTE MULTI-FUNCIONAL PARA WHATSAPP ◥

![Banner](banfun.gif)

ESTADO DEL PROYECTO: OPERATIVO [V-2.1.0]

---

## ARQUITECTURA Y PROCESO DE DESARROLLO

El desarrollo de este bot se baso en tres pilares fundamentales:

1. CONEXION Y ESTABILIDAD (BACKEND)
   - Implementacion de Baileys Multi-Device.
   - Sistema de reconexion automatica con Backoff Exponencial.
   - Manejo global de excepciones para prevenir cierres inesperados.
   - Soporte para vinculacion via QR y Pairing Code.

2. LOGICA MODULAR (COMMANDS)
   - Separacion de comandos en archivos independientes.
   - Procesamiento de imagenes y videos mediante FFmpeg (Mobile-First).
   - Sistema de metadatos EXIF para la generacion de Stickers.

3. INTERFAZ RESPONSIVA (UI)
   - Diseño de menus adaptables a dispositivos moviles.
   - Uso de caracteres ASCII y Small Caps para estetica premium.
   - Menciones dinamicas y respuestas citadas automáticas.

---

## FUNCIONALIDADES ACTUALES

- [!] MENU : Panel de control interactivo y responsivo.
- [!] STICKER : Conversor de Imagen/Video/GIF a Sticker.
- [!] PREGUNTAS : Sistema de FAQ y Soporte integrado.
- [!] PING : Medidor de latencia del servidor.
- [!] CREADOR : Info del dev.

---

## STACK TECNOLOGICO

- PLATAFORMA : Node.js (JavaScript)
- MOTOR : @whiskeysockets/baileys
- MULTIMEDIA : FFmpeg Static
- ESTILO : ASCII / Small Caps Helpers

---

## POWERED BY GR-&&
