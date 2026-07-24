<?php

namespace App\Recursion;

class RecursiveDemo {
    public function methodA(int $count): void {
        if ($count > 0) {
            $this->methodB($count - 1);
        }
    }

    public function methodB(int $count): void {
        if ($count > 0) {
            $this->methodA($count - 1);
        }
    }
}
