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

def test_pilot_city_filtering():
    # Coimbra
    res_coi = client.get("/api/v1/streams?pilot_city=coimbra")
    assert res_coi.status_code == 200
    coi_streams = res_coi.json()
    assert len(coi_streams) == 6
    for s in coi_streams:
        assert s["pilot_city"] == "coimbra"
        assert 39.5 <= s["latitude"] <= 41.0
        assert -9.5 <= s["longitude"] <= -7.5

    # Benevento
    res_ben = client.get("/api/v1/streams?pilot_city=benevento")
    assert res_ben.status_code == 200
    ben_streams = res_ben.json()
    assert len(ben_streams) == 6
    for s in ben_streams:
        assert s["pilot_city"] == "benevento"
        assert 40.5 <= s["latitude"] <= 42.0
        assert 13.5 <= s["longitude"] <= 16.0

    # Oslo
    res_osl = client.get("/api/v1/streams?pilot_city=oslo")
    assert res_osl.status_code == 200
    osl_streams = res_osl.json()
    assert len(osl_streams) == 6
    for s in osl_streams:
        assert s["pilot_city"] == "oslo"
        assert 59.0 <= s["latitude"] <= 61.0
        assert 9.5 <= s["longitude"] <= 12.0

    # Portland
    res_pdx = client.get("/api/v1/streams?pilot_city=portland")
    assert res_pdx.status_code == 200
    pdx_streams = res_pdx.json()
    assert len(pdx_streams) >= 12
    for s in pdx_streams:
        assert s["pilot_city"] == "portland"
        assert 44.5 <= s["latitude"] <= 46.5
        assert -124.5 <= s["longitude"] <= -121.0

def test_pilot_stats_and_alerts_filtering():
    # Coimbra stats
    res_stats = client.get("/api/v1/stats?pilot_city=coimbra")
    assert res_stats.status_code == 200
    stats = res_stats.json()
    assert stats["total_monitoring_stations"] == 6
    assert 0 <= stats["mean_one_health_score"] <= 100

    # Oslo alerts
    res_alerts = client.get("/api/v1/alerts?pilot_city=oslo")
    assert res_alerts.status_code == 200
    alerts_data = res_alerts.json()
    assert "alerts" in alerts_data
    for a in alerts_data["alerts"]:
        assert a["pilot_city"] == "oslo"

def test_watershed_name_and_basin_filtering():
    # Filter streams by river basin names (both full official name and river tokens)
    coi_res = client.get("/api/v1/streams?watershed=Mondego River Basin / Ribeira de Coselhas")
    assert coi_res.status_code == 200
    assert len(coi_res.json()) == 6

    coi_res2 = client.get("/api/v1/streams?watershed=Mondego")
    assert coi_res2.status_code == 200
    assert len(coi_res2.json()) == 6

    ben_res = client.get("/api/v1/streams?watershed=Calore River / Sabato River Basin")
    assert ben_res.status_code == 200
    assert len(ben_res.json()) == 6

    osl_res = client.get("/api/v1/streams?watershed=Akerselva / Alna River Basin")
    assert osl_res.status_code == 200
    assert len(osl_res.json()) == 6

    pdx_res = client.get("/api/v1/streams?watershed=Columbia Slough / Lower Willamette Basin")
    assert pdx_res.status_code == 200
    assert len(pdx_res.json()) >= 12

    # Stats filtering by watershed name
    stats_res = client.get("/api/v1/stats?watershed=Mondego River Basin / Ribeira de Coselhas")
    assert stats_res.status_code == 200
    assert stats_res.json()["total_monitoring_stations"] == 6

    # Alerts filtering by watershed name
    alerts_res = client.get("/api/v1/alerts?watershed=Akerselva / Alna River Basin")
    assert alerts_res.status_code == 200
    for a in alerts_res.json()["alerts"]:
        assert a["pilot_city"] == "oslo"

def test_observation_pilot_city_auto_inference():
    # Coimbra coordinates inference without providing pilot_city
    coi_obs = {
        "stream_name": "Ribeira de Coselhas - Headwaters Reach",
        "latitude": 40.2450,
        "longitude": -8.4120,
        "catchment_basin": "Mondego Basin",
        "observer_name": "Field Tester",
        "readings": {
            "temperature_c": 15.0,
            "ph": 7.5,
            "dissolved_oxygen_mg_l": 9.5,
            "turbidity_ntu": 2.0
        }
    }
    res_coi = client.post("/api/v1/observations", json=coi_obs)
    assert res_coi.status_code == 200
    assert res_coi.json()["pilot_city"] == "coimbra"

    # Oslo coordinates inference
    osl_obs = {
        "stream_name": "Akerselva - Forest Reach",
        "latitude": 59.9670,
        "longitude": 10.7810,
        "catchment_basin": "Akerselva Catchment",
        "observer_name": "Field Tester",
        "readings": {
            "temperature_c": 10.0,
            "ph": 7.1,
            "dissolved_oxygen_mg_l": 11.0,
            "turbidity_ntu": 1.5
        }
    }
    res_osl = client.post("/api/v1/observations", json=osl_obs)
    assert res_osl.status_code == 200
    assert res_osl.json()["pilot_city"] == "oslo"

    # Benevento coordinates inference
    ben_obs = {
        "stream_name": "Fiume Calore Tributary",
        "latitude": 41.1320,
        "longitude": 14.7730,
        "catchment_basin": "Calore River Reach",
        "observer_name": "Field Tester",
        "readings": {
            "temperature_c": 20.0,
            "ph": 7.3,
            "dissolved_oxygen_mg_l": 7.0,
            "turbidity_ntu": 15.0
        }
    }
    res_ben = client.post("/api/v1/observations", json=ben_obs)
    assert res_ben.status_code == 200
    assert res_ben.json()["pilot_city"] == "benevento"

def test_standards_export_pilot_filtering():
    # OGC GeoJSON
    res_ogc = client.get("/api/v1/ogc/geojson?pilot_city=coimbra")
    assert res_ogc.status_code == 200
    features = res_ogc.json()["features"]
    assert len(features) == 7  # 6 seeded + 1 created above in test
    for f in features:
        assert f["properties"]["pilot_city"] == "coimbra"

    # FHIR Bundle
    res_fhir = client.get("/api/v1/fhir/bundle?pilot_city=benevento")
    assert res_fhir.status_code == 200
    bundle = res_fhir.json()
    assert bundle["resourceType"] == "Bundle"
    assert bundle["total"] > 0


