import os
import time
import numpy as np
from pymongo import MongoClient
import urllib.request
import subprocess
from PIL import Image
import face_recognition # <- Librería para reconocimiento facial

# --- Conexión a MongoDB ---
MONGODB_URI = "mongodb+srv://recuerdamecpf:recuerdame123@recuerdamecluster.yitpqed.mongodb.net/recuerdame?retryWrites=true&w=majority&appName=RecuerdameCluster"
try:
    client = MongoClient(MONGODB_URI)
    client.admin.command('ping') 
    db = client.recuerdame
    coleccion = db.personas
    print("✅ Python: Conectado a MongoDB Atlas")
except Exception as e:
    print(f"❌ Python: Error al conectar con MongoDB Atlas: {e}")
    coleccion = None

# --- Carpeta donde están tus fotos locales en la Pi ---
CARPETA_UPLOADS = '/home/recuerdame/Recuerdame 4.0/public/uploads'

# Listas para almacenar las codificaciones, nombres y la relación
fotos_codificadas = []
nombres = []
relaciones = [] # Usamos 'relaciones' para coincidir con tu DB

print("\n🔍 Cargando fotos y creando codificaciones (encodings) de las personas conocidas...")

if coleccion is not None:
    for persona in coleccion.find():
        foto_db_path = persona.get("foto")
        nombre = persona.get("nombre", "Desconocido")
        # CORRECCIÓN: Capturamos el campo 'relacion' de la base de datos
        relacion = persona.get("relacion", "sin relacion o parentesco") 

        if not foto_db_path:
            print(f"⚠️ {nombre} no tiene foto registrada en la base de datos.")
            continue

        local_path = None
        if foto_db_path.startswith("http://") or foto_db_path.startswith("https://"):
            try:
                local_path = f"/tmp/temp_img_{os.path.basename(foto_db_path)}"
                urllib.request.urlretrieve(foto_db_path, local_path)
            except Exception as e:
                print(f"❌ Error al descargar foto remota de {nombre}: {e}")
                continue
        else:
            nombre_archivo = os.path.basename(foto_db_path)
            local_path = os.path.join(CARPETA_UPLOADS, nombre_archivo)
            if not os.path.isfile(local_path):
                print(f"❌ Archivo no encontrado en la Raspberry Pi: {local_path}")
                continue
        
        try:
            image = face_recognition.load_image_file(local_path)
            face_encodings = face_recognition.face_encodings(image)
            
            if face_encodings:
                fotos_codificadas.append(face_encodings[0])
                nombres.append(nombre)
                relaciones.append(relacion) # Guardamos la relación
                print(f"✅ Codificación creada para: {nombre} ({relacion})")
            else:
                print(f"⚠️ No se detectó ninguna cara en la foto de {nombre}.")

        except Exception as e:
            print(f"❌ Error al procesar la foto de {nombre}: {e}")

else:
    print("⚠️ No se pudo conectar a MongoDB.")

print(f"\n🧠 Carga y codificación de fotos de DB completa. (Total: {len(fotos_codificadas)})")


# --- Parámetros de captura de imagen con `rpicam-still` ---
print("\n📸 Iniciando captura de imagen con rpicam-still...")
CAPTURE_WIDTH = 640
CAPTURE_HEIGHT = 480
FRAME_INTERVAL_SECONDS = 1
TEMP_IMAGE_PATH = "/tmp/current_frame.jpg"

try:
    subprocess.run(["rpicam-still", "--timeout", "100", "--nopreview", "-o", "/dev/null"], check=True, capture_output=True)
    print("✅ rpicam-still parece funcionar correctamente.")
except FileNotFoundError:
    print("❌ ERROR: 'rpicam-still' no encontrado. Asegúrate de que las rpicam-apps estén instaladas.")
    exit()
except subprocess.CalledProcessError as e:
    print(f"❌ ERROR al probar rpicam-still: {e.stderr.decode()}")
    exit()
except Exception as e:
    print(f"❌ Error inesperado al probar rpicam-still: {e}")
    exit()

# Bucle principal de captura y detección/reconocimiento
while True:
    start_time = time.time()

    try:
        command = [
            "rpicam-still", "--width", str(CAPTURE_WIDTH), "--height", str(CAPTURE_HEIGHT),
            "--nopreview", "-o", TEMP_IMAGE_PATH, "--timeout", "100"
        ]
        subprocess.run(command, check=True, capture_output=True)
        
        image_pil = Image.open(TEMP_IMAGE_PATH).convert('RGB')
        frame = np.array(image_pil)
        os.remove(TEMP_IMAGE_PATH)
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error al capturar frame: {e.stderr.decode()}. Reintentando...")
        time.sleep(1)
        continue
    except Exception as e:
        print(f"❌ Error inesperado al procesar frame: {e}. Reintentando...")
        time.sleep(1)
        continue

    # --- Reconocimiento Facial con `face_recognition` ---
    rgb_frame = frame
    
    face_locations = face_recognition.face_locations(rgb_frame)
    if face_locations:
        print(f"\n👤 Se detectaron {len(face_locations)} cara(s) en el frame.")
        
        face_encodings_in_frame = face_recognition.face_encodings(rgb_frame, face_locations)

        for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings_in_frame):
            matches = face_recognition.compare_faces(fotos_codificadas, face_encoding)
            
            nombre_identificado = "Desconocido"
            relacion_identificada = ""

            if True in matches:
                first_match_index = matches.index(True)
                
                nombre_identificado = nombres[first_match_index]
                relacion_identificada = relaciones[first_match_index] # Recuperamos la relación
            
            # 4. Imprimir y Anunciar el resultado
            if nombre_identificado != "Desconocido":
                mensaje_impreso = f" - Cara en [{top},{right},{bottom},{left}] reconocida: {nombre_identificado} (Relación: {relacion_identificada})"
                
                # CREAMOS LA FRASE PARA LA VOZ EN ESPAÑOL
                frase_voz = f"Persona reconocida: {nombre_identificado}. Es {relacion_identificada}."
                
                # Ejecutamos el comando de voz con espeak en español
                os.system(f'espeak -v es "{frase_voz}" 2>/dev/null')
                
            else:
                 mensaje_impreso = f" - Cara en [{top},{right},{bottom},{left}] reconocida: {nombre_identificado}"
                 
                 # Anunciamos que es desconocido
                 frase_voz = f"Persona desconocida."
                 os.system(f'espeak -v es "{frase_voz}" 2>/dev/null')

            print(mensaje_impreso) 

    else:
        print("🔎 No se detectaron caras en el frame.")

    # Pausa para controlar la tasa de frames
    elapsed_time = time.time() - start_time
    if elapsed_time < FRAME_INTERVAL_SECONDS:
        time.sleep(FRAME_INTERVAL_SECONDS - elapsed_time)

print("\nProgram.py terminado.")