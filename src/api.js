import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://dev2.sunny.net.vn:24253',
});

export default instance;