def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ONLINE"
    assert "service" in data

def test_dashboard_endpoint(client):
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "current_temperature" in data
    assert "current_humidity" in data
    assert "fan_status" in data
    assert "operating_mode" in data

def test_fan_control_endpoint(client):
    response = client.post(
        "/api/fan/control",
        json={"status": "ON", "speed": 75.0, "mode": "MANUAL"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ON"
    assert data["speed"] == 75.0
    assert data["mode"] == "MANUAL"

def test_system_settings_endpoint(client):
    response = client.get("/api/settings")
    assert response.status_code == 200
    data = response.json()
    assert data["low_threshold"] == 25.0

    # Update settings
    update_res = client.put(
        "/api/settings",
        json={"low_threshold": 24.0, "high_threshold": 36.0}
    )
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["low_threshold"] == 24.0
    assert updated_data["high_threshold"] == 36.0

def test_alerts_endpoint(client):
    response = client.get("/api/alerts")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
