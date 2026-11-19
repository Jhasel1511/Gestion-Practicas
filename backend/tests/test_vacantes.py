from tests.helpers import (
    COORDINADOR, ESTUDIANTE, OTRA_EMPRESA, VACANTE, auth, crear_vacante, vacante_activa,
)


def test_empresa_crea_vacante_pendiente(client):
    vacante = crear_vacante(client)
    assert vacante["estado"] == "pendiente"


def test_estudiante_no_puede_crear_vacante(client):
    r = client.post("/api/v1/vacantes", json=VACANTE, headers=auth(client, ESTUDIANTE))
    assert r.status_code == 403


def test_estudiante_solo_ve_vacantes_activas(client):
    vacante = crear_vacante(client)
    headers = auth(client, ESTUDIANTE)
    assert client.get("/api/v1/vacantes", headers=headers).json() == []

    client.patch(f"/api/v1/vacantes/{vacante['id']}/aprobar", headers=auth(client, COORDINADOR))
    assert len(client.get("/api/v1/vacantes", headers=headers).json()) == 1


def test_duracion_negativa_es_rechazada(client):
    r = client.post("/api/v1/vacantes", json={**VACANTE, "duracion_semanas": -1},
                    headers=auth(client, "rh@acme.com"))
    assert r.status_code == 422


def test_coordinador_rechaza_vacante(client):
    vacante = crear_vacante(client)
    r = client.patch(f"/api/v1/vacantes/{vacante['id']}/rechazar", headers=auth(client, COORDINADOR))
    assert r.json()["estado"] == "rechazada"


def test_empresa_ajena_no_edita_vacante(client):
    vacante = crear_vacante(client)
    r = client.put(f"/api/v1/vacantes/{vacante['id']}", json={"titulo": "Título nuevo"},
                   headers=auth(client, OTRA_EMPRESA))
    assert r.status_code == 403


def test_elegibilidad_cumple_requisitos(client):
    vacante = vacante_activa(client)
    r = client.get(f"/api/v1/vacantes/{vacante['id']}/elegibilidad", headers=auth(client, ESTUDIANTE))
    assert r.json()["elegible"] is True


def test_elegibilidad_no_cumple_creditos(client):
    vacante = vacante_activa(client, creditos_minimos=200)
    r = client.get(f"/api/v1/vacantes/{vacante['id']}/elegibilidad", headers=auth(client, ESTUDIANTE))
    assert r.json()["elegible"] is False
    assert len(r.json()["motivos"]) == 1  # Ana sí cumple el promedio