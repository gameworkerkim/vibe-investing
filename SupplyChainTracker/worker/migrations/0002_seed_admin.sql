INSERT INTO users (email, password_hash, role, must_change_password)
VALUES (
  'testcode@naver.com',
  'pbkdf2_sha256$100000$7363742d736565642d73616c742d7631$28b2e9555e055d8f44ece864140a6548de335b19a9f914725262c6e9d1e59c3e',
  'admin',
  1
);
