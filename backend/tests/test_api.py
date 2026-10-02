"""API integration tests for AquaLink OneHealth FastAPI endpoints."""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["stations_loaded"] >= 10

def test_get_streams_endpoint():
    response = client.get("/api/v1/streams")
    assert response.status_code == 200
    streams = response.json()
    assert len(streams) >= 10
    first = streams[0]
    assert "stream_name" in first
    assert "assessment" in first
    assert "composite_one_health_score" in first["assessment"]

def test_get_stream_by_id():
    # First get list to pick an ID
    res = client.get("/api/v1/streams")
    stream_id = res.json()[0]["id"]
    
    response = client.get(f"/api/v1/streams/{stream_id}")
    assert response.status_code == 200
    assert response.json()["id"] == stream_id

def test_validate_observation_draft():
    draft = {
        "stream_name": "Rapid Preview Run",
        "latitude": 45.5,
        "longitude": -122.6,
        "catchment_basin": "Preview Basin",
        "observer_name": "Previewer",
        "readings": {
            "temperature_c": 13.0,
            "ph": 7.4,
            "dissolved_oxygen_mg_l": 10.0,
            "turbidity_ntu": 3.0
        },
        "bio": {
            "mayfly_nymphs": 5
        },
        "visual": {
            "water_clarity": "crystal_clear",
            "water_odor": "none"
        }
    }
    response = client.post("/api/v1/observations/validate", json=draft)
    assert response.status_code == 200
    val = response.json()
    assert val["status"] == "VERIFIED"
    assert val["confidence_score"] >= 90.0

def test_submit_citizen_observation():
    new_obs = {
        "stream_name": "Hackathon Demo Creek",
        "latitude": 45.5123,
        "longitude": -122.6456,
        "catchment_basin": "Central Watershed",
        "observer_name": "Team OneAquaHealth",
        "observer_tier": "Citizen Volunteer",
        "notes": "Live observation submitted during hackathon evaluation",
        "readings": {
            "temperature_c": 15.2,
            "ph": 7.1,
            "dissolved_oxygen_mg_l": 8.7,
            "turbidity_ntu": 4.5,
            "conductivity_us_cm": 180.0
        },
        "bio": {
            "mayfly_nymphs": 6,
            "caddisfly_larvae": 4,
            "dragonfly_nymphs": 2
        },
        "visual": {
            "water_clarity": "crystal_clear",
            "water_odor": "none",
            "flow_rate": "moderate_riffle"
        }
    }
    response = client.post("/api/v1/observations", json=new_obs)
    assert response.status_code == 200
    rec = response.json()
    assert rec["stream_name"] == "Hackathon Demo Creek"
    assert rec["assessment"]["composite_one_health_score"] > 70.0
    assert rec["assessment"]["validation"]["status"] == "VERIFIED"

def test_alerts_endpoint():
    response = client.get("/api/v1/alerts")
    assert response.status_code == 200
    data = response.json()
    assert "total_active_alerts" in data
    assert "alerts" in data
    assert isinstance(data["alerts"], list)

def test_stats_endpoint():
    response = client.get("/api/v1/stats")
    assert response.status_code == 200
    stats = response.json()
    assert "total_monitoring_stations" in stats
    assert "mean_one_health_score" in stats
    assert "advisories" in stats

def test_fhir_bundle_endpoint():
    response = client.get("/api/v1/fhir/bundle")
    assert response.status_code == 200
    bundle = response.json()
    assert bundle["resourceType"] == "Bundle"
    assert bundle["total"] > 20

def test_ogc_geojson_endpoint():
    response = client.get("/api/v1/ogc/geojson")
    assert response.status_code == 200
    geojson = response.json()
    assert geojson["type"] == "FeatureCollection"
    assert len(geojson["features"]) >= 10
    feature = geojson["features"][0]
    assert feature["geometry"]["type"] == "Point"
    assert "one_health_score" in feature["properties"]
