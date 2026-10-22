"""Offline regression tests; never signal the running kiosk."""

from io import BytesIO
from pathlib import Path
import runpy
import subprocess
import tempfile
import unittest
from unittest.mock import patch
from urllib.error import URLError


updater = runpy.run_path(str(Path(__file__).parent / "usr/local/bin/dm-monitor-update"))
namespace = updater["check_update"].__globals__
FIRST = "a" * 40
SECOND = "b" * 40


class UpdateTests(unittest.TestCase):
    def check_with(self, directory, payload, restart):
        with patch.dict(namespace, urlopen=lambda *args, **kwargs: BytesIO(payload)):
            with patch.object(namespace["subprocess"], "run", restart):
                updater["check_update"]("https://example.org/version.json", Path(directory))

    def test_first_check_unchanged_then_new_version(self):
        from unittest.mock import Mock
        restart = Mock()
        with tempfile.TemporaryDirectory() as directory:
            state = Path(directory) / "version"
            self.check_with(directory, ('{"commit":"%s"}' % FIRST).encode(), restart)
            self.assertEqual(state.read_text().strip(), FIRST)
            self.check_with(directory, ('{"commit":"%s"}' % FIRST).encode(), restart)
            restart.assert_not_called()
            self.check_with(directory, ('{"commit":"%s"}' % SECOND).encode(), restart)
            restart.assert_called_once()
            self.assertEqual(restart.call_args.args[0][-2:], ["-x", "cage"])
            self.assertEqual(state.read_text().strip(), SECOND)
            self.check_with(directory, ('{"commit":"%s"}' % SECOND).encode(), restart)
            restart.assert_called_once()

    def test_invalid_response_preserves_state_and_does_not_restart(self):
        from unittest.mock import Mock
        restart = Mock()
        with tempfile.TemporaryDirectory() as directory:
            state = Path(directory) / "version"
            state.write_text(FIRST)
            for payload in (b"<html>404</html>", b"{}", b"[]", b'{"commit": 42}', b"x" * 4097):
                with self.subTest(payload=payload[:40]):
                    with self.assertRaises(ValueError):
                        self.check_with(directory, payload, restart)
                    self.assertEqual(state.read_text(), FIRST)
            restart.assert_not_called()

    def test_network_error_does_not_restart(self):
        from unittest.mock import Mock
        restart = Mock()
        with tempfile.TemporaryDirectory() as directory:
            with patch.dict(namespace, urlopen=Mock(side_effect=URLError("offline"))):
                with patch.object(namespace["subprocess"], "run", restart):
                    with self.assertRaises(URLError):
                        updater["check_update"]("https://example.org/version.json", Path(directory))
            restart.assert_not_called()
            self.assertFalse((Path(directory) / "version").exists())

    def test_failed_restart_is_retried(self):
        from unittest.mock import Mock
        restart = Mock(side_effect=subprocess.CalledProcessError(1, "pkill"))
        with tempfile.TemporaryDirectory() as directory:
            state = Path(directory) / "version"
            state.write_text(FIRST)
            with self.assertRaises(subprocess.CalledProcessError):
                self.check_with(directory, ('{"commit":"%s"}' % SECOND).encode(), restart)
            self.assertEqual(state.read_text(), FIRST)
            restart.side_effect = None
            self.check_with(directory, ('{"commit":"%s"}' % SECOND).encode(), restart)
            self.assertEqual(restart.call_count, 2)
            self.assertEqual(state.read_text().strip(), SECOND)


if __name__ == "__main__":
    unittest.main()
