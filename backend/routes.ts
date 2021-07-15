import { Router } from "express";
const apiRoutes = Router();

apiRoutes.route('/').get((req, res) => {
    res.send({test: 'Hello world!'});
});

export { apiRoutes };