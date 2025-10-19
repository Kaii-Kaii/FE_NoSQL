import { createStore } from 'vuex'

import getters from './getters'
import moduleUser from './user'


const store = createStore({
  modules: {
    user: moduleUser,
  },
  getters
})


export default store
