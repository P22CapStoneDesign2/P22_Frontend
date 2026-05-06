/*인증 api 함수 모음 작성*/
import instance from './axios';

export const login = (email, password) => instance.post('/api/auth/login', { email, password });
export const signup = (data) => instance.post('/api/auth/signup', data);
export const reissue = (refreshToken) => instance.post('/api/auth/reissue', { refreshToken });
export const logout = (refreshToken) => instance.post('/api/auth/logout', { refreshToken });