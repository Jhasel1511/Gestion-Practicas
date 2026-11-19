from datetime import date

PASSWORD = "Clave123!"
ESTUDIANTE = "ana@uni.edu.co"
EMPRESA = "rh@acme.com"
OTRA_EMPRESA = "rh@otra.com"
COORDINADOR = "coord@uni.edu.co"
GESTOR = "gestor@uni.edu.co"

VACANTE = {
    "titulo": "Practicante de desarrollo web",
    "area": "Software",
    "descripcion": "Apoyo en el desarrollo de una plataforma interna.",
    "duracion_semanas": 16,
    "horas_exigidas": 480,
    "creditos_minimos": 100,
    "promedio_minimo": 3.5,
    "perfil_requerido": "Ingeniería de Sistemas",
}


def hoy() -> str:
    return date.today().isoformat()


def auth(client, email, password=PASSWORD):
    """Headers con el token del usuario. Guarda el token para no repetir el login (bcrypt es lento)."""
    tokens = client.__dict__.setdefault("_tokens", {})
    if email not in tokens:
        r = client.post("/api/v1/auth/login", json={"email": email, "password": password})
        assert r.status_code == 200, r.text
        tokens[email] = r.json()["access_token"]
    return {"Authorization": f"Bearer {tokens[email]}"}


def crear_vacante(client, **cambios):
    r = client.post("/api/v1/vacantes", json={**VACANTE, **cambios}, headers=auth(client, EMPRESA))
    assert r.status_code == 201, r.text
    return r.json()


def vacante_activa(client, **cambios):
    vacante = crear_vacante(client, **cambios)
    r = client.patch(f"/api/v1/vacantes/{vacante['id']}/aprobar", headers=auth(client, COORDINADOR))
    assert r.status_code == 200, r.text
    return r.json()


def postular(client, vacante_id):
    return client.post("/api/v1/postulaciones", json={"vacante_id": vacante_id},
                       headers=auth(client, ESTUDIANTE))


def practica_postulada(client, **cambios):
    """Vacante activa -> Ana se postula -> la empresa la selecciona."""
    vacante = vacante_activa(client, **cambios)
    r = postular(client, vacante["id"])
    assert r.status_code == 201, r.text
    r = client.patch(f"/api/v1/postulaciones/{r.json()['id']}/seleccionar",
                     headers=auth(client, EMPRESA))
    assert r.status_code == 200, r.text
    practica = r.json()
    practica["vacante_id"] = vacante["id"]
    return practica


def practica_aprobada(client, **cambios):
    practica = practica_postulada(client, **cambios)
    r = client.patch(f"/api/v1/practicas/{practica['id']}/aprobar", json={},
                     headers=auth(client, COORDINADOR))
    assert r.status_code == 200, r.text
    return {**practica, **r.json()}


def registrar_horas(client, practica_id, horas, fecha=None):
    return client.post(f"/api/v1/practicas/{practica_id}/horas",
                       json={"fecha": fecha or hoy(), "horas": horas},
                       headers=auth(client, ESTUDIANTE))


def confirmar_horas(client, registro_id):
    r = client.patch(f"/api/v1/horas/{registro_id}/confirmar", headers=auth(client, EMPRESA))
    assert r.status_code == 200, r.text
    return r.json()


def practica_con_horas_completas(client):
    """Práctica en curso con el 100 % de horas confirmadas (vacante de 8 horas)."""
    practica = practica_aprobada(client, horas_exigidas=8)
    r = registrar_horas(client, practica["id"], 8)
    assert r.status_code == 201, r.text
    confirmar_horas(client, r.json()["id"])
    return practica