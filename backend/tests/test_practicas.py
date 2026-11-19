from tests.helpers import (
    COORDINADOR, ESTUDIANTE, auth, practica_aprobada, practica_postulada,
)


def aprobar(client, practica_id, email=COORDINADOR):
    return client.patch(f"/api/v1/practicas/{practica_id}/aprobar", json={},
                        headers=auth(client, email))


def rechazar(client, practica_id, observaciones="Horario incompatible con clases."):
    return client.patch(f"/api/v1/practicas/{practica_id}/rechazar",
                        json={"observaciones": observaciones}, headers=auth(client, COORDINADOR))


def test_coordinador_aprueba_practica(client):
    practica = practica_postulada(client)
    r = aprobar(client, practica["id"])
    assert r.status_code == 200
    assert r.json()["estado"] == "aprobada"
    assert r.json()["coordinador_id"] is not None


def test_no_se_aprueba_dos_veces(client):
    practica = practica_postulada(client)
    aprobar(client, practica["id"])
    assert aprobar(client, practica["id"]).status_code == 400


def test_estudiante_no_aprueba(client):
    practica = practica_postulada(client)
    assert aprobar(client, practica["id"], email=ESTUDIANTE).status_code == 403


def test_rechazo_exige_observaciones(client):
    practica = practica_postulada(client)
    assert rechazar(client, practica["id"], observaciones="").status_code == 422


def test_rechazo_reabre_la_vacante(client):
    practica = practica_postulada(client)
    r = rechazar(client, practica["id"])
    assert r.json()["estado"] == "rechazada"

    vacante = client.get(f"/api/v1/vacantes/{practica['vacante_id']}",
                         headers=auth(client, COORDINADOR)).json()
    assert vacante["estado"] == "activa"


def test_no_se_rechaza_una_practica_aprobada(client):
    practica = practica_aprobada(client)
    assert rechazar(client, practica["id"]).status_code == 400


def test_estudiante_recibe_notificacion_de_aprobacion(client):
    practica = practica_postulada(client)
    aprobar(client, practica["id"])
    r = client.get("/api/v1/notificaciones/mias", headers=auth(client, ESTUDIANTE))
    assert any("aprobada" in n["mensaje"] for n in r.json())