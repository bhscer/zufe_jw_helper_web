import { api as request } from '../../boot/axios';
import md5 from 'js-md5';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace user {
  export interface UserInfo {
    stuid: string;
    token: string;
    stuname: string;
    className: string;
    adminDict: { [key: string]: string[] };
  }

  const base = (key: string) => {
    return `user/${key}`;
  };

  export interface LoginForm {
    stuid: string;
    pwd: string;
  }
  export function login(data: LoginForm) {
    data.pwd = md5(data.pwd);
    return request.post<UserInfo>(base('login'), data);
  }
  export function logout() {
    return request.post(base('logout'));
  }

  export interface RegisterForm {
    stuid: string;
    pwd: string;
    cookies: string;
  }
  export function register(data: RegisterForm) {
    data.pwd = md5(data.pwd);
    return request.post<UserInfo>(base('register'), data);
  }

  export function auth() {
    return request<UserInfo>({
      method: 'post',
      url: base('auth'),
    });
  }
}
