"""Markets core stub for vi_quant."""
import datetime as dt


class PricingContext:
    """Minimal PricingContext stub.
    Full implementation (batching, scenario handling) planned for Phase 2.
    """

    __current = None

    def __init__(self, *args, **kwargs):
        self.pricing_date = dt.date.today()
        self._entered = False

    def is_entered(self):
        return self._entered

    def __enter__(self):
        self._entered = True
        return self

    def __exit__(self, *args):
        self._entered = False

    @classmethod
    def current(cls):
        if cls.__current is None:
            cls.__current = cls()
        return cls.__current

    @classmethod
    def update_current(cls, ctx):
        cls.__current = ctx
