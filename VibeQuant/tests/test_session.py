"""Test ViSession, Environment, and the vi_quant import chain."""

import pytest
from vi_quant.session import ViSession, Environment, PassThroughSession
from vi_quant.errors import MqUninitialisedError, MqError, MqRequestError, MqAuthenticationError


class TestViSession:

    def test_default_is_embedded(self):
        """ViSession.use() should default to embedded mode with no credentials."""
        s = ViSession.use()
        assert s.is_embedded() is True
        assert s.domain is None
        assert s.client_id is None
        assert s.client_secret is None

    def test_current(self):
        """ViSession.current() should return the active session."""
        ViSession.use()
        current = ViSession.current()
        assert current.is_embedded() is True

    def test_current_raises_when_no_session(self, monkeypatch):
        """ViSession.current() should raise MqUninitialisedError if no session was created."""
        monkeypatch.setattr(ViSession, "_ViSession__current", None)
        with pytest.raises(MqUninitialisedError):
            ViSession.current()

    def test_environment_prod_has_default_url(self):
        """Environment.PROD should resolve to the configured production VI URL."""
        s = ViSession(environment=Environment.PROD)
        assert not s.is_embedded()
        assert "localhost" in s.domain

    def test_get_does_not_activate(self):
        """ViSession.get() should not set the global current session."""
        ViSession.use()  # activate one
        s2 = ViSession.get()
        assert ViSession.current() is not s2

    def test_pass_through_session(self):
        """PassThroughSession should carry a token."""
        s = PassThroughSession(token="test-token", environment=Environment.QA)
        assert s.token == "test-token"
        assert not s.is_embedded()


class TestImportChain:

    def test_import_session(self):
        """Bare-minimum smoke: import vi_quant.session should work."""
        import vi_quant.session
        assert hasattr(vi_quant.session, "ViSession")
        assert hasattr(vi_quant.session, "Environment")
        assert hasattr(vi_quant.session, "PassThroughSession")

    def test_import_errors(self):
        """Error hierarchy should be importable."""
        from vi_quant.errors import MqError, MqValueError, MqTypeError, MqRequestError
        from vi_quant.errors import MqAuthenticationError, MqUninitialisedError


class TestErrors:

    def test_mq_request_error_attributes(self):
        """MqRequestError should carry status, message, and context."""
        err = MqRequestError(503, "Service Unavailable", context={"retry_after": 30})
        assert err.status == 503
        assert err.message == "Service Unavailable"
        assert err.context["retry_after"] == 30

    def test_mq_authentication_error_matches_gs_quant_signature(self):
        err = MqAuthenticationError(401, "Bad credentials")
        assert err.status == 401
        assert err.message == "Bad credentials"

    def test_timeseries_smoke(self):
        import vi_quant.timeseries
        assert hasattr(vi_quant.timeseries, "returns")
        assert hasattr(vi_quant.timeseries, "volatility")
        assert hasattr(vi_quant.timeseries, "moving_average")
