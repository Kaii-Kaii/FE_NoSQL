import { login, refreshToken } from '@/api/auth'
import router from '@/router'
import { ElMessage } from 'element-plus'

const state = {
    code: null,
    fullName: null,
    username: null,
    role: null,
    token: null,
};

const mutations = {
    SET_CODE: (state, code) => {
        state.code = code;
    },
    SET_FULLNAME: (state, fullName) => {
        state.fullName = fullName;
    },
    SET_USERNAME: (state, username) => {
        state.username = username;
    },
    SET_ROLE: (state, role) => {
        state.role = role;
    },
    SET_TOKEN: (state, token) => {
        state.token = token;
    },
    LOGOUT: (state) => {
        state.code = null;
        state.fullName = null;
        state.username = null;
        state.role = null;
        state.token = null;
    }
};

const actions = {
    // user login
    login({ commit }, userInfo) {
        return new Promise((resolve, reject) => {
            login(userInfo)
                .then((resData) => {
                    // Lưu thông tin user và token từ API response
                    // Response format: { code: "...", fullName: "...", username: "...", role: "..." }
                    if(resData.code) {
                        localStorage.setItem('user', JSON.stringify(resData));
                        localStorage.setItem('token', resData.code);
                        
                        // Cập nhật state
                        commit('SET_CODE', resData.code);
                        commit('SET_FULLNAME', resData.fullName);
                        commit('SET_USERNAME', resData.username);
                        commit('SET_ROLE', resData.role);
                        commit('SET_TOKEN', resData.code);
                        
                        ElMessage.success('Đăng nhập thành công!');
                    }
                    // Delay một chút trước khi redirect để thông báo hiện ra
                    setTimeout(() => {
                        router.replace('/home');
                        resolve();
                    }, 500);
                })
                .catch((error) => {
                    ElMessage.error(error.response?.data?.message || 'Đăng nhập thất bại!');
                    reject(error);
                });
        });
    },

    refreshToken({ commit }) {
        return new Promise((resolve, reject) => {
            refreshToken()
                .then((resData) => {
                    if(resData.code) {
                        localStorage.setItem('user', JSON.stringify(resData));
                        localStorage.setItem('token', resData.code);
                        
                        commit('SET_CODE', resData.code);
                        commit('SET_FULLNAME', resData.fullName);
                        commit('SET_USERNAME', resData.username);
                        commit('SET_ROLE', resData.role);
                        commit('SET_TOKEN', resData.code);
                    }
                    resolve();
                })
                .catch((error) => {
                    router.push({ name: 'login' });                                    
                    reject(error);
                });
        });
    },

    // Logout
    logout({ commit }) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        commit('LOGOUT');
        router.push({ name: 'login' });
    }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
