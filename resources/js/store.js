import { createStore } from 'vuex';
import axios from 'axios';

export default createStore({
    state: {
        user: null,
        roles: [],
    },
    mutations: {
        setUser(state, user) {
            state.user = user;
        },
        setRoles(state, roles) {
            state.roles = roles;
        }
    },
    actions: {
        async fetchUser({ commit }) {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get('/me', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    const user = response.data.user;
                    const roles = user.roles || [];
                    commit('setUser', user);
                    commit('setRoles', roles.map(role => role.name));
                } catch (error) {
                    console.error('Error fetching user roles:', error);
                }
            }
        },
        logout({ commit }) {
            localStorage.removeItem('token');
            commit('setUser', null);
            commit('setRoles', []);
        }
    },
    getters: {
        isAdmin: state => state.roles.includes('admin'),
        isAuthenticated: state => !!state.user,
    }
});
