// initial state
const state = {
    date: null,
    filter:null,
    search:null
}

// getters
const getters = {}

// actions
const actions = {
    selectDate({ commit }, o) {
        commit('setDate', o)
    },
    selectFilter({ commit }, o) {
        commit('setFilter', o)
    },
    selectSearch({ commit }, o) {
        commit('setSearch', o)
    }
}

// mutations
const mutations = {
    setDate(state, o) {
        state.date = o
    },
    setFilter(state, o) {
        state.filter = o
    },
    setSearch(state, o) {
        state.search = o
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
