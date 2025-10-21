const getters = {
    name: (state) => state.user.name,
    id: (state) => state.user.id,
    code: (state) => state.user.code,
    fullName: (state) => state.user.fullName,
    username: (state) => state.user.username,
    role: (state) => state.user.role,
    token: (state) => state.user.token,
    isLoggedIn: (state) => !!state.user.token,
}
export default getters;