import { login, refreshToken } from '@/api/auth'
import router from '@/router'
import { ElMessage } from 'element-plus'

const restoreUserFromStorage = (commit) => {
    try {
        const storedUser = localStorage.getItem('user')
        const storedToken = localStorage.getItem('token')

        if (!storedUser || !storedToken) {
            return false
        }

    const parsedUser = JSON.parse(storedUser)
    const normalizedToken = storedToken === 'undefined' ? null : storedToken

    commit('SET_CODE', parsedUser.code || null)
    commit('SET_FULLNAME', parsedUser.fullName || null)
    commit('SET_USERNAME', parsedUser.username || null)
    commit('SET_ROLE', parsedUser.role || null)
    commit('SET_TOKEN', normalizedToken)

    return !!normalizedToken
    } catch (error) {
        console.error('Failed to restore user from storage:', error)
        return false
    }
}

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
    async login({ commit }, userInfo) {
        try {
            const resData = await login(userInfo)

            // If backend indicates account not verified, backend may respond with 4xx.
            // Some backends return 200 with a status field; handle that here as well.
            if (resData && (resData.status === 'ChuaXacMinh' || resData.account?.status === 'ChuaXacMinh')) {
                // throw a controlled error so caller can handle (UI will show message)
                const err = new Error('Tài khoản chưa xác minh. Vui lòng kiểm tra email.')
                err.response = { data: { message: 'Tài khoản chưa xác minh' }, status: 401 }
                throw err
            }

            if (resData?.code) {
                localStorage.setItem('user', JSON.stringify(resData))
                localStorage.setItem('token', resData.code)

                commit('SET_CODE', resData.code)
                commit('SET_FULLNAME', resData.fullName)
                commit('SET_USERNAME', resData.username)
                commit('SET_ROLE', resData.role)
                commit('SET_TOKEN', resData.code)

                ElMessage.success('Đăng nhập thành công!')
            }

            // chờ ngắn để người dùng kịp thấy thông báo thành công
            await new Promise((resolve) => setTimeout(resolve, 300))

            const roleNormalized = (resData?.role || '').toLowerCase()
            const isAdmin = roleNormalized === 'admin'
            const isCustomer = roleNormalized === 'khachhang'
            const targetRoute = isAdmin ? { name: 'admin-order' } : { name: 'home' }

            if (!isAdmin && !isCustomer) {
                console.warn('Unknown role detected during login, defaulting to home:', resData?.role)
            }

            await router.replace(targetRoute)
        } catch (error) {
            ElMessage.error(error?.response?.data?.message || 'Đăng nhập thất bại!')
            throw error
        }
    },

    refreshToken({ commit }) {
        return new Promise((resolve) => {
            const hasSession = restoreUserFromStorage(commit)

            if (!hasSession) {
                resolve()
                return
            }

            refreshToken()
                .then((resData) => {
                    if (resData?.code) {
                        localStorage.setItem('user', JSON.stringify(resData))
                        localStorage.setItem('token', resData.code)

                        commit('SET_CODE', resData.code)
                        commit('SET_FULLNAME', resData.fullName)
                        commit('SET_USERNAME', resData.username)
                        commit('SET_ROLE', resData.role)
                        commit('SET_TOKEN', resData.code)
                    }
                    resolve()
                })
                .catch((error) => {
                    console.warn('refreshToken request failed, keeping existing session.', error)
                    if (error?.response?.status === 401) {
                        ElMessage.warning('Phiên đăng nhập có thể đã hết hạn. Vui lòng đăng nhập lại nếu gặp lỗi khi sử dụng.')
                    }
                    resolve()
                })
        })
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
