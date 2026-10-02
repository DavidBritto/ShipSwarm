"""Unit tests for Sentinel-CloudWatch telemetry tools."""

from unittest.mock import MagicMock
import pytest
from shipswarm.tools.aws_telemetry import audit_cloudwatch_telemetry, query_cloudwatch_metrics


def test_query_cloudwatch_metrics_mocked():
    mock_session = MagicMock()
    mock_cw = MagicMock()
    mock_session.client.return_value = mock_cw

    mock_cw.get_metric_data.return_value = {
        "MetricDataResults": [
            {"Id": "invocations", "Values": [100.0, 50.0]},
            {"Id": "errors", "Values": [3.0]},
            {"Id": "latency", "Values": [45.2, 52.8]},
        ]
    }

    result = query_cloudwatch_metrics(
        region_name="us-east-1",
        time_window_minutes=15,
        boto_session=mock_session,
    )

    assert result["mode"] == "live"
    assert result["invocations"] == 150
    assert result["error_count"] == 3
    assert result["error_rate"] == 2.0  # 3 / 150 * 100
    assert result["avg_duration_ms"] == 98.0


def test_query_cloudwatch_fallback():
    mock_session = MagicMock()
    mock_session.client.side_effect = Exception("AWS AccessDenied")

    result = query_cloudwatch_metrics(boto_session=mock_session)

    assert result["mode"] == "simulated"
    assert "Live CloudWatch query failed" in result["notice"]
    assert result["invocations"] > 0
