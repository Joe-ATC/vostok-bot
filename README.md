# VOSTOK-BOT | CORE 🌸

---

## ◣ ASISTENTE DE ÉLITE PARA WHATSAPP ◥

**ESTADO:** OPERATIVO [V-3.1.0-STABLE] ⚙️

---

## 🚀 NOVEDADES Y MEJORAS RECIENTES

Hemos actualizado el núcleo de **Vostok-Bot** para ofrecer una experiencia premium y segura:

### 🛡️ Administración Avanzada (Modo Fantasma)
- **Ejecución Directa:** Comandos `!kick`, `!promote` y `!demote` optimizados para actuar al instante, ignorando retrasos de sincronización.
- **Limpieza Automática:** El bot borra el mensaje de comando original para mantener el chat impecable.
- **Mención Masiva Inteligente:** `!tagall` rediseñado con borrado retardado para mayor efectividad.

### 🕵️‍♂️ Función Secreta: Anti-Delete
- **Detección en Tiempo Real:** El bot recupera y expone cualquier mensaje borrado (Texto, Imágenes, Videos, Notas de Voz y Stickers).
- **Filtro Inteligente:** Ignora borrados del "Modo Fantasma" para no delatarse a sí mismo.

### ✨ Experiencia de Usuario (UI/UX)
- **Stickers Premium:** Metadatos estilizados con Nombre del Bot, Usuario solicitante y Hora exacta.
- **Animaciones de Texto:** El comando `!creador` incluye una secuencia animada de carga en tiempo real.
- **Atajos Ultra-Rápidos:** Usa simplemente la letra `s` (sin prefijo) para crear stickers al instante.

---

## 🛠️ FUNCIONALIDADES PRINCIPALES

- 🌸 **Gestión de Grupos:** Control total de miembros y rangos.
- 🌸 **Utilidades:** Conversor de multimedia (Stickers, TTS con voces de Google/Loquendo).
- 🌸 **Inteligencia:** Sistema de recuperación de mensajes y FAQ interactivo.
- 🌸 **Rendimiento:** Monitorización de memoria y uptime en tiempo real.

---

## 📦 STACK TECNOLÓGICO

- **Plataforma:** Node.js
- **Conector:** @whiskeysockets/baileys (Modern Edition)
- **Multimedia:** FFmpeg / wa-sticker-formatter
- **Diseño:** ASCII, Mono-Space & Script Fonts

---

## 📱 Uso en Termux (Android)

Puedes ejecutar el bot directamente en un teléfono Android usando **Termux** (simulando un VPS local). Estos son los pasos básicos:

1. Instala Termux desde F-Droid o la tienda oficial.
2. Abre Termux y actualiza paquetes:

```bash
pkg update && pkg upgrade -y
```

3. Instala dependencias necesarias:

```bash
pkg install -y nodejs ffmpeg git wget curl
```

4. Clona o copia este repositorio dentro de Termux y entra al proyecto:

```bash
git clone https://github.com/Joe-ATC/vostok-bot.git
cd vostok-bot
```

5. Instala las dependencias de Node.js:

```bash
npm install
```

> 🔧 En algunos casos, puede que necesites instalar paquetes adicionales como `webp` o `imagemagick`.

6. Inicia el bot:

```bash
npm start
```

> 💡 Si quieres cambiar la ruta de sesión (útil si quieres guardarla en `/data/data/com.termux/files/home/`), puedes usar la variable de entorno:
>
> ```bash
> SESSION_PATH=/data/data/com.termux/files/home/vostok-session npm start
> ```

---

*Vostok-Bot: Poder, Elegancia y Control.* 🏵️
**Powered by GR-&&**
