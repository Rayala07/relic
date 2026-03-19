import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.json({ message: "Welcome to Relic API v1" });
});

export default router;
