const express = require('express');
const router = express.Router();
const verifyJWT = require('../../middleware/verifyJWT');         // your existing JWT middleware
const {
    getAllAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin
} = require('../../controllers/superadmin_controllers/superAdminManageAdmins');

router.get('/',        getAllAdmins); 
router.post('/',       createAdmin);    
router.put('/:id',     updateAdmin);    
router.delete('/:id',  deleteAdmin);   
 
module.exports = router;