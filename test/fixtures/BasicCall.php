<?php

namespace App\Services;

class UserService {
    public function getUser(int $id): array {
        return ['id' => $id, 'name' => 'John'];
    }

    public function findUser(int $id): array {
        return $this->getUser($id);
    }

    public function processUser(int $id): void {
        $user = $this->findUser($id);
        $this->notifyUser($user);
    }

    public function notifyUser(array $user): void {
        // Notification logic
    }
}
