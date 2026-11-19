from tests.helpers import (
    COORDINADOR, EMPRESA, ESTUDIANTE, auth, confirmar_horas, practica_aprobada,
    practica_con_horas_completas, registrar_horas,
)


def evaluar(client, practica_id, email, nota=4.5):
    return client.post(f"/api/v1/practicas/{practica_id}/evaluaciones",
                       json={"calificacion": nota, "comentarios": "Buen trabajo."},
                       headers=auth(client, email))


def certificar(client, practica_id, email=COORDINADOR):
    return client.post(f"/api/v1/practicas/{practica_id}/certificado", headers=auth(client, email))


def test_no_se_evalua_sin_completar_las_horas(client):
    practica = practica_aprobada(client, horas_exigidas=100)
    registro = registrar_horas(client, practica["id"], 4).json()
    confirmar_horas(client, registro["id"])  # 4 de 100 horas
    assert evaluar(client, practica["id"], EMPRESA).status_code == 400


def test_calificacion_fuera_de_rango(client):
    practica = practica_con_horas_completas(client)
    assert evaluar(client, practica["id"], EMPRESA, nota=6).status_code == 422


def test_evaluacion_duplicada(client):
    practica = practica_con_horas_completas(client)
    assert evaluar(client, practica["id"], EMPRESA).status_code == 201
    assert evaluar(client, practica["id"], EMPRESA).status_code == 409


def test_certificado_exige_ambas_evaluaciones(client):
    practica = practica_con_horas_completas(client)
    evaluar(client, practica["id"], EMPRESA)
    r = certificar(client, practica["id"])
    assert r.status_code == 400
    assert "estudiante_a_empresa" in r.json()["detail"]


def test_solo_el_coordinador_certifica(client):
    practica = practica_con_horas_completas(client)
    evaluar(client, practica["id"], EMPRESA)
    evaluar(client, practica["id"], ESTUDIANTE)
    assert certificar(client, practica["id"], email=EMPRESA).status_code == 403


def test_flujo_completo_cierra_la_practica(client):
    practica = practica_con_horas_completas(client)
    assert evaluar(client, practica["id"], EMPRESA).status_code == 201
    assert evaluar(client, practica["id"], ESTUDIANTE).status_code == 201

    r = certificar(client, practica["id"])
    assert r.status_code == 201
    assert r.json()["horas_totales"] == 8
    assert r.json()["estudiante_nombre"] == "Ana Pérez"

    assert certificar(client, practica["id"]).status_code == 409  # un solo certificado

    mias = client.get("/api/v1/practicas/mias", headers=auth(client, ESTUDIANTE)).json()
    assert mias[0]["estado"] == "cerrada"
    assert registrar_horas(client, practica["id"], 1).status_code == 400  # ya no admite horas
    assert client.get(f"/api/v1/practicas/{practica['id']}/certificado",
                      headers=auth(client, ESTUDIANTE)).status_code == 200