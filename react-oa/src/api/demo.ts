// 二次封装
import { request, http } from "@/utils/request";

// axios官网  https://axios-http.com/zh/docs/instance
// 以下是可用的实例方法。指定的配置将与实例的配置合并。
// axios#request(config)
// axios#get(url[, config])
// axios#delete(url[, config])
// axios#head(url[, config])
// axios#options(url[, config])
// axios#post(url[, data[, config]])
// axios#put(url[, data[, config]])
// axios#patch(url[, data[, config]])
// axios#getUri([config])

//写法1
export function getInfo1() {
  return http.post<InfoRes>("/api/common/getInfo", {
    url: "/api/common/getInfo",
    method: "GET",
  });
}

//写法2
export function getInfo2(): Promise<InfoRes> {
  return request.request({
    url: "/api/common/getInfo",
    method: "GET",
  });
}

interface InfoRes {
  token: string;
}
