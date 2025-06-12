<?php

/*************************************************************
 * unload.php – Gibt alle Datensätze aus der Tabelle 'stefdata' aus
 * als JSON (z. B. für Visualisierung oder Debugging)
 *************************************************************/

header('Content-Type: application/json');

// Datenbankverbindung einbinden
require_once("db_config.php");

// DB-Verbindung
try {
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "DB connection failed", "details" => $e->getMessage()]);
    exit;
}   

try {
    // SQL-Abfrage: Alle Daten abrufen, sortiert nach Zeit absteigend
    $sql = "SELECT id, wert, zeit FROM stefdata ORDER BY zeit DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    // Alle Datensätze als Array holen
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Ausgabe als JSON
    echo json_encode(["daten" => $rows]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Query failed", "details" => $e->getMessage()]);
}
?>