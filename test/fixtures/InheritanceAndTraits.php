<?php

namespace App\Core;

interface Loggable {
    public function log(string $msg): void;
}

trait HelperTrait {
    public function formatMessage(string $msg): string {
        return "[LOG] " . $msg;
    }
}

class BaseService implements Loggable {
    use HelperTrait;

    public function log(string $msg): void {
        $formatted = $this->formatMessage($msg);
        echo $formatted;
    }
}

class OrderService extends BaseService {
    public function createOrder(int $orderId): void {
        $this->log("Creating order: " . $orderId);
    }
}
