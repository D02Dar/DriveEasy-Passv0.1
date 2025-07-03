import { createStore } from 'vuex'
import auth from './modules/auth'
import app from './modules/app'

const store = createStore({
  modules: {
    auth,
    app
  },
  
  state: {
    // 全局状态
    loading: false,
    error: null
  },
  
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    
    SET_ERROR(state, error) {
      state.error = error
    },
    
    CLEAR_ERROR(state) {
      state.error = null
    }
  },
  
  actions: {
    setLoading({ commit }, loading) {
      commit('SET_LOADING', loading)
    },
    
    setError({ commit }, error) {
      commit('SET_ERROR', error)
    },
    
    clearError({ commit }) {
      commit('CLEAR_ERROR')
    }
  },
  
  getters: {
    isLoading: state => state.loading,
    hasError: state => !!state.error,
    errorMessage: state => state.error
  }
})

export default store
