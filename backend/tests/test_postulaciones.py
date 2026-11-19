from tests.helpers import (
    EMPRESA, OTRA_EMPRESA, auth, crear_vacante, postular, vacante_activa,
)


def test_postular_ok(client):
    vacante = vacante_activa(client)
    r = postular(client, vacante["id"])
    assert r.status_code == 201
    assert r.json()["estado"] == "postulada"


def test_no_se_postula_a_vacante_pendiente(client):
    vacante = crear_vacante(client)  # sigue pendiente
    assert postular(client, vacante["id"]).status_code == 400


def test_postulacion_duplicada(client):
    vacante = vacante_activa(client)
    postular(client, vacante["id"])
    assert postular(client, vacante["id"]).status_code == 409


def test_no_postula_si_no_cumple_requisitos(client):
    vacante = vacante_activa(client, creditos_minimos=200)
    r = postular(client, vacante["id"])
    assert r.status_code == 400
    assert "créditos" in r.json()["detail"]


def test_empresa_ajena_no_ve_postulantes(client):
    vacante = vacante_activa(client)
    postular(client, vacante["id"])
    r = client.get(f"/api/v1/vacantes/{vacante['id']}/postulaciones",
                   headers=auth(client, OTRA_EMPRESA))
    assert r.status_code == 403


def test_seleccionar_crea_practica_y_cierra_vacante(client):
    vacante = vacante_activa(client, horas_exigidas=100)
    postulacion = postular(client, vacante["id"]).json()

    r = client.patch(f"/api/v1/postulaciones/{postulacion['id']}/seleccionar",
                     headers=auth(client, EMPRESA))
    assert r.status_code == 200
    assert r.json()["estado"] == "postulada"
    assert r.json()["horas_requeridas"] == 100

    detalle = client.get(f"/api/v1/vacantes/{vacante['id']}", headers=auth(client, EMPRESA)).json()
    assert detalle["estado"] == "cerrada"
    assert postular(client, vacante["id"]).status_code == 400