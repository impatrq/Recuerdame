🧠 Recuérdame – Sistema de Asistencia para Personas con Deterioro Cognitivo

Prototipo desarrollado con Raspberry Pi Zero 2, reconocimiento facial y WebApp propia para gestión de pacientes.

⸻

📌 Descripción del Proyecto

Recuérdame es un sistema diseñado para asistir a personas con deterioro cognitivo leve o moderado mediante:
	•	Reconocimiento facial en tiempo real
	•	Identificación por voz
	•	Registro y gestión de personas cercanas (familiares, amigos, cuidadores)
	•	Estadísticas de seguimiento cognitivo

El sistema funciona de manera autónoma, toma fotografías constantemente, detecta rostros y los compara con una base de datos alojada en MongoDB Atlas.
Al encontrar una coincidencia, anuncia por voz:

“Persona reconocida: Juan Pérez. Es su hijo.”

⸻

🚀 Tecnologías Utilizadas

Backend (Running en Raspberry Pi)
	•	Python 3
	•	Librería face_recognition
	•	PIL (Pillow)
	•	MongoDB Atlas mediante pymongo
	•	rpicam-apps (rpicam-still)
	•	espeak (síntesis de voz)

Frontend / WebApp
	•	HTML, CSS y JavaScript
	•	Express.js para servir la app
	•	MongoDB Atlas para almacenar pacientes
	•	Diseño mobile-first y estilo de app nativa

⸻

🧩 Cómo Funciona el Sistema
	1.	Los lentes capturan fotos cada 1 segundo.
	2.	El sistema detecta si hay un rostro presente.
	3.	Si se detecta una cara:
	•	Se genera su encoding (vector facial).
	•	Se compara con las codificaciones de la base de datos.
	4.	Si coincide con alguien registrado:
	•	Informa nombre y relación por voz.
	5.	Todo funciona de manera local, sin internet, una vez cargada la base.

⸻

📦 Instalación

1. Clonar el repositorio

git clone https://github.com/tuusuario/Recuerdame.git
cd Recuerdame

2. Instalar dependencias de Python

pip install face_recognition pymongo pillow numpy

3. Instalar rpicam-apps

sudo apt install rpicam-apps

4. Instalar espeak

sudo apt install espeak

5. Configurar tu string de MongoDB en el archivo Python

MONGODB_URI = "mongodb+srv://..."


⸻

▶️ Cómo Usar Recuérdame

1. Conectar el dispositivo a una red WiFi

2. Acceder a la terminal sin cable USB

(Gracias al sistema interno de acceso remoto)

3. Iniciar sesión con usuario y contraseña del equipo

4. Obtener la IP local

hostname -I

5. En el navegador (misma red), entrar a la WebApp

http://IP:5000

Ejemplo:

192.168.0.15:5000

6. Registrar personas

En la sección Personas, se cargan:
	•	Nombre
	•	Relación
	•	Foto

Luego reiniciar Recuérdame para actualizar encodings.

7. Funcionamiento autónomo

Al iniciar:
	•	Procesa las fotos
	•	Crea las codificaciones
	•	Anuncia:
“Sistema Recuérdame listo para ayudarte.”
	•	Comienza a reconocer personas automáticamente.

8. Batería
	•	Carga por Micro-USB
	•	Aproximadamente 1 hora de carga = 3 horas de autonomía

⸻

📊 Estadísticas del Paciente

La WebApp calcula automáticamente:
	•	Cantidad de preguntas correctas / incorrectas / omitidas
	•	Último test realizado
	•	Tendencias semanales/mensuales
	•	Caídas significativas en orientación temporal o memoria
	•	Alertas visuales a familiares o profesionales

Incluye también una ficha rápida del paciente en la pantalla principal.
⸻

🔧 Arquitectura General

[ Cámara Raspberry ] -> captura -> [ Procesador Pi Zero 2 ]
        |                                     |
        v                                     v
[ face_recognition ] -> encodings -> [ Comparación con DB ]
        |                                     |
        v                                     v
[ Identificación ] -----------------> [ Síntesis de voz ESpeak ]

⸻

🤝 Agradecimientos / Sponsors
	•	FADESA – Financió el 100% del proyecto.
	•	Proyecto Color – Diseño e impresión 3D de piezas.
	•	UADE – Prestó laboratorios y equipamiento.

⸻

🧑‍💻 Autores

    Carlos Gabri Krizak 
    Facundo Mendez
    Pedro Amenta


⸻

🏁 Estado del Proyecto

✔️ Prototipo funcional
✔️ Reconocimiento con ~80% de precisión
✔️ Base de datos integrada
✔️ WebApp operativa
⚙️ Mejoras futuras: optimizar rendimiento, integrar batería más grande.

⸻