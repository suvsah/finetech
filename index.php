<?php

declare(strict_types=1);

$dbFile = __DIR__ . '/todo.sqlite';
$pdo = new PDO('sqlite:' . $dbFile);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$pdo->exec(
    'CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        is_done INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )'
);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'add') {
        $title = trim((string) ($_POST['title'] ?? ''));
        if ($title !== '') {
            $stmt = $pdo->prepare('INSERT INTO todos (title) VALUES (:title)');
            $stmt->execute([':title' => $title]);
        }
    }

    if ($action === 'toggle') {
        $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
        if ($id) {
            $stmt = $pdo->prepare('UPDATE todos SET is_done = CASE WHEN is_done = 1 THEN 0 ELSE 1 END WHERE id = :id');
            $stmt->execute([':id' => $id]);
        }
    }

    if ($action === 'delete') {
        $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
        if ($id) {
            $stmt = $pdo->prepare('DELETE FROM todos WHERE id = :id');
            $stmt->execute([':id' => $id]);
        }
    }

    header('Location: /');
    exit;
}

$todos = $pdo->query('SELECT id, title, is_done, created_at FROM todos ORDER BY id DESC')->fetchAll(PDO::FETCH_ASSOC);
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>PHP Todo App</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="card">
    <h1>PHP Todo App</h1>

    <form method="post" class="add-form">
      <input type="hidden" name="action" value="add">
      <input type="text" name="title" placeholder="What needs to be done?" required maxlength="160">
      <button type="submit">Add</button>
    </form>

    <ul class="todo-list">
      <?php if (count($todos) === 0): ?>
        <li class="empty">No tasks yet. Add your first todo.</li>
      <?php endif; ?>

      <?php foreach ($todos as $todo): ?>
        <li class="todo-item <?= (int) $todo['is_done'] === 1 ? 'done' : '' ?>">
          <form method="post" class="inline-form">
            <input type="hidden" name="action" value="toggle">
            <input type="hidden" name="id" value="<?= (int) $todo['id'] ?>">
            <button type="submit" class="toggle" aria-label="Toggle todo status">
              <?= (int) $todo['is_done'] === 1 ? '✅' : '⬜' ?>
            </button>
          </form>

          <span class="title"><?= htmlspecialchars((string) $todo['title'], ENT_QUOTES, 'UTF-8') ?></span>

          <form method="post" class="inline-form">
            <input type="hidden" name="action" value="delete">
            <input type="hidden" name="id" value="<?= (int) $todo['id'] ?>">
            <button type="submit" class="delete" aria-label="Delete todo">Delete</button>
          </form>
        </li>
      <?php endforeach; ?>
    </ul>
  </main>
</body>
</html>
