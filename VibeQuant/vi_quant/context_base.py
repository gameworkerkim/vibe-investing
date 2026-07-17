"""
Copyright 2019 Goldman Sachs.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
"""
# Portions modified for vi_quant: namespace renaming (gs_quant→vi_quant, Gs→Vi).

from contextvars import ContextVar

from vi_quant.errors import MqUninitialisedError, MqValueError

_context_vars: dict = {}
_entered_instances: ContextVar = ContextVar('_entered_instances', default=frozenset())


def _get_context_var(key: str) -> ContextVar:
    try:
        return _context_vars[key]
    except KeyError:
        var = ContextVar(key)
        _context_vars[key] = var
        return var


class ContextMeta(type):
    @property
    def __path_key(cls) -> str:
        return '{}_path'.format(cls.__name__)

    @property
    def __default_key(cls) -> str:
        return '{}_default'.format(cls.__name__)

    @classmethod
    def default_value(mcs) -> object:
        return None

    @property
    def path(cls) -> tuple:
        return _get_context_var(cls.__path_key).get(())

    @property
    def current(cls):
        """
        The current instance of this context
        """
        path = cls.path
        current = cls.__default if not path else next(iter(path))
        if current is None:
            raise MqUninitialisedError('{} is not initialised'.format(cls.__name__))

        return current

    @current.setter
    def current(cls, current):
        path = cls.path
        if cls.has_prior:
            raise MqValueError('Cannot set current while in a nested context {}'.format(cls.__name__))

        if len(path) == 1:
            cur = cls.current
            try:
                if cur.is_entered:
                    raise MqValueError('Cannot set current while in a nested context {}'.format(cls.__name__))
            except AttributeError:
                pass

        _get_context_var(cls.__path_key).set((current,))

    @property
    def current_is_set(cls) -> bool:
        return bool(cls.path) or cls.__default is not None

    @property
    def __default(cls):
        default = _get_context_var(cls.__default_key).get(None)
        if default is None:
            default = cls.default_value()
            if default is not None:
                _get_context_var(cls.__default_key).set(default)

        return default

    @property
    def prior(cls):
        path = cls.path
        if len(path) < 2:
            raise MqValueError('Current {} has no prior'.format(cls.__name__))

        return path[1]

    @property
    def has_prior(cls):
        path = cls.path
        return len(path) >= 2

    def push(cls, context):
        _get_context_var(cls.__path_key).set((context,) + cls.path)

    def pop(cls):
        path = cls.path
        _get_context_var(cls.__path_key).set(path[1:])
        return path[0]


class ContextBase(metaclass=ContextMeta):
    def __enter__(self):
        self._cls.push(self)
        _entered_instances.set(_entered_instances.get() | {id(self)})
        self._on_enter()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            self._on_exit(exc_type, exc_val, exc_tb)
        finally:
            self._cls.pop()
            _entered_instances.set(_entered_instances.get() - {id(self)})

    async def __aenter__(self):
        self._cls.push(self)
        _entered_instances.set(_entered_instances.get() | {id(self)})
        await self._on_aenter()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        try:
            await self._on_aexit(exc_type, exc_val, exc_tb)
        finally:
            self._cls.pop()
            _entered_instances.set(_entered_instances.get() - {id(self)})

    @property
    def _cls(self) -> ContextMeta:
        seen = set()
        stack = [self.__class__]
        cls = None

        while stack:
            base = stack.pop()
            if ContextBase in base.__bases__ or ContextBaseWithDefault in base.__bases__:
                cls = base
                break

            if base not in seen:
                seen.add(base)
                stack.extend(b for b in base.__bases__ if issubclass(b, ContextBase))

        return cls or self.__class__

    @property
    def is_entered(self) -> bool:
        return id(self) in _entered_instances.get()

    def _on_enter(self):
        pass

    def _on_exit(self, exc_type, exc_val, exc_tb):
        pass

    async def _on_aenter(self):
        pass

    async def _on_aexit(self, exc_type, exc_val, exc_tb):
        pass


class ContextBaseWithDefault(ContextBase):
    @classmethod
    def default_value(cls) -> object:
        return cls()


try:
    from contextlib import nullcontext
except ImportError:
    from contextlib import AbstractContextManager

    class nullcontext(AbstractContextManager):
        def __init__(self, enter_result=None):
            self.enter_result = enter_result

        def __enter__(self):
            return self.enter_result

        def __exit__(self, exc_type, exc_val, exc_tb):
            pass
