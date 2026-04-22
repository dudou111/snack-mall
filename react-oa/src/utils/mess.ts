
import { message } from 'antd';


export function useFun (text:string){
    const [messageApi] = message.useMessage();

    messageApi.open({
        type: 'error',
        content: text,
    });

}
