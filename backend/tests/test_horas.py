from datetime import date, timedelta

from tests.helpers import (
    EMPRESA, ESTUDIANTE, OTRA_EMPRESA, auth, confirmar_horas, practica_aprobada, registrar_horas,
)


def test_primera_jornada_inicia_la_practica(client):
    practica = practica_aprobada(client)
    assert registrar_horas(client, practica["id"], 4).status_code == 201
    mias = client.get("/api/v1/practicas/mias", headers=auth(client, ESTUDIANTE)).json()
    assert mias[0]["estado"] == "en_curso"


def test_no_se_registran_horas_futuras(client):
    practica = practica_aprobada(client)
    manana = (date.today() + timedelta(days=1)).isoformat()
    assert registrar_horas(client, practica["id"], 4, fecha=manana).status_code == 400


def test_maximo_12_horas_por_dia(client):
    practica = practica_aprobada(client)
    assert registrar_horas(client, practica["id"], 8).status_code == 201
    assert registrar_horas(client, practica["id"], 5).status_code == 400


def test_no_supera_las_horas_requeridas(client):
    practica = practica_aprobada(client, horas_exigidas=10)
    ayer = (date.today() - timedelta(days=1)).isoformat()
    assert registrar_horas(client, practica["id"], 8).status_code == 201
    assert registrar_horas(client, practica["id"], 4, fecha=ayer).status_code == 400


def test_empresa_no_registra_horas(client):
    practica = practica_aprobada(client)
    r = client.post(f"/api/v1/practicas/{practica['id']}/horas",
                    json={"fecha": date.today().isoformat(), "horas": 4},
                    headers=auth(client, EMPRESA))
    assert r.status_code == 403


def test_progreso_solo_cuenta_horas_confirmadas(client):
    practica = practica_aprobada(client, horas_exigidas=100)
    registro = registrar_horas(client, practica["id"], 4).json()
    url = f"/api/v1/practicas/{practica['id']}/progreso"

    progreso = client.get(url, headers=auth(client, ESTUDIANTE)).json()
    assert progreso["horas_confirmadas"] == 0
    assert progreso["horas_pendientes"] == 4
    assert progreso["porcentaje"] == 0

    confirmar_horas(client, registro["id"])
    progreso = client.get(url, headers=auth(client, ESTUDIANTE)).json()
    assert progreso["porcentaje"] == 4.0


def test_un_registro_no_se_revisa_dos_veces(client):
    practica = practica_aprobada(client)
    registro = registrar_horas(client, practica["id"], 4).json()
    confirmar_horas(client, registro["id"])
    r = client.patch(f"/api/v1/horas/{registro['id']}/confirmar", headers=auth(client, EMPRESA))
    assert r.status_code == 400


def test_empresa_ajena_no_confirma_horas(client):
    practica = practica_aprobada(client)
    registro = registrar_horas(client, practica["id"], 4).json()
    r = client.patch(f"/api/v1/horas/{registro['id']}/confirmar", headers=auth(client, OTRA_EMPRESA))
    assert r.status_code == 403