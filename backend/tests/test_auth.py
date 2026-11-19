from tests.helpers import COORDINADOR, ESTUDIANTE, GESTOR, PASSWORD, auth

LOGIN = "/api/v1/auth/login"


def intentar(client, email, password):
    return client.post(LOGIN, json={"email": email, "password": password})


def test_login_correcto(client):
    r = intentar(client, ESTUDIANTE, PASSWORD)
    assert r.status_code == 200
    assert r.json()["rol"] == "estudiante"
    assert r.json()["access_token"]


def test_clave_incorrecta(client):
    assert intentar(client, ESTUDIANTE, "incorrecta").status_code == 401


def test_me_sin_token(client):
    assert client.get("/api/v1/auth/me").status_code == 401


def test_bloqueo_tras_tres_intentos(client):
    for _ in range(3):
        assert intentar(client, GESTOR, "mala").status_code == 401
    # Con la cuenta ya bloqueada, ni la clave correcta entra
    assert intentar(client, GESTOR, PASSWORD).status_code == 423


def test_coordinador_desbloquea_cuenta(client):
    for _ in range(3):
        intentar(client, GESTOR, "mala")
    headers = auth(client, COORDINADOR)

    bloqueados = client.get("/api/v1/auth/bloqueados", headers=headers).json()
    assert [u["email"] for u in bloqueados] == [GESTOR]

    r = client.patch(f"/api/v1/auth/usuarios/{bloqueados[0]['id']}/desbloquear", headers=headers)
    assert r.status_code == 204
    assert intentar(client, GESTOR, PASSWORD).status_code == 200


def test_estudiante_no_ve_bloqueados(client):
    r = client.get("/api/v1/auth/bloqueados", headers=auth(client, ESTUDIANTE))
    assert r.status_code == 403


def test_cambiar_password(client):
    headers = auth(client, ESTUDIANTE)
    r = client.post("/api/v1/auth/cambiar-password", headers=headers,
                    json={"password_actual": PASSWORD, "password_nueva": "Nueva12345"})
    assert r.status_code == 204
    assert intentar(client, ESTUDIANTE, "Nueva12345").status_code == 200
    assert intentar(client, ESTUDIANTE, PASSWORD).status_code == 401