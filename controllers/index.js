'use strict';

const router = require('express').Router();

router.use('/', require('./homeController'));
router.use('/login', require('./loginController'));
router.use('/account', require('./accountController'));
router.use('/api', require('../kurento').router);

module.exports = router;
