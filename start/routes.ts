/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// License routes
router.group(() => {
  router.get('/', '#controllers/licenses_controller.index')
  router.post('/', '#controllers/licenses_controller.store')
  router.get('/:id', '#controllers/licenses_controller.show')
  router.put('/:id', '#controllers/licenses_controller.update')
  router.delete('/:id', '#controllers/licenses_controller.destroy')
  router.post('/:id/revoke', '#controllers/licenses_controller.revoke')
  router.post('/validate', '#controllers/licenses_controller.validate')
  router.get('/client/:clientId', '#controllers/licenses_controller.getByClientId')
  
  // Point de vente routes
  router.put('/:id/point-de-vente', '#controllers/licenses_controller.updatePointDeVente')
  router.get('/point-de-vente/range', '#controllers/licenses_controller.getByPointDeVenteRange')
}).prefix('/api/licenses')
